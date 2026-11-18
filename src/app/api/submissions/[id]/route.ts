import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import { getAdminSession } from "@/lib/auth";
import { manuscriptStatusUpdateSchema } from "@/lib/validations/manuscript";
import { deleteFile } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { sendManuscriptStatusEmail, sendArticlePublishedEmail } from "@/lib/email";

// GET /api/submissions/[id] - Admin view submission details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const submission = await Manuscript.findById(id);
    if (!submission) {
      return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
    }

    const linkedArticle = await Article.findOne({
      $or: [
        { sourceManuscript: id },
        { title: { $regex: new RegExp(`^${submission.title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
      ]
    }).lean();

    return NextResponse.json({ success: true, submission, linkedArticle });
  } catch (error: any) {
    console.error("GET /api/submissions/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve manuscript" },
      { status: 500 }
    );
  }
}

// PATCH /api/submissions/[id] - Admin update status, paymentStatus, adminNotes
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validationResult = manuscriptStatusUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const submission = await Manuscript.findById(id);
    if (!submission) {
      return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
    }

    const previousStatus = submission.status;
    const data = validationResult.data;
    if (data.status) submission.status = data.status;
    if (data.paymentStatus) submission.paymentStatus = data.paymentStatus;
    if (data.adminNotes !== undefined) submission.adminNotes = data.adminNotes;

    await submission.save();

    let emailDispatched = false;
    let publishedArticle: any = null;

    // IF STATUS CHANGED TO PUBLISHED: Automatically create or update the Article so it immediately appears in archives & recent articles
    if (data.status === "published") {
      try {
        let article = await Article.findOne({
          $or: [
            { sourceManuscript: submission._id },
            { title: { $regex: new RegExp(`^${submission.title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
          ]
        });

        if (!article) {
          // Resolve Volume & Issue
          const latestVolume = await Volume.findOne().sort({ volumeNumber: -1 });
          let targetIssue = await Issue.findOne({
            volume: latestVolume?._id,
            status: "published"
          }).sort({ issueNumber: -1 });

          if (!targetIssue && latestVolume) {
            targetIssue = await Issue.findOne({ volume: latestVolume._id }).sort({ issueNumber: -1 });
          }

          if (latestVolume && targetIssue) {
            let baseSlug = slugify(submission.title);
            const existingSlug = await Article.findOne({ slug: baseSlug });
            if (existingSlug) {
              baseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            }

            article = await Article.create({
              title: submission.title,
              slug: baseSlug,
              authors: [
                {
                  name: submission.authorName,
                  affiliation: submission.institution || "",
                  email: submission.authorEmail || "",
                },
                ...(submission.coAuthors || []),
              ],
              abstract: submission.abstract,
              keywords: submission.keywords?.length ? submission.keywords : [submission.category || "General Science"],
              category: submission.category || "General Science",
              volume: latestVolume._id,
              issue: targetIssue._id,
              publicationDate: new Date(),
              doi: (submission as any).doi || undefined,
              status: "published",
              sourceManuscript: submission._id,
              pdfFile: submission.pdfFile || undefined,
            });
            console.log(`[AutoPublish] Created new Article (${article._id}) from Manuscript ${submission.submissionId}`);
          }
        } else {
          article.status = "published";
          article.sourceManuscript = submission._id;
          article.publicationDate = new Date();
          if (submission.pdfFile && !article.pdfFile) {
            article.pdfFile = submission.pdfFile;
          }
          await article.save();
          console.log(`[AutoPublish] Updated existing Article (${article._id}) to published for Manuscript ${submission.submissionId}`);
        }

        publishedArticle = article;

        // Dispatch celebratory publication announcement email
        if (article) {
          const populated = await Article.findById(article._id)
            .populate("volume", "volumeNumber year")
            .populate("issue", "issueNumber");

          const authorEmails: string[] = [];
          if (submission.authorEmail && submission.authorEmail.includes("@")) {
            authorEmails.push(submission.authorEmail);
          }
          for (const ca of submission.coAuthors || []) {
            if (ca.email && ca.email.includes("@")) {
              authorEmails.push(ca.email);
            }
          }

          const pubResult = await sendArticlePublishedEmail(
            {
              title: article.title,
              slug: article.slug,
              doi: article.doi,
              volume: populated?.volume,
              issue: populated?.issue,
              authors: article.authors,
            },
            authorEmails,
            submission.authorName
          );
          emailDispatched = !!pubResult?.success;
        }
      } catch (pubErr) {
        console.error("Auto-publishing article error:", pubErr);
      }
    } else if (data.status && data.status !== previousStatus && submission.authorEmail) {
      // Other status transitions (e.g. accepted, revision_requested, under_review, rejected)
      try {
        const emailRes = await sendManuscriptStatusEmail({
          submissionId: submission.submissionId,
          authorName: submission.authorName,
          authorEmail: submission.authorEmail,
          title: submission.title,
          status: submission.status,
          adminNotes: submission.adminNotes,
        });
        emailDispatched = !!emailRes?.success;
      } catch (emailErr) {
        console.error("Non-fatal manuscript status email dispatch error:", emailErr);
      }
    }

    // Invalidate Next.js router & ISR cache across public views
    try {
      revalidatePath("/");
      revalidatePath("/archives");
      revalidatePath("/current-issue");
      revalidatePath("/admin/submissions");
      revalidatePath("/admin/articles");
      if (publishedArticle?.slug) {
        revalidatePath(`/articles/${publishedArticle.slug}`);
      }
    } catch {
      // Revalidation in background
    }

    return NextResponse.json({
      success: true,
      message: data.status === "published"
        ? "Manuscript published & scholarly article successfully released to journal archives!"
        : "Manuscript updated successfully",
      submission,
      publishedArticle,
      emailDispatched,
      authorEmail: submission.authorEmail,
    });
  } catch (error: any) {
    console.error("PATCH /api/submissions/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update manuscript" },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/[id] - Admin delete submission
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const submission = await Manuscript.findById(id);
    if (!submission) {
      return NextResponse.json({ error: "Manuscript not found" }, { status: 404 });
    }

    // Delete associated private file
    if (submission.pdfFile?.storageKey) {
      try {
        await deleteFile(submission.pdfFile.storageKey);
      } catch (fileErr) {
        console.warn("Could not delete physical file:", fileErr);
      }
    }

    await Manuscript.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Manuscript submission deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/submissions/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete manuscript" },
      { status: 500 }
    );
  }
}
