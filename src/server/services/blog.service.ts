import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Blog from "@/server/models/Blog";
import type { BlogQuery, CreateBlogInput, UpdateBlogInput } from "@/server/validation/blog";

export interface ListBlogsOpts extends Partial<BlogQuery> {
  includeDrafts?: boolean;
}

export async function listBlogs(opts: ListBlogsOpts = {}) {
  await connectDB();
  const { page = 1, limit = 20, category, tag, search, includeDrafts = false } = opts;

  const filter: Record<string, unknown> = {};
  if (!includeDrafts) filter.published = true;
  if (typeof opts.published === "boolean") filter.published = opts.published;
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
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
