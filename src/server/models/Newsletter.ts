import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    source: { type: String, default: "footer" },
    unsubscribed: { type: Boolean, default: false },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type Newsletter = InferSchemaType<typeof NewsletterSchema> & { _id: string };
const NewsletterModel: Model<Newsletter> =
  (models.Newsletter as Model<Newsletter>) || model<Newsletter>("Newsletter", NewsletterSchema);
export default NewsletterModel;
