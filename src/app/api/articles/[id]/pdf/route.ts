import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { getAdminSession } from "@/lib/auth";
import { getFileBuffer } from "@/lib/storage";

// GET /api/articles/[id]/pdf - Stream or download published article PDF
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const article = await Article.findOne(query);
    if (!article || !article.pdfFile?.storageKey) {
      return NextResponse.json({ error: "Article PDF not found" }, { status: 404 });
    }

    if (article.status !== "published") {
      const adminSession = await getAdminSession();
      if (!adminSession) {
        return NextResponse.json(
          { error: "Unauthorized. Article is not published yet." },
          { status: 401 }
        );
      }
    }

    const fileBuffer = await getFileBuffer(article.pdfFile.storageKey);
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "true";
    const filename = article.pdfFile.originalName || `${article.slug}.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${encodeURIComponent(filename)}"`
          : `inline; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400", // cache published PDF
      },
    });
  } catch (error: any) {
    console.error("GET /api/articles/[id]/pdf error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve article PDF" },
      { status: 500 }
    );
  }
}
