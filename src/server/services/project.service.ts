import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Project from "@/server/models/Project";
import type { CreateProjectInput, UpdateProjectInput } from "@/server/validation/project";

export async function listProjects(opts: { includeHidden?: boolean; category?: string } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!opts.includeHidden) filter.visible = true;
  if (opts.category) filter.category = opts.category;
  return Project.find(filter).sort({ order: 1, createdAt: -1 }).lean();
}

export async function getProjectById(id: string) {
  await connectDB();
  return Project.findById(id).lean();
}

export async function getProjectBySlug(slug: string, includeHidden = false) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (!includeHidden) filter.visible = true;
  return Project.findOne(filter).lean();
}

export async function createProject(data: CreateProjectInput) {
  await connectDB();
  return Project.create(data);
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  await connectDB();
  return Project.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteProject(id: string) {
  await connectDB();
  await Project.findByIdAndDelete(id);
  return { ok: true };
}
