import { notFound } from "next/navigation";
import { getServiceById } from "@/server/services/service.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditServicePage({ params }: PageProps) {
  const doc = await getServiceById(params.id).catch(() => null);
  if (!doc) notFound();

  return (
    <>
      <PageHeader title="Edit service" description={doc.title} />
      <ServiceForm
        initial={{
          _id: String(doc._id),
          title: doc.title,
          slug: doc.slug,
          shortDescription: doc.shortDescription ?? "",
          content: doc.content ?? "",
          coverImage: doc.coverImage ?? "",
          coverImageAlt: doc.coverImageAlt ?? "",
          icon: doc.icon ?? "monitor",
          features: doc.features ?? [],
          faqs: doc.faqs ?? [],
          pricingTiers: doc.pricingTiers ?? [],
          seoTitle: doc.seoTitle ?? "",
          seoDescription: doc.seoDescription ?? "",
          visible: !!doc.visible,
        }}
      />
    </>
  );
}
