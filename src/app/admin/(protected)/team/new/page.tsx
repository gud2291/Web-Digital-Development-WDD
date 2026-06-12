import { PageHeader } from "@/components/admin/PageHeader";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export default function NewTeamPage() {
  return (
    <>
      <PageHeader title="New team member" />
      <TeamForm />
    </>
  );
}
