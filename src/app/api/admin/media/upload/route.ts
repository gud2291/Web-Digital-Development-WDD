import { NextResponse } from "next/server";
import { uploadAndRecord } from "@/server/services/media.service";
import { sniffMimeType, mimeCategory } from "@/server/media/sniff";
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
    // No `file.type &&` guard here — a missing content-type used to skip the
    // allow-list entirely, which let any file through.
    if (!ACCEPTED.includes(file.type)) {
      return badRequest("Unsupported file type. Allowed: jpg, png, webp, gif, svg, mp4, webm.");
    }
    const isVideo = file.type.startsWith("video/");
    const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
    if (file.size > max) {
      return badRequest(`File exceeds ${isVideo ? "50MB" : "10MB"} limit`);
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    // Decide from the bytes, not the label. A mislabelled but genuine image
    // still uploads (plenty of real files carry the wrong extension) — anything
    // that isn't actually one of the accepted media formats does not.
    const actualType = sniffMimeType(buffer);
    if (!actualType || !ACCEPTED.includes(actualType)) {
      return badRequest("That file isn't a supported image or video. Allowed: jpg, png, webp, gif, svg, mp4, webm.");
    }
    // …and it must stay in the category the size limit was applied for, so a
    // video can't slip in under the 10MB image allowance.
    if (mimeCategory(actualType) !== mimeCategory(file.type)) {
      return badRequest("File contents don't match its type. Please re-export and try again.");
    }

    const doc = await uploadAndRecord(buffer, {
      filename: file.name,
      mimeType: actualType,
      uploadedBy: gate.session.user.email ?? "",
    });
    return NextResponse.json(doc, { status: 201 });
  });
}
