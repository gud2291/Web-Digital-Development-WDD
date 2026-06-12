import { listMedia } from "@/server/services/media.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import type { MediaItem } from "@/components/admin/MediaUploader";

export const dynamic = "force-dynamic";

export default async function MediaAdminPage() {
  const { items } = await listMedia({ page: 1, limit: 200 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listMedia>>["items"],
  }));

  const rows: MediaItem[] = items.map((m) => ({
    _id: String(m._id),
    url: m.url,
    publicId: m.publicId,
    filename: m.filename,
    mimeType: m.mimeType ?? "",
    width: m.width ?? 0,
    height: m.height ?? 0,
    size: m.size ?? 0,
    alt: m.alt ?? "",
    createdAt:
      (m as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload, organise and reuse images & videos. Files are stored on Cloudinary."
      />
      <MediaLibrary initial={rows} />
    </>
  );
}
