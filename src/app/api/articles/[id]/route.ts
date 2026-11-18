import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { sendArticlePublishedEmail } from "@/lib/email";

// GET /api/articles/[id] - Retrieve single article (by id or slug)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const article = await Article.findOne(query)
      .populate("volume", "volumeNumber year description")
      .populate("issue", "issueNumber title publicationDate status");

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // If draft, only admin can view
    if (article.status !== "published") {
      const adminSession = await getAdminSession();
      if (!adminSession) {
        return NextResponse.json({ error: "Article not found or not published" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve article" },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Admin edit article
export async function PUT(
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

    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const previousStatus = article.status;

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};
    let newPdfFileInfo: any = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const pdfFile = formData.get("pdfFile") as File | null;

      if (pdfFile && pdfFile.size > 0) {
        if (pdfFile.type !== "application/pdf" && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
          return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
        }
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        newPdfFileInfo = await saveFile(buffer, pdfFile.name, "application/pdf", "articles");

        // Delete old PDF file if present
        if (article.pdfFile?.storageKey) {
          try {
            await deleteFile(article.pdfFile.storageKey);
          } catch (e) {
            console.warn("Could not delete old PDF:", e);
          }
        }
      }

      formData.forEach((value, key) => {
        if (key !== "pdfFile") {
          data[key] = value;
        }
      });

      if (typeof data.authors === "string") {
        try {
          data.authors = JSON.parse(data.authors);
        } catch {
          data.authors = [{ name: data.authors }];
        }
      }

      if (typeof data.keywords === "string") {
        try {
          data.keywords = JSON.parse(data.keywords);
        } catch {
          data.keywords = data.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
        }
      }
    } else {
      data = await req.json();
    }

    // Update fields
    if (data.title) article.title = data.title;
    if (data.slug) article.slug = slugify(data.slug);
    if (data.authors) article.authors = data.authors;
    if (data.abstract) article.abstract = data.abstract;
    if (data.keywords) {
      article.keywords = Array.isArray(data.keywords) ? data.keywords : [data.keywords];
    }
    if (data.category) article.category = data.category;
    if (data.volume) article.volume = data.volume;
    if (data.issue) article.issue = data.issue;
    if (data.publicationDate) article.publicationDate = new Date(data.publicationDate);
    if (data.doi !== undefined) article.doi = data.doi;
    if (data.status) article.status = data.status;

    if (newPdfFileInfo) {
      article.pdfFile = newPdfFileInfo;
    }

    await article.save();

    // If the article became published from draft, or if explicit notifyAuthors request is received
    let emailDispatched = false;
    let emailRecipients: string[] = [];

    const shouldNotify =
      (previousStatus !== "published" && article.status === "published") ||
      ((data.notifyAuthors === true || data.notifyAuthors === "true") && article.status === "published");

    if (shouldNotify) {
      try {
        const populated = await Article.findById(article._id)
          .populate("volume", "volumeNumber year")
          .populate("issue", "issueNumber");

        const recipientSet = new Set<string>();

        // 1. Check all author emails in article (highest priority)
        for (const author of article.authors || []) {
          if (author.email && typeof author.email === "string" && author.email.includes("@")) {
            recipientSet.add(author.email.trim().toLowerCase());
          }
        }

        // 2. Also check sourceManuscript if linked
        if (article.sourceManuscript) {
          const sourceMS = await Manuscript.findById(article.sourceManuscript);
          if (sourceMS?.authorEmail && sourceMS.authorEmail.includes("@")) {
            recipientSet.add(sourceMS.authorEmail.trim().toLowerCase());
          }
          await Manuscript.findByIdAndUpdate(article.sourceManuscript, { status: "published" });
        }

        emailRecipients = Array.from(recipientSet);
        const primaryAuthorName = article.authors?.[0]?.name || "Author";

        const emailResult = await sendArticlePublishedEmail(
          {
            title: article.title,
            slug: article.slug,
            doi: article.doi,
            volume: populated?.volume,
            issue: populated?.issue,
            authors: article.authors,
          },
          emailRecipients,
          primaryAuthorName
        );

        emailDispatched = !!emailResult?.success;
        console.log(`[ArticlePublish:PUT] Published email dispatched: ${emailDispatched}, recipients: ${emailRecipients.join(", ")}`);
      } catch (emailErr) {
        console.error("Non-fatal publication email dispatch error in PUT:", emailErr);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/archives");
      revalidatePath("/current-issue");
      revalidatePath("/admin/articles");
      if (article?.slug) {
        revalidatePath(`/articles/${article.slug}`);
      }
    } catch {
      // Revalidation in background
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      article,
      emailDispatched,
      emailRecipients,
    });
  } catch (error: any) {
    console.error("PUT /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Admin delete article
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

    const article = await Article.findById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.pdfFile?.storageKey) {
      try {
        await deleteFile(article.pdfFile.storageKey);
      } catch (e) {
        console.warn("Could not delete physical article file:", e);
      }
    }

    await Article.findByIdAndDelete(id);

    try {
      revalidatePath("/");
      revalidatePath("/archives");
      revalidatePath("/current-issue");
      revalidatePath("/admin/articles");
    } catch {
      // Revalidation in background
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
