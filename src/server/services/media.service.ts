import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Media from "@/server/models/Media";
import { deleteFromCloudinary, uploadToCloudinary } from "@/server/media/cloudinary";
import type { CreateMediaInput } from "@/server/validation/media";

export async function listMedia(opts: { page?: number; limit?: number } = {}) {
  await connectDB();
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 40;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Media.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments({}),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function recordMedia(data: CreateMediaInput) {
  await connectDB();
  return Media.create(data);
}

export async function uploadAndRecord(
  buffer: Buffer,
  meta: { filename: string; mimeType: string; uploadedBy?: string }
) {
  await connectDB();
  const isVideo = (meta.mimeType || "").startsWith("video/");
  const result = await uploadToCloudinary(buffer, {
    folder: "wdd",
    resourceType: isVideo ? "video" : "image",
  });
  return Media.create({
    filename: meta.filename,
    url: result.url,
    publicId: result.publicId,
    mimeType: meta.mimeType,
    size: result.bytes,
    width: result.width,
    height: result.height,
    alt: "",
    uploadedBy: meta.uploadedBy ?? "",
  });
}

export async function updateMedia(id: string, data: { alt?: string }) {
  await connectDB();
  return Media.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteMedia(id: string) {
  await connectDB();
  const doc = await Media.findById(id);
  if (!doc) return { ok: false, reason: "not_found" as const };
  const isVideo = (doc.mimeType || "").startsWith("video/");
  try {
    await deleteFromCloudinary(doc.publicId, isVideo ? "video" : "image");
  } catch {
    // Cloudinary may have already removed the asset — still drop the DB row
  }
  await doc.deleteOne();
  return { ok: true as const };
}
