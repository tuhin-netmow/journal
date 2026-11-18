import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { getFileBuffer } from "@/lib/storage";

// GET /api/submissions/[id]/pdf - Authenticated Admin PDF streaming
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required to access manuscript PDFs." },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const submission = await Manuscript.findById(id);
    if (!submission || !submission.pdfFile?.storageKey) {
      return NextResponse.json({ error: "Manuscript PDF not found" }, { status: 404 });
    }

    const fileBuffer = await getFileBuffer(submission.pdfFile.storageKey);
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "true";
    const filename = submission.pdfFile.originalName || `${submission.submissionId}.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${encodeURIComponent(filename)}"`
          : `inline; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("GET /api/submissions/[id]/pdf error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve manuscript PDF" },
      { status: 500 }
    );
  }
}
