import { notFound } from "next/navigation";
import { getProjectById } from "@/server/services/project.service";
import { getServiceLinkOptions } from "@/server/services/relatedLinks";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: PageProps) {
  const doc = await getProjectById(params.id).catch(() => null);
  if (!doc) notFound();

  const serviceOptions = await getServiceLinkOptions();

  return (
    <>
      <PageHeader title="Edit project" description={doc.title} />
      <ProjectForm
        serviceOptions={serviceOptions}
        initial={{
          _id: String(doc._id),
          title: doc.title,
          category: doc.category ?? "Web",
          description: doc.description ?? "",
          image: doc.image ?? "",
          imageAlt: doc.imageAlt ?? "",
          liveUrl: doc.liveUrl ?? "",
          featured: !!doc.featured,
          visible: !!doc.visible,
          tech: doc.tech ?? [],
          clientBackground: doc.clientBackground ?? "",
          objective: doc.objective ?? "",
          solution: doc.solution ?? "",
          timeline: doc.timeline ?? "",
          features: doc.features ?? [],
          relatedServices: doc.relatedServices ?? [],
        }}
      />
    </>
  );
}
