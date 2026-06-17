import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    featuredImageAlt: { type: String, default: "" },
    author: { type: String, default: "Web Digital Development Team" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
    published: { type: Boolean, default: false, index: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogSchema.index({ category: 1, published: 1 });
BlogSchema.index({ tags: 1 });

export type Blog = InferSchemaType<typeof BlogSchema> & { _id: string };
const BlogModel: Model<Blog> = (models.Blog as Model<Blog>) || model<Blog>("Blog", BlogSchema);
export default BlogModel;
