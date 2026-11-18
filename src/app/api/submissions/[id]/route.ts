import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { manuscriptStatusUpdateSchema } from "@/lib/validations/manuscript";
import { deleteFile } from "@/lib/storage";

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

    return NextResponse.json({ success: true, submission });
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

    const data = validationResult.data;
    if (data.status) submission.status = data.status;
    if (data.paymentStatus) submission.paymentStatus = data.paymentStatus;
    if (data.adminNotes !== undefined) submission.adminNotes = data.adminNotes;

    await submission.save();

    return NextResponse.json({
      success: true,
      message: "Manuscript updated successfully",
      submission,
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
