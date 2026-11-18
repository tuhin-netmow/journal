import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { articleSchema } from "@/lib/validations/article";
import { saveFile } from "@/lib/storage";
import { slugify } from "@/lib/utils";

// GET /api/articles - List articles (public: published only; admin: all)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const volumeId = searchParams.get("volume");
    const issueId = searchParams.get("issue");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const adminSession = await getAdminSession();

    const query: Record<string, any> = {};

    // Only admins can see drafts
    if (!adminSession) {
      query.status = "published";
    } else if (status && status !== "all") {
      query.status = status;
    }

    if (volumeId) query.volume = volumeId;
    if (issueId) query.issue = issueId;
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
        { "authors.name": { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ];
    }

    const articles = await Article.find(query)
      .populate("volume", "volumeNumber year")
      .populate("issue", "issueNumber title publicationDate status")
      .sort({ publicationDate: -1, createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Admin only: create article with optional PDF upload
export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};
    let pdfFileInfo: any = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const pdfFile = formData.get("pdfFile") as File | null;

      if (pdfFile && pdfFile.size > 0) {
        if (pdfFile.type !== "application/pdf" && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
          return NextResponse.json({ error: "Article file must be a PDF document" }, { status: 400 });
        }
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        pdfFileInfo = await saveFile(buffer, pdfFile.name, "application/pdf", "articles");
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

    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = slugify(data.title);
    } else if (data.slug) {
      data.slug = slugify(data.slug);
    }

    // Validate
    const validationResult = articleSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Check slug uniqueness
    const existingSlug = await Article.findOne({ slug: validData.slug });
    if (existingSlug) {
      validData.slug = `${validData.slug}-${Date.now().toString().slice(-4)}`;
    }

    // Check volume and issue exist
    const volumeDoc = await Volume.findById(validData.volume);
    const issueDoc = await Issue.findById(validData.issue);
    if (!volumeDoc || !issueDoc) {
      return NextResponse.json({ error: "Selected Volume or Issue does not exist" }, { status: 400 });
    }

    // If sourceManuscript was provided, check if it had a PDF we can copy if no new PDF was provided
    if (validData.sourceManuscript && !pdfFileInfo) {
      const sourceMS = await Manuscript.findById(validData.sourceManuscript);
      if (sourceMS?.pdfFile) {
        pdfFileInfo = sourceMS.pdfFile;
      }
    }

    const newArticle = await Article.create({
      title: validData.title,
      slug: validData.slug,
      authors: validData.authors,
      abstract: validData.abstract,
      keywords: Array.isArray(validData.keywords) ? validData.keywords : [validData.keywords],
      category: validData.category,
      volume: validData.volume,
      issue: validData.issue,
      publicationDate: validData.publicationDate ? new Date(validData.publicationDate) : new Date(),
      doi: validData.doi,
      status: validData.status,
      sourceManuscript: validData.sourceManuscript || undefined,
      pdfFile: pdfFileInfo || undefined,
    });

    // If published and sourceManuscript exists, update manuscript status
    if (validData.status === "published" && validData.sourceManuscript) {
      await Manuscript.findByIdAndUpdate(validData.sourceManuscript, { status: "published" });
    }

    return NextResponse.json({
      success: true,
      message: "Article created successfully",
      article: newArticle,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
