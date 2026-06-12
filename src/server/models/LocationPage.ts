import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const LocationPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    city: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    seoTitle: { type: String, required: true, trim: true },
    seoDescription: { type: String, required: true, trim: true },
    keywords: [{ type: String, trim: true }],
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type LocationPage = InferSchemaType<typeof LocationPageSchema> & { _id: string };
const LocationPageModel: Model<LocationPage> =
  (models.LocationPage as Model<LocationPage>) || model<LocationPage>("LocationPage", LocationPageSchema);
export default LocationPageModel;
