import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
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
  },
  { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });

export type Contact = InferSchemaType<typeof ContactSchema> & { _id: string };
const ContactModel: Model<Contact> =
  (models.Contact as Model<Contact>) || model<Contact>("Contact", ContactSchema);
export default ContactModel;
