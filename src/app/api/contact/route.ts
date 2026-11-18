import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { getAdminSession } from "@/lib/auth";
import { contactMessageSchema } from "@/lib/validations/contact";

const contactRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = contactRateLimitMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (valid.length >= MAX_REQUESTS) return true;
  valid.push(now);
  contactRateLimitMap.set(ip, valid);
  return false;
}

// GET /api/contact - Admin list contact messages
export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}

// POST /api/contact - Public submit contact message
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validationResult = contactMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newMessage = await ContactMessage.create(validationResult.data);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. Our editorial office will respond shortly.",
      id: newMessage._id,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit message" },
      { status: 500 }
    );
  }
}

// PATCH /api/contact - Admin mark as read
export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("PATCH /api/contact error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE /api/contact - Admin delete message
export async function DELETE(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    await ContactMessage.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/contact error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete message" },
      { status: 500 }
    );
  }
}
