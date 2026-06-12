import Link from "next/link";
import { listProjects } from "@/server/services/project.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectsListClient } from "./ProjectsListClient";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProjectsAdminListPage() {
  const items = await listProjects({ includeHidden: true }).catch(() => []);
  const rows = items.map((p) => ({
    _id: String(p._id),
    title: p.title,
    category: p.category ?? "Web",
    featured: !!p.featured,
    visible: !!p.visible,
  }));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Portfolio items."
        actions={
          <Link href="/admin/projects/new">
            <Btn iconRight="plus">New project</Btn>
          </Link>
        }
      />
      <ProjectsListClient initial={rows} />
    </>
  );
}
