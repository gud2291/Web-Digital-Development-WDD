import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Team from "@/server/models/Team";
import type { CreateTeamInput, UpdateTeamInput } from "@/server/validation/team";

export async function listTeam(opts: { includeHidden?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!opts.includeHidden) filter.visible = true;
  return Team.find(filter).sort({ order: 1, createdAt: -1 }).lean();
}

export async function getTeamById(id: string) {
  await connectDB();
  return Team.findById(id).lean();
}

export async function createTeamMember(data: CreateTeamInput) {
  await connectDB();
  return Team.create(data);
}

export async function updateTeamMember(id: string, data: UpdateTeamInput) {
  await connectDB();
  return Team.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteTeamMember(id: string) {
  await connectDB();
  await Team.findByIdAndDelete(id);
  return { ok: true };
}
