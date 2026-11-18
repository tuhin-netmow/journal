import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { getAdminSession } from "@/lib/auth";
import { saveFile, deleteFile } from "@/lib/storage";
import { slugify } from "@/lib/utils";

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

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      article,
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
