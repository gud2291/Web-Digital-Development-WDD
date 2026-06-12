import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "" },
    uploadedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });

export type Media = InferSchemaType<typeof MediaSchema> & { _id: string };
const MediaModel: Model<Media> = (models.Media as Model<Media>) || model<Media>("Media", MediaSchema);
export default MediaModel;
