import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

/**
 * Global, admin-managed defaults for the downloadable quotation PDF. A single
 * document (singleton) holds the company-wide values that aren't service
 * specific — validity, delivery, payment terms, hosting/domain notes, feature
 * badges and the greeting/footer copy. Per-service cost/scope live on the
 * Service model and can override deliveryTime/hostingCost.
 */
const PaymentTermSchema = new Schema(
  {
    percent: { type: String, default: "" },
    label: { type: String, default: "" },
    sub: { type: String, default: "" },
  },
  { _id: false }
);

const FeatureBadgeSchema = new Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false }
);

const QuotationSettingsSchema = new Schema(
  {
    validity: { type: String, default: "1 Month" },
    deliveryTime: { type: String, default: "15 – 25 working days" },
    paymentTerms: { type: [PaymentTermSchema], default: [] },
    hostingCost: { type: String, default: "" },
    hostingNote: { type: String, default: "" },
    domainNote: { type: String, default: "" },
    featureBadges: { type: [FeatureBadgeSchema], default: [] },
    greetingTemplate: {
      type: String,
      default:
        "Dear {clientName}, thank you for your interest in Web Digital Development. Based on your requirement, please find below our detailed quotation for your project.",
    },
    footerNote: {
      type: String,
      default: "Thank you for considering Web Digital Development for your project.",
    },
  },
  { timestamps: true }
);

export type QuotationSettings = InferSchemaType<typeof QuotationSettingsSchema> & { _id: string };
const QuotationSettingsModel: Model<QuotationSettings> =
  (models.QuotationSettings as Model<QuotationSettings>) ||
  model<QuotationSettings>("QuotationSettings", QuotationSettingsSchema);
export default QuotationSettingsModel;
