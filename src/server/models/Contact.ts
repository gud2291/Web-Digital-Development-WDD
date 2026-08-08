import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";
import { normalizeEmail } from "@/server/utils/spamGuard";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    /**
     * Canonical form of `email` (gmail dots/+aliases collapsed) — lets us spot
     * one bot inbox submitting under a hundred unique-looking addresses.
     */
    emailKey: { type: String, default: "", index: true },
    phone: { type: String, default: "" },
    service: { type: String, default: "" },
    budget: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "viewed", "replied", "closed"],
      default: "new",
      index: true,
    },
    ip: { type: String, default: "" },
    source: { type: String, default: "" },
    /** Passed the spam guard but scored high enough to withhold the auto-reply. */
    suspicious: { type: Boolean, default: false },
    spamScore: { type: Number, default: 0 },
    spamReasons: { type: [String], default: [] },
  },
  { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });

// Every write path (contact form, popup lead, chatbot escalation) goes through
// Model.create → this hook, so emailKey can never drift out of sync.
ContactSchema.pre("save", function setEmailKey(next) {
  if (this.isModified("email") || !this.emailKey) {
    this.emailKey = normalizeEmail(this.email ?? "");
  }
  next();
});

export type Contact = InferSchemaType<typeof ContactSchema> & { _id: string };
const ContactModel: Model<Contact> =
  (models.Contact as Model<Contact>) || model<Contact>("Contact", ContactSchema);
export default ContactModel;
