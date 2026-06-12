import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader title="New project" description="Add a portfolio item." />
      <ProjectForm />
    </>
  );
}
