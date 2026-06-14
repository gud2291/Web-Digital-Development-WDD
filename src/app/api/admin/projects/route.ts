import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/server/services/project.service";
import { createProjectSchema } from "@/server/validation/project";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { revalidatePublic } from "@/server/utils/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listProjects({ includeHidden: true });
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createProjectSchema.parse(await req.json());
    const doc = await createProject(data);
    revalidatePublic.projects();
    return NextResponse.json(doc, { status: 201 });
  });
}
