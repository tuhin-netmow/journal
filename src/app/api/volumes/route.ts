import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import { getAdminSession } from "@/lib/auth";
import { volumeSchema } from "@/lib/validations/volume-issue";

// GET /api/volumes - List all volumes
export async function GET() {
  try {
    await connectToDatabase();

    const volumes = await Volume.find().sort({ volumeNumber: -1 });

    // Attach issues to each volume
    const volumesWithIssues = await Promise.all(
      volumes.map(async (vol) => {
        const issues = await Issue.find({ volume: vol._id }).sort({ issueNumber: 1 });
        const articleCount = await Article.countDocuments({ volume: vol._id, status: "published" });
        return {
          ...vol.toObject(),
          issues,
          publishedArticleCount: articleCount,
        };
      })
    );

    return NextResponse.json({ success: true, volumes: volumesWithIssues });
  } catch (error: any) {
    console.error("GET /api/volumes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve volumes" },
      { status: 500 }
    );
  }
}

// POST /api/volumes - Admin create volume
export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = volumeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { volumeNumber, year, description } = validationResult.data;

    const existing = await Volume.findOne({ volumeNumber });
    if (existing) {
      return NextResponse.json(
        { error: `Volume ${volumeNumber} already exists` },
        { status: 400 }
      );
    }

    const newVolume = await Volume.create({ volumeNumber, year, description });

    return NextResponse.json({
      success: true,
      message: "Volume created successfully",
      volume: newVolume,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/volumes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create volume" },
      { status: 500 }
    );
  }
}

// PUT /api/volumes - Admin update volume
export async function PUT(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, volumeNumber, year, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Volume ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const volume = await Volume.findById(id);
    if (!volume) {
      return NextResponse.json({ error: "Volume not found" }, { status: 404 });
    }

    if (volumeNumber !== undefined) volume.volumeNumber = Number(volumeNumber);
    if (year !== undefined) volume.year = Number(year);
    if (description !== undefined) volume.description = description;

    await volume.save();

    return NextResponse.json({
      success: true,
      message: "Volume updated successfully",
      volume,
    });
  } catch (error: any) {
    console.error("PUT /api/volumes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update volume" },
      { status: 500 }
    );
  }
}

// DELETE /api/volumes - Admin delete volume
export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Volume ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const issuesCount = await Issue.countDocuments({ volume: id });
    if (issuesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete volume: ${issuesCount} issues exist within this volume` },
        { status: 400 }
      );
    }

    await Volume.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Volume deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/volumes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete volume" },
      { status: 500 }
    );
  }
}
