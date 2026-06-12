import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "" },
    photo: { type: String, default: "" },
    bio: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type Team = InferSchemaType<typeof TeamSchema> & { _id: string };
const TeamModel: Model<Team> = (models.Team as Model<Team>) || model<Team>("Team", TeamSchema);
export default TeamModel;
