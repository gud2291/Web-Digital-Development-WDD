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
});

export const updateBlogSchema = createBlogSchema.partial();

export const blogQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  published: z.coerce.boolean().optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
