import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";

// Check if S3 credentials are configured
const hasS3Config = !!(
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY
);

let s3Client: S3Client | null = null;
if (hasS3Config) {
  s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: !!process.env.S3_ENDPOINT,
  });
}

// Local storage directory fallback (detects read-only serverless environments like Netlify/Vercel/Lambda)
const isServerless = !!(
  process.env.NETLIFY ||
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const LOCAL_STORAGE_DIR = isServerless
  ? path.join("/tmp", "storage", "uploads")
  : path.join(process.cwd(), "storage", "uploads");

export interface StoredFileInfo {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Returns the GridFS bucket from Mongoose connection.
 */
async function getGridFSBucket() {
  await connectToDatabase();
  if (!mongoose.connection.db) {
    throw new Error("MongoDB database connection not available for GridFS storage");
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "pdfs" });
}

/**
 * Saves a file buffer securely.
 * 1. Uses S3 if S3 credentials are provided in env.
 * 2. Uses MongoDB GridFS (safe & persistent across serverless instances like Netlify/Vercel without filesystem writes).
 * 3. Falls back to disk only if database is unavailable.
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  prefix: "manuscripts" | "articles" = "manuscripts"
): Promise<StoredFileInfo> {
  const uniqueId = crypto.randomUUID();
  const safeOriginalName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${prefix}/${uniqueId}-${safeOriginalName}`;

  // 1. S3 Upload (if explicitly configured)
  if (s3Client && process.env.S3_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    });
    await s3Client.send(command);
  } else {
    // 2. Default: MongoDB GridFS (Works in serverless without write access to /var/task)
    try {
      const bucket = await getGridFSBucket();
      const uploadStream = bucket.openUploadStream(storageKey, {
        metadata: {
          originalName,
          mimeType,
          prefix,
          size: buffer.length,
          uploadedAt: new Date(),
        },
      });

      uploadStream.end(buffer);

      await new Promise<void>((resolve, reject) => {
        uploadStream.on("finish", () => resolve());
        uploadStream.on("error", (err) => reject(err));
      });
    } catch (gridFsError: any) {
      console.warn("[Storage] GridFS save failed, falling back to disk:", gridFsError.message);
      // Fallback: write to disk (/tmp on serverless, storage/uploads on dev)
      const filePath = path.join(LOCAL_STORAGE_DIR, storageKey);
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, buffer);
    }
  }

  return {
    storageKey,
    originalName,
    mimeType,
    size: buffer.length,
  };
}

/**
 * Retrieves a file as a Buffer by its storageKey.
 * Checks MongoDB GridFS, S3, and local disk.
 */
export async function getFileBuffer(storageKey: string): Promise<Buffer> {
  // 1. Check MongoDB GridFS
  try {
    const bucket = await getGridFSBucket();
    const matches = await bucket.find({ filename: storageKey }).limit(1).toArray();
    if (matches.length > 0) {
      const downloadStream = bucket.openDownloadStreamByName(storageKey);
      const chunks: Buffer[] = [];
      for await (const chunk of downloadStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
  } catch (gridFsErr: any) {
    console.warn("[Storage] GridFS retrieval error:", gridFsErr.message);
  }

  // 2. Check S3 if configured
  if (s3Client && process.env.S3_BUCKET) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: storageKey,
      });
      const response = await s3Client.send(command);
      const byteArray = await response.Body?.transformToByteArray();
      if (byteArray) {
        return Buffer.from(byteArray);
      }
    } catch (s3Err: any) {
      console.warn("[Storage] S3 retrieval error:", s3Err.message);
    }
  }

  // 3. Fallback: Check local disk storage (dev / legacy files)
  const localPaths = [
    path.join(LOCAL_STORAGE_DIR, storageKey),
    path.join(process.cwd(), "storage", "uploads", storageKey),
    path.join("/tmp", "storage", "uploads", storageKey),
  ];

  for (const lp of localPaths) {
    try {
      if (fsSync.existsSync(lp)) {
        return await fs.readFile(lp);
      }
    } catch {
      // continue to next check
    }
  }

  throw new Error(`File not found for key: ${storageKey}`);
}

/**
 * Deletes a file by its storageKey.
 */
export async function deleteFile(storageKey: string): Promise<void> {
  // 1. Delete from GridFS
  try {
    const bucket = await getGridFSBucket();
    const files = await bucket.find({ filename: storageKey }).toArray();
    for (const f of files) {
      await bucket.delete(f._id);
    }
  } catch (e: any) {
    console.warn("[Storage] Could not delete from GridFS:", e.message);
  }

  // 2. Delete from S3
  if (s3Client && process.env.S3_BUCKET) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: storageKey,
      });
      await s3Client.send(command);
    } catch (e: any) {
      console.warn("[Storage] Could not delete from S3:", e.message);
    }
  }

  // 3. Delete from local disk
  const localPaths = [
    path.join(LOCAL_STORAGE_DIR, storageKey),
    path.join(process.cwd(), "storage", "uploads", storageKey),
    path.join("/tmp", "storage", "uploads", storageKey),
  ];

  for (const lp of localPaths) {
    try {
      if (fsSync.existsSync(lp)) {
        await fs.unlink(lp);
      }
    } catch {
      // ignore
    }
  }
}
