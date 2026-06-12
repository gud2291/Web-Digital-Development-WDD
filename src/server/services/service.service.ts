import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Service from "@/server/models/Service";
import type { CreateServiceInput, UpdateServiceInput } from "@/server/validation/service";

export async function listServices(opts: { includeHidden?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!opts.includeHidden) filter.visible = true;
  return Service.find(filter).sort({ order: 1, createdAt: -1 }).lean();
}

export async function getServiceBySlug(slug: string, includeHidden = false) {
  await connectDB();
  const filter: Record<string, unknown> = { slug };
  if (!includeHidden) filter.visible = true;
  return Service.findOne(filter).lean();
}

export async function getServiceById(id: string) {
  await connectDB();
  return Service.findById(id).lean();
}

export async function createService(data: CreateServiceInput) {
  await connectDB();
  return Service.create(data);
}

export async function updateService(id: string, data: UpdateServiceInput) {
  await connectDB();
  return Service.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteService(id: string) {
  await connectDB();
  await Service.findByIdAndDelete(id);
  return { ok: true };
}
