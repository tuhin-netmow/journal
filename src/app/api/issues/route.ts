import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import { getAdminSession } from "@/lib/auth";
import { issueSchema } from "@/lib/validations/volume-issue";

// GET /api/issues - List issues or get current published issue
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const volumeId = searchParams.get("volume");
    const current = searchParams.get("current") === "true";
    const status = searchParams.get("status");

    const adminSession = await getAdminSession();

    if (current) {
      // Find the most recent published issue (highest volume, highest issue, latest date)
      const publishedIssueIds = await Article.distinct("issue", { status: "published" });

      const publishedIssues = await Issue.find({
        $or: [
          { status: "published" },
          { _id: { $in: publishedIssueIds } },
        ],
      })
        .populate("volume", "volumeNumber year description")
        .lean();

      publishedIssues.sort((a: any, b: any) => {
        const volA = (a.volume as any)?.volumeNumber ?? 0;
        const volB = (b.volume as any)?.volumeNumber ?? 0;
        if (volA !== volB) return volB - volA;

        const issA = a.issueNumber ?? 0;
        const issB = b.issueNumber ?? 0;
        if (issA !== issB) return issB - issA;

        const dateA = new Date(a.publicationDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.publicationDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      const currentIssue = publishedIssues[0] || null;

      if (!currentIssue) {
        return NextResponse.json({ success: true, issue: null, articles: [] });
      }

      // Also get published articles in this issue
      const articles = await Article.find({
        issue: currentIssue._id,
        status: "published",
      }).sort({ publicationDate: -1, createdAt: -1 });

      return NextResponse.json({
        success: true,
        issue: currentIssue,
        articles,
      });
    }

    const query: Record<string, any> = {};
    if (volumeId) query.volume = volumeId;
    if (!adminSession) {
      query.status = "published";
    } else if (status && status !== "all") {
      query.status = status;
    }

    const issues = await Issue.find(query)
      .populate("volume", "volumeNumber year")
      .sort({ publicationDate: -1, createdAt: -1 });

    const issuesWithCounts = await Promise.all(
      issues.map(async (iss) => {
        const articleCount = await Article.countDocuments({
          issue: iss._id,
          ...(adminSession ? {} : { status: "published" }),
        });
        return {
          ...iss.toObject(),
          articleCount,
        };
      })
    );

    return NextResponse.json({ success: true, issues: issuesWithCounts });
  } catch (error: any) {
    console.error("GET /api/issues error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve issues" },
      { status: 500 }
    );
  }
}

// POST /api/issues - Admin create issue
export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = issueSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { issueNumber, volume, title, description, coverImage, publicationDate, status } =
      validationResult.data;

    // Verify volume exists
    const volumeDoc = await Volume.findById(volume);
    if (!volumeDoc) {
      return NextResponse.json({ error: "Volume not found" }, { status: 400 });
    }

    // Check duplicate issue number in volume
    const existing = await Issue.findOne({ volume, issueNumber });
    if (existing) {
      return NextResponse.json(
        { error: `Issue ${issueNumber} already exists in Volume ${volumeDoc.volumeNumber}` },
        { status: 400 }
      );
    }

    const newIssue = await Issue.create({
      issueNumber,
      volume,
      title,
      description,
      coverImage: coverImage || "/images/issue-cover-default.jpg",
      publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
      status,
    });

    return NextResponse.json({
      success: true,
      message: "Issue created successfully",
      issue: newIssue,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/issues error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create issue" },
      { status: 500 }
    );
  }
}

// PUT /api/issues - Admin update issue
export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, issueNumber, volume, title, description, coverImage, publicationDate, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (issueNumber !== undefined) issue.issueNumber = Number(issueNumber);
    if (volume) issue.volume = volume;
    if (title) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (coverImage !== undefined) issue.coverImage = coverImage;
    if (publicationDate) issue.publicationDate = new Date(publicationDate);
    if (status) issue.status = status;

    await issue.save();

    return NextResponse.json({
      success: true,
      message: "Issue updated successfully",
      issue,
    });
  } catch (error: any) {
    console.error("PUT /api/issues error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update issue" },
      { status: 500 }
    );
  }
}

// DELETE /api/issues - Admin delete issue
export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const articlesCount = await Article.countDocuments({ issue: id });
    if (articlesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete issue: ${articlesCount} articles are assigned to it` },
        { status: 400 }
      );
    }

    await Issue.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/issues error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete issue" },
      { status: 500 }
    );
  }
}
