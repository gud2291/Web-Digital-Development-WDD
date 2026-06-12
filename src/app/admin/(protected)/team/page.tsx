import Link from "next/link";
import { listTeam } from "@/server/services/team.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { TeamListClient } from "./TeamListClient";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TeamAdminListPage() {
  const items = await listTeam({ includeHidden: true }).catch(() => []);
  const rows = items.map((t) => ({
    _id: String(t._id),
    name: t.name,
    designation: t.designation ?? "",
    photo: t.photo ?? "",
    visible: !!t.visible,
  }));

  return (
    <>
      <PageHeader
        title="Team"
        description="Team member profiles."
        actions={
          <Link href="/admin/team/new">
            <Btn iconRight="plus">New member</Btn>
          </Link>
        }
      />
      <TeamListClient initial={rows} />
    </>
  );
}
