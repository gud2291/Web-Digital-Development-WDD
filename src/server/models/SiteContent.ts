import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const TimelineItemSchema = new Schema(
  {
    year: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const FounderHighlightSchema = new Schema(
  {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  { _id: false }
);

const AboutSchema = new Schema(
  {
    heroImage: { type: String, default: "" },
    heading: { type: String, default: "" },
    description: { type: String, default: "" },
    whyChooseUs: { type: [String], default: [] },
    timeline: { type: [TimelineItemSchema], default: [] },
    // Founder & CEO section — all optional, page renders sensible fallbacks when empty.
    founderName: { type: String, default: "" },
    founderTitle: { type: String, default: "" },
    founderPhoto: { type: String, default: "" },
    founderPhotoAlt: { type: String, default: "" },
    founderNote: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    founderHighlights: { type: [FounderHighlightSchema], default: [] },
  },
  { _id: false }
);

const ContactPageSchema = new Schema(
  {
    mapEmbedUrl: { type: String, default: "" },
    descText: { type: String, default: "" },
    budgetRanges: { type: [String], default: [] },
    quickPromises: { type: [String], default: [] },
  },
  { _id: false }
);

const NavLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
  },
  { _id: false }
);

const NavLinksSchema = new Schema(
  {
    header: { type: [NavLinkSchema], default: [] },
    footerQuick: { type: [NavLinkSchema], default: [] },
    footerServices: { type: [NavLinkSchema], default: [] },
  },
  { _id: false }
);

const FooterSchema = new Schema(
  {
    tagline: { type: String, default: "" },
    copyright: { type: String, default: "" },
    policyLinks: { type: [NavLinkSchema], default: [] },
  },
  { _id: false }
);

const SiteContentSchema = new Schema(
  {
    about: { type: AboutSchema, default: () => ({}) },
    banners: { type: Schema.Types.Mixed, default: {} },
    contactPage: { type: ContactPageSchema, default: () => ({}) },
    navLinks: { type: NavLinksSchema, default: () => ({}) },
    footer: { type: FooterSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type SiteContent = InferSchemaType<typeof SiteContentSchema> & { _id: string };
const SiteContentModel: Model<SiteContent> =
  (models.SiteContent as Model<SiteContent>) || model<SiteContent>("SiteContent", SiteContentSchema);
export default SiteContentModel;
