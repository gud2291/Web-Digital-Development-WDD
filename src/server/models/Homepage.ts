import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const HeroSlideSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaUrl: { type: String, default: "" },
  },
  { _id: false }
);

const StatSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const ClientLogoSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const SectionTitlesSchema = new Schema(
  {
    portfolio: { type: String, default: "Our Portfolio" },
    services: { type: String, default: "Our Services" },
    testimonials: { type: String, default: "Client Love" },
    badge: { type: String, default: "Trusted by 100+ businesses" },
  },
  { _id: false }
);

const CTABannerSchema = new Schema(
  {
    title: { type: String, default: "" },
    sub: { type: String, default: "" },
  },
  { _id: false }
);

const HomepageSchema = new Schema(
  {
    heroSlides: { type: [HeroSlideSchema], default: [] },
    stats: { type: [StatSchema], default: [] },
    clientLogos: { type: [ClientLogoSchema], default: [] },
    ctaBanner: { type: CTABannerSchema, default: () => ({}) },
    sectionTitles: { type: SectionTitlesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type Homepage = InferSchemaType<typeof HomepageSchema> & { _id: string };
const HomepageModel: Model<Homepage> =
  (models.Homepage as Model<Homepage>) || model<Homepage>("Homepage", HomepageSchema);
export default HomepageModel;
