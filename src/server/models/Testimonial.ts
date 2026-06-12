import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientPhoto: { type: String, default: "" },
    clientCompany: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    helpfulCount: { type: Number, default: 0 },
    adminHearted: { type: Boolean, default: false },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    source: { type: String, enum: ["google", "manual"], default: "manual" },
  },
  { timestamps: true }
);

export type Testimonial = InferSchemaType<typeof TestimonialSchema> & { _id: string };
const TestimonialModel: Model<Testimonial> =
  (models.Testimonial as Model<Testimonial>) || model<Testimonial>("Testimonial", TestimonialSchema);
export default TestimonialModel;
