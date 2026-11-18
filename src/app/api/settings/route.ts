import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import { getAdminSession } from "@/lib/auth";
import { journalSettingsSchema } from "@/lib/validations/settings";

export const dynamic = "force-dynamic";

// GET /api/settings - Public get journal settings
export async function GET() {
  try {
    await connectToDatabase();
    let settings = await JournalSettings.findOne().lean();

    if (!settings) {
      const created = await JournalSettings.create({});
      settings = created.toObject();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve journal settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Admin update settings
export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = journalSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Clean update data: only update keys that were actually provided
    const updateData: Record<string, any> = {};
    for (const [key, val] of Object.entries(validationResult.data)) {
      if (val !== undefined) {
        updateData[key] = val;
      }
    }

    // Direct atomic update and return full updated document
    const updatedSettings = await JournalSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Journal settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;
export const POST = PUT;
