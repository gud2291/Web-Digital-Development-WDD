import { NextResponse } from "next/server";
import { connectDB } from "@/server/db/mongodb";
import Blog from "@/server/models/Blog";
import Project from "@/server/models/Project";
import Service from "@/server/models/Service";
import Team from "@/server/models/Team";
import Testimonial from "@/server/models/Testimonial";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import type { AdminSearchItem } from "@/types/admin";

export const dynamic = "force-dynamic";

/**
 * §15.1 — feeds the Cmd+K spotlight palette. Returns a flat list of all
 * editable resources (titles/names + the edit-page href) so the palette can
 * fuzzy-search them client-side.
 */
export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;

  return handle(async () => {
    await connectDB();
    const [blogs, projects, services, team, testimonials] = await Promise.all([
      Blog.find({}).select("title").limit(200).lean(),
      Project.find({}).select("title").limit(200).lean(),
      Service.find({}).select("title").limit(200).lean(),
      Team.find({}).select("name").limit(200).lean(),
      Testimonial.find({}).select("clientName").limit(200).lean(),
    ]);

    const items: AdminSearchItem[] = [
      ...blogs.map((b) => ({
        id: String(b._id),
        label: b.title || "Untitled post",
        type: "Blog" as const,
        href: `/admin/blog/${b._id}`,
      })),
      ...projects.map((p) => ({
        id: String(p._id),
        label: p.title || "Untitled project",
        type: "Project" as const,
        href: `/admin/projects/${p._id}`,
      })),
      ...services.map((s) => ({
        id: String(s._id),
        label: s.title || "Untitled service",
        type: "Service" as const,
        href: `/admin/services/${s._id}`,
      })),
      ...team.map((t) => ({
        id: String(t._id),
        label: t.name || "Team member",
        type: "Team" as const,
        href: `/admin/team/${t._id}`,
      })),
      ...testimonials.map((t) => ({
        id: String(t._id),
        label: t.clientName || "Testimonial",
        type: "Testimonial" as const,
        href: `/admin/testimonials/${t._id}`,
      })),
    ];

    return NextResponse.json({ items });
  });
}
