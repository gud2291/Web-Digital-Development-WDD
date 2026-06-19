import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";
import { slugify } from "@/lib/utils";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true, trim: true, lowercase: true },
    category: { type: String, default: "Web", index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
    visible: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    tech: { type: [String], default: [] },
    clientBackground: { type: String, default: "" },
    objective: { type: String, default: "" },
    solution: { type: String, default: "" },
    timeline: { type: String, default: "" },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving if slug is not set
ProjectSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

export type Project = InferSchemaType<typeof ProjectSchema> & { _id: string };
const ProjectModel: Model<Project> =
  (models.Project as Model<Project>) || model<Project>("Project", ProjectSchema);
export default ProjectModel;

