import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const LegalPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: ["privacy-policy", "terms", "refund"],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type LegalPage = InferSchemaType<typeof LegalPageSchema> & { _id: string };
const LegalPageModel: Model<LegalPage> =
  (models.LegalPage as Model<LegalPage>) || model<LegalPage>("LegalPage", LegalPageSchema);
export default LegalPageModel;
