import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { sendArticlePublishedEmail } from "@/lib/email";

// POST /api/articles/[id]/notify - Admin trigger/resend publication email
export async function POST(
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

    const article = await Article.findById(id)
      .populate("volume", "volumeNumber year")
      .populate("issue", "issueNumber");

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const recipientSet = new Set<string>();

    // 1. Check article authors
    for (const a of article.authors || []) {
      if (a.email && typeof a.email === "string" && a.email.includes("@")) {
        recipientSet.add(a.email.trim().toLowerCase());
      }
    }

    // 2. Check sourceManuscript
    if (article.sourceManuscript) {
      const sourceMS = await Manuscript.findById(article.sourceManuscript);
      if (sourceMS?.authorEmail && sourceMS.authorEmail.includes("@")) {
        recipientSet.add(sourceMS.authorEmail.trim().toLowerCase());
      }
    }

    const recipients = Array.from(recipientSet);
    const primaryAuthorName = article.authors?.[0]?.name || "Author";

    const emailResult = await sendArticlePublishedEmail(
      {
        title: article.title,
        slug: article.slug,
        doi: article.doi,
        volume: article.volume,
        issue: article.issue,
        authors: article.authors,
      },
      recipients,
      primaryAuthorName
    );

    return NextResponse.json({
      success: true,
      message: recipients.length > 0
        ? `Publication email sent successfully to ${recipients.join(", ")}`
        : "Publication notice recorded and alerted to editorial desk (no author email on file)",
      recipients,
      emailResult,
    });
  } catch (error: any) {
    console.error("POST /api/articles/[id]/notify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send publication email" },
      { status: 500 }
    );
  }
}
