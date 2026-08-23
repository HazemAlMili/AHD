import { randomUUID } from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const allowedMedia = {
  "image/jpeg": { extension: "jpg", maxBytes: 8 * 1024 * 1024 },
  "image/png": { extension: "png", maxBytes: 8 * 1024 * 1024 },
  "image/webp": { extension: "webp", maxBytes: 8 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", maxBytes: 40 * 1024 * 1024 },
} as const;

export type AllowedMediaType = keyof typeof allowedMedia;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Media storage is not configured: ${name}`);
  return value;
}

function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function mediaUploadPolicy(contentType: AllowedMediaType) {
  return allowedMedia[contentType];
}

export async function createMediaUpload(workerId: string, contentType: AllowedMediaType) {
  const bucket = required("AHD_S3_BUCKET");
  const region = process.env.AHD_S3_REGION?.trim() || "us-east-1";
  const endpoint = process.env.AHD_S3_ENDPOINT?.trim();
  const key = `workers/${workerId}/${randomUUID()}.${allowedMedia[contentType].extension}`;
  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.AHD_S3_FORCE_PATH_STYLE === "true",
    credentials: process.env.AHD_S3_ACCESS_KEY_ID && process.env.AHD_S3_SECRET_ACCESS_KEY ? {
      accessKeyId: process.env.AHD_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AHD_S3_SECRET_ACCESS_KEY,
    } : undefined,
  });
  const upload = await createPresignedPost(client, {
    Bucket: bucket,
    Key: key,
    Expires: 300,
    Fields: { "Content-Type": contentType },
    Conditions: [
      ["eq", "$Content-Type", contentType],
      ["content-length-range", 1, allowedMedia[contentType].maxBytes],
    ],
  });
  const publicBase = process.env.AHD_S3_PUBLIC_BASE_URL?.trim().replace(/\/$/, "")
    || (endpoint ? `${endpoint.replace(/\/$/, "")}/${bucket}` : `https://${bucket}.s3.${region}.amazonaws.com`);
  return { upload, publicUrl: `${publicBase}/${encodeKey(key)}`, maxBytes: allowedMedia[contentType].maxBytes };
}
