import { notFound } from "next/navigation";
import { getTeamById } from "@/server/services/team.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditTeamPage({ params }: PageProps) {
  const doc = await getTeamById(params.id).catch(() => null);
  if (!doc) notFound();
  return (
    <>
      <PageHeader title="Edit team member" description={doc.name} />
      <TeamForm
        initial={{
          _id: String(doc._id),
          name: doc.name,
          designation: doc.designation ?? "",
          photo: doc.photo ?? "",
          bio: doc.bio ?? "",
          linkedinUrl: doc.linkedinUrl ?? "",
          visible: !!doc.visible,
        }}
      />
    </>
  );
}
