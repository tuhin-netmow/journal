import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PageContent from "@/models/PageContent";
import { getAdminSession } from "@/lib/auth";
import { pageContentSchema } from "@/lib/validations/content";

export const dynamic = "force-dynamic";

// GET /api/content - Public get page content
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const item = await PageContent.findOne({ pageKey: key });
      return NextResponse.json({ success: true, content: item });
    }

    const allContent = await PageContent.find().sort({ pageKey: 1 });
    return NextResponse.json({ success: true, contents: allContent });
  } catch (error: any) {
    console.error("GET /api/content error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve page content" },
      { status: 500 }
    );
  }
}

// PUT /api/content - Admin update page content
export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = pageContentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { pageKey, title, content } = validationResult.data;

    const updated = await PageContent.findOneAndUpdate(
      { pageKey },
      { pageKey, title, content, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      content: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/content error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}
