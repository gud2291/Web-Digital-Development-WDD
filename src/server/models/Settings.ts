import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const BusinessSchema = new Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    hoursWeek: { type: String, default: "" },
    hoursSunday: { type: String, default: "" },
  },
  { _id: false }
);

const SocialSchema = new Schema(
  {
    fb: { type: String, default: "" },
    tw: { type: String, default: "" },
    li: { type: String, default: "" },
    ig: { type: String, default: "" },
    yt: { type: String, default: "" },
  },
  { _id: false }
);

const AnalyticsSchema = new Schema(
  {
    ga4: { type: String, default: "" },
    gtm: { type: String, default: "" },
    clarity: { type: String, default: "" },
  },
  { _id: false }
);

const QuickActionSchema = new Schema(
  {
    label: { type: String, required: true },
    payload: { type: String, default: "" },
  },
  { _id: false }
);

const ChatbotConfigSchema = new Schema(
  {
    name: { type: String, default: "Aria" },
    avatar: { type: String, default: "" },
    welcome: { type: String, default: "Hi! How can I help?" },
    placeholder: { type: String, default: "Type your message…" },
    quickActions: { type: [QuickActionSchema], default: [] },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    defaultOgImage: { type: String, default: "" },
    schemaOrg: { type: String, default: "" },
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    business: { type: BusinessSchema, default: () => ({}) },
    social: { type: SocialSchema, default: () => ({}) },
    analytics: { type: AnalyticsSchema, default: () => ({}) },
    chatbot: { type: ChatbotConfigSchema, default: () => ({}) },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type Settings = InferSchemaType<typeof SettingsSchema> & { _id: string };
const SettingsModel: Model<Settings> =
  (models.Settings as Model<Settings>) || model<Settings>("Settings", SettingsSchema);
export default SettingsModel;
