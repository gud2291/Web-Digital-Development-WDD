import { NextResponse } from "next/server";
import { uploadAndRecord } from "@/server/services/media.service";
import { badRequest, handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

const IMAGE_MAX = 10 * 1024 * 1024; // 10 MB
const VIDEO_MAX = 50 * 1024 * 1024; // 50 MB
const ACCEPTED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return badRequest("Missing file");
    }
    if (file.type && !ACCEPTED.includes(file.type)) {
      return badRequest("Unsupported file type. Allowed: jpg, png, webp, gif, svg, mp4, webm.");
    }
    const isVideo = file.type.startsWith("video/");
    const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
    if (file.size > max) {
      return badRequest(`File exceeds ${isVideo ? "50MB" : "10MB"} limit`);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await uploadAndRecord(buffer, {
      filename: file.name,
      mimeType: file.type,
      uploadedBy: gate.session.user.email ?? "",
    });
    return NextResponse.json(doc, { status: 201 });
  });
}
