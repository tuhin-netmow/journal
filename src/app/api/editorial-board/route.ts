import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import EditorialBoard from "@/models/EditorialBoard";
import { getAdminSession } from "@/lib/auth";
import { editorialBoardSchema } from "@/lib/validations/editorial";

// GET /api/editorial-board - Public list members
export async function GET() {
  try {
    await connectToDatabase();
    const members = await EditorialBoard.find().sort({ displayOrder: 1, createdAt: 1 });
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error("GET /api/editorial-board error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve editorial board" },
      { status: 500 }
    );
  }
}

// POST /api/editorial-board - Admin create member
export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = editorialBoardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const member = await EditorialBoard.create(validationResult.data);

    return NextResponse.json({
      success: true,
      message: "Editorial board member added successfully",
      member,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/editorial-board error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create member" },
      { status: 500 }
    );
  }
}

// PUT /api/editorial-board - Admin update member
export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const member = await EditorialBoard.findByIdAndUpdate(id, updateData, { new: true });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      member,
    });
  } catch (error: any) {
    console.error("PUT /api/editorial-board error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/editorial-board - Admin delete member
export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    await EditorialBoard.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/editorial-board error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete member" },
      { status: 500 }
    );
  }
}
