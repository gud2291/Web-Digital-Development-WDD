import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const FAQSubSchema = new Schema(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
  },
  { _id: false }
);

const PricingTierSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
  },
  { _id: false }
);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverImageAlt: { type: String, default: "" },
    icon: { type: String, default: "Globe" },
    // §12.6 — lucide icon name + accent colour for the service card.
    iconName: { type: String, default: "Globe" },
    accentColor: {
      type: String,
      enum: ["blue", "green", "orange", "pink", "purple", "teal"],
      default: "blue",
    },
    features: { type: [String], default: [] },
    faqs: { type: [FAQSubSchema], default: [] },
    pricingTiers: { type: [PricingTierSchema], default: [] },
    // §QUOTATION-PDF — optional, additive fields powering the downloadable
    // quotation PDF. Only services with `quotationEnabled` appear in the quote
    // form dropdown. deliveryTime/hostingCost override the global defaults when
    // set (empty → fall back to QuotationSettings).
    quotationEnabled: { type: Boolean, default: false },
    quotationTitle: { type: String, default: "" },
    quotationCostRange: { type: String, default: "" },
    quotationScope: { type: [String], default: [] },
    quotationDeliveryTime: { type: String, default: "" },
    quotationHostingCost: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Service = InferSchemaType<typeof ServiceSchema> & { _id: string };
const ServiceModel: Model<Service> =
  (models.Service as Model<Service>) || model<Service>("Service", ServiceSchema);
export default ServiceModel;
