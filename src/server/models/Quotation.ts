import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

/**
 * A record of every quotation generated/sent from the admin, so the owner can
 * later look up who received which quotation (by number) and their contact.
 * Read-only from the admin "Quotation Records" list.
 */
const QuotationSchema = new Schema(
  {
    quotationNo: { type: String, required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    serviceSlug: { type: String, default: "" },
    serviceTitle: { type: String, default: "" },
    costRange: { type: String, default: "" },
    sentVia: {
      type: String,
      enum: ["download", "email", "whatsapp"],
      default: "download",
      index: true,
    },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

QuotationSchema.index({ createdAt: -1 });

export type Quotation = InferSchemaType<typeof QuotationSchema> & { _id: string };
const QuotationModel: Model<Quotation> =
  (models.Quotation as Model<Quotation>) || model<Quotation>("Quotation", QuotationSchema);
export default QuotationModel;
