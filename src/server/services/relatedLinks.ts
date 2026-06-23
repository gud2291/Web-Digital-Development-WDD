import "server-only";
import { listServices } from "@/server/services/service.service";
import { listBlogs } from "@/server/services/blog.service";

/** §INTERNAL-LINKING — { title, slug } option lists for the admin pickers. */
export interface LinkOption {
  title: string;
  slug: string;
}

/** All services (including hidden) as picker options. */
export async function getServiceLinkOptions(): Promise<LinkOption[]> {
  const items = await listServices({ includeHidden: true }).catch(() => []);
  return items
    .filter((s) => s.slug)
    .map((s) => ({ title: s.title as string, slug: s.slug as string }));
}

/** All blogs (including drafts) as picker options, optionally excluding one slug. */
export async function getBlogLinkOptions(excludeSlug?: string): Promise<LinkOption[]> {
  const { items } = await listBlogs({ includeDrafts: true, limit: 1000 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listBlogs>>["items"],
  }));
  return items
    .filter((b) => b.slug && b.slug !== excludeSlug)
    .map((b) => ({ title: b.title as string, slug: b.slug as string }));
}
