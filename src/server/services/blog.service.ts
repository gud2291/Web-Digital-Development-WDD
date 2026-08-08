import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Blog from "@/server/models/Blog";
import type { BlogQuery, CreateBlogInput, UpdateBlogInput } from "@/server/validation/blog";

export interface ListBlogsOpts extends Partial<BlogQuery> {
  includeDrafts?: boolean;
}

/**
 * Treat a caller-supplied search term as literal text. Without this the term is
 * compiled as a regex by Mongo, which lets a public request send a
 * catastrophically-backtracking pattern like `(a+)+$` and pin the database CPU.
 * Same escape the chatbot uses in `@/server/ai/smart-reply`.
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listBlogs(opts: ListBlogsOpts = {}) {
  await connectDB();
  const { page = 1, limit = 20, category, tag, search, includeDrafts = false } = opts;

  const filter: Record<string, unknown> = {};
  if (!includeDrafts) filter.published = true;
  // The explicit `published` filter is an ADMIN facility. Honouring it for
  // public callers let `?published=` flip the line above and serve drafts.
  if (includeDrafts && typeof opts.published === "boolean") {
    filter.published = opts.published;
  }
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) {
    const term = escapeRegex(search.slice(0, 100));
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { excerpt: { $regex: term, $options: "i" } },
      { tags: { $regex: term, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Blog.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getBlogBySlug(slug: string, includeDrafts = false) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (!includeDrafts) filter.published = true;
  return Blog.findOne(filter).lean();
}

export async function getBlogById(id: string) {
  await connectDB();
  return Blog.findById(id).lean();
}

/**
 * §INTERNAL-LINKING — fetch published blogs by a list of slugs, returned in the
 * same order as the input (so admin-picked order is preserved). Empty input →
 * empty result, no DB round-trip.
 */
export async function getBlogsBySlugs(slugs: string[]) {
  if (!slugs?.length) return [];
  await connectDB();
  const docs = await Blog.find({ slug: { $in: slugs }, published: true }).lean();
  const bySlug = new Map(docs.map((d) => [d.slug as string, d]));
  return slugs.map((s) => bySlug.get(s)).filter(Boolean) as typeof docs;
}

/**
 * Related posts (§14.4): same category first, then matching tags, then most
 * recent — de-duplicated, capped at `limit`.
 */
export async function getRelatedBlogs(
  currentSlug: string,
  category?: string,
  tags?: string[],
  limit = 3
) {
  await connectDB();
  const base = { published: true, slug: { $ne: currentSlug } };
  const byCategory = category
    ? await Blog.find({ ...base, category }).sort({ createdAt: -1 }).limit(limit).lean()
    : [];
  const byTags = tags?.length
    ? await Blog.find({ ...base, tags: { $in: tags } }).sort({ createdAt: -1 }).limit(limit).lean()
    : [];
  const recent = await Blog.find(base).sort({ createdAt: -1 }).limit(limit * 3).lean();

  const seen = new Set<string>();
  const out: typeof recent = [];
  for (const doc of [...byCategory, ...byTags, ...recent]) {
    if (out.length >= limit) break;
    if (!seen.has(doc.slug)) {
      seen.add(doc.slug);
      out.push(doc);
    }
  }
  return out;
}

export async function createBlog(data: CreateBlogInput) {
  await connectDB();
  return Blog.create(data);
}

export async function updateBlog(id: string, data: UpdateBlogInput) {
  await connectDB();
  return Blog.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteBlog(id: string) {
  await connectDB();
  await Blog.findByIdAndDelete(id);
  return { ok: true };
}
