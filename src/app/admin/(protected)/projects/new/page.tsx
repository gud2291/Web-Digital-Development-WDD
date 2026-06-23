import { PageHeader } from "@/components/admin/PageHeader";
import { getServiceLinkOptions } from "@/server/services/relatedLinks";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const serviceOptions = await getServiceLinkOptions();
  return (
    <>
      <PageHeader title="New project" description="Add a portfolio item." />
      <ProjectForm serviceOptions={serviceOptions} />
    </>
  );
}
