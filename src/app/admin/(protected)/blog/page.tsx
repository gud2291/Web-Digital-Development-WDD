import Link from "next/link";
import { listBlogs } from "@/server/services/blog.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogListClient } from "./BlogListClient";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const { items } = await listBlogs({ page: 1, limit: 200, includeDrafts: true }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
  }));

  const rows = items.map((b) => ({
    _id: String(b._id),
    title: b.title,
    slug: b.slug,
    category: b.category || "General",
    published: !!b.published,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Blog"
        description="Articles and editorial content."
        actions={
          <Link href="/admin/blog/new">
            <Btn iconRight="plus">New post</Btn>
          </Link>
        }
      />
      <BlogListClient initial={rows} />
    </>
  );
}
