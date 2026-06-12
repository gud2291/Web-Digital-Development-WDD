import { notFound } from "next/navigation";
import { getTestimonialById } from "@/server/services/testimonial.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { TestimonialForm } from "../TestimonialForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditTestimonialPage({ params }: PageProps) {
  const doc = await getTestimonialById(params.id).catch(() => null);
  if (!doc) notFound();
  return (
    <>
      <PageHeader title="Edit testimonial" description={doc.clientName} />
      <TestimonialForm
        initial={{
          _id: String(doc._id),
          clientName: doc.clientName,
          clientCompany: doc.clientCompany ?? "",
          clientPhoto: doc.clientPhoto ?? "",
          message: doc.message,
          rating: doc.rating ?? 5,
          visible: !!doc.visible,
          adminHearted: !!doc.adminHearted,
          source: (doc.source as "google" | "manual") ?? "manual",
        }}
      />
    </>
  );
}
