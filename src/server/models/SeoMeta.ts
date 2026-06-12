import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const SeoMetaSchema = new Schema(
  {
    pageSlug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
    canonical: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type SeoMeta = InferSchemaType<typeof SeoMetaSchema> & { _id: string };
const SeoMetaModel: Model<SeoMeta> =
  (models.SeoMeta as Model<SeoMeta>) || model<SeoMeta>("SeoMeta", SeoMetaSchema);
export default SeoMetaModel;
