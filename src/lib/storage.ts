import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

// Local storage path for private server-side uploads
const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");

// Ensure local storage directory exists
function ensureLocalDir() {
  if (!fsSync.existsSync(LOCAL_STORAGE_DIR)) {
    fsSync.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

export interface StoredFileInfo {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Saves a file buffer securely. Uses S3 if configured, otherwise uses private server disk.
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  prefix: "manuscripts" | "articles" = "manuscripts"
): Promise<StoredFileInfo> {
  const ext = path.extname(originalName) || ".pdf";
  const uniqueId = crypto.randomUUID();
  const safeOriginalName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${prefix}/${uniqueId}-${safeOriginalName}`;

  if (s3Client && process.env.S3_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    });
    await s3Client.send(command);
  } else {
    ensureLocalDir();
    const filePath = path.join(LOCAL_STORAGE_DIR, storageKey);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);
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
 */
export async function getFileBuffer(storageKey: string): Promise<Buffer> {
  if (s3Client && process.env.S3_BUCKET) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: storageKey,
    });
    const response = await s3Client.send(command);
    const byteArray = await response.Body?.transformToByteArray();
    if (!byteArray) {
      throw new Error("File not found or empty");
    }
    return Buffer.from(byteArray);
  } else {
    const filePath = path.join(LOCAL_STORAGE_DIR, storageKey);
    if (!fsSync.existsSync(filePath)) {
      throw new Error("File not found on storage disk");
    }
    return await fs.readFile(filePath);
  }
}

/**
 * Deletes a file by its storageKey.
 */
export async function deleteFile(storageKey: string): Promise<void> {
  if (s3Client && process.env.S3_BUCKET) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: storageKey,
    });
    await s3Client.send(command);
  } else {
    const filePath = path.join(LOCAL_STORAGE_DIR, storageKey);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  }
}
