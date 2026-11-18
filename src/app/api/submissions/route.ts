import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import { getAdminSession } from "@/lib/auth";
import { manuscriptSubmissionSchema } from "@/lib/validations/manuscript";
import { saveFile } from "@/lib/storage";
import { generateSubmissionId } from "@/lib/utils";

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

// GET /api/submissions - Admin only: list all submissions
export async function GET(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
        { authorEmail: { $regex: search, $options: "i" } },
        { submissionId: { $regex: search, $options: "i" } },
      ];
    }

    const submissions = await Manuscript.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, submissions });
  } catch (error: any) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve submissions" },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Public: submit manuscript with PDF file
export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown-ip";
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const pdfFile = formData.get("pdfFile") as File | null;

    if (!pdfFile) {
      return NextResponse.json({ error: "Manuscript PDF file is required" }, { status: 400 });
    }

    // Validate PDF mime type & extension
    if (pdfFile.type !== "application/pdf" && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF documents are accepted" }, { status: 400 });
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (pdfFile.size > MAX_SIZE) {
      return NextResponse.json({ error: "PDF file size must not exceed 10 MB" }, { status: 400 });
    }

    // Parse form fields
    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "pdfFile") {
        rawData[key] = value;
      }
    });

    // Parse keywords JSON or comma-separated string
    let parsedKeywords: string[] = [];
    if (typeof rawData.keywords === "string") {
      try {
        parsedKeywords = JSON.parse(rawData.keywords);
      } catch {
        parsedKeywords = rawData.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
      }
    }

    // Parse coAuthors JSON if string
    let parsedCoAuthors = [];
    if (typeof rawData.coAuthors === "string" && rawData.coAuthors.trim()) {
      try {
        parsedCoAuthors = JSON.parse(rawData.coAuthors);
      } catch {
        parsedCoAuthors = [];
      }
    }

    // Parse checkboxes
    const parsedData = {
      authorName: String(rawData.authorName || ""),
      authorEmail: String(rawData.authorEmail || ""),
      authorPhone: rawData.authorPhone ? String(rawData.authorPhone) : undefined,
      institution: String(rawData.institution || ""),
      department: rawData.department ? String(rawData.department) : undefined,
      country: String(rawData.country || ""),
      title: String(rawData.title || ""),
      manuscriptType: String(rawData.manuscriptType || "Research Article"),
      category: String(rawData.category || "General Science"),
      abstract: String(rawData.abstract || ""),
      keywords: parsedKeywords,
      coAuthors: parsedCoAuthors,
      confirmOriginal: rawData.confirmOriginal === "true" || rawData.confirmOriginal === true,
      confirmNotSubmitted:
        rawData.confirmNotSubmitted === "true" || rawData.confirmNotSubmitted === true,
      confirmGuidelines:
        rawData.confirmGuidelines === "true" || rawData.confirmGuidelines === true,
      confirmConsent: rawData.confirmConsent === "true" || rawData.confirmConsent === true,
    };

    // Zod validation
    const validationResult = manuscriptSubmissionSchema.safeParse(parsedData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Securely save PDF file server-side
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const savedFileInfo = await saveFile(
      buffer,
      pdfFile.name,
      "application/pdf",
      "manuscripts"
    );

    // Generate unique submission ID
    let submissionId = generateSubmissionId();
    let exists = await Manuscript.findOne({ submissionId });
    while (exists) {
      submissionId = generateSubmissionId();
      exists = await Manuscript.findOne({ submissionId });
    }

    const newManuscript = await Manuscript.create({
      submissionId,
      authorName: parsedData.authorName,
      authorEmail: parsedData.authorEmail,
      authorPhone: parsedData.authorPhone,
      institution: parsedData.institution,
      department: parsedData.department,
      country: parsedData.country,
      title: parsedData.title,
      manuscriptType: parsedData.manuscriptType,
      category: parsedData.category,
      abstract: parsedData.abstract,
      keywords: parsedData.keywords,
      coAuthors: parsedData.coAuthors,
      pdfFile: savedFileInfo,
      status: "submitted",
      paymentStatus: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your manuscript has been submitted successfully. Our editorial team will contact you after reviewing your manuscript.",
        submissionId: newManuscript.submissionId,
        id: newManuscript._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process manuscript submission" },
      { status: 500 }
    );
  }
}
