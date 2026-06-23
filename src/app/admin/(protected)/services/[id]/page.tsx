import { notFound } from "next/navigation";
import { getServiceById } from "@/server/services/service.service";
import { getServiceLinkOptions, getBlogLinkOptions } from "@/server/services/relatedLinks";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditServicePage({ params }: PageProps) {
  const doc = await getServiceById(params.id).catch(() => null);
  if (!doc) notFound();

  const [allServiceOptions, blogOptions] = await Promise.all([
    getServiceLinkOptions(),
    getBlogLinkOptions(),
  ]);
  // Don't let a service link to itself.
  const serviceOptions = allServiceOptions.filter((o) => o.slug !== doc.slug);

  return (
    <>
      <PageHeader title="Edit service" description={doc.title} />
      <ServiceForm
        serviceOptions={serviceOptions}
        blogOptions={blogOptions}
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
          relatedServices: doc.relatedServices ?? [],
          relatedBlogs: doc.relatedBlogs ?? [],
          visible: !!doc.visible,
          quotationEnabled: !!doc.quotationEnabled,
          quotationTitle: doc.quotationTitle ?? "",
          quotationCostRange: doc.quotationCostRange ?? "",
          quotationScope: doc.quotationScope ?? [],
          quotationDeliveryTime: doc.quotationDeliveryTime ?? "",
          quotationHostingCost: doc.quotationHostingCost ?? "",
        }}
      />
    </>
  );
}
