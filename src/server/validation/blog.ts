import { z } from "zod";
import { paginationSchema, slugSchema } from "./common";

export const createBlogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  excerpt: z.string().max(300).default(""),
  content: z.string().min(1),
  featuredImage: z.string().url().optional().or(z.literal("")),
  featuredImageAlt: z.string().max(300).optional().or(z.literal("")),
  author: z.string().default("Web Digital Development Team"),
  authorFollowUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().default("General"),
  tags: z.array(z.string()).default([]),
  readTime: z.number().int().min(1).max(120).default(5),
  published: z.boolean().default(false),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(200).optional().or(z.literal("")),
  // §INTERNAL-LINKING — optional related-link slugs (admin picker).
  relatedServices: z.array(z.string()).default([]),
  relatedBlogs: z.array(z.string()).default([]),
});

export const updateBlogSchema = createBlogSchema.partial();

export const blogQuerySchema = paginationSchema.extend({
  category: z.string().max(120).optional(),
  tag: z.string().max(120).optional(),
  // Capped: the value reaches a Mongo $regex, so an unbounded string is a
  // needless CPU cost even after escaping.
  search: z.string().max(100).optional(),
  // NOT z.coerce.boolean() — that turns "" into false and "false" into true.
  // Only the two literals mean anything; everything else is "not specified".
  published: z.preprocess(
    (v) => (v === "true" ? true : v === "false" ? false : undefined),
    z.boolean().optional()
  ),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
