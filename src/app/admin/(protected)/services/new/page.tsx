import { PageHeader } from "@/components/admin/PageHeader";
import { getServiceLinkOptions, getBlogLinkOptions } from "@/server/services/relatedLinks";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const [serviceOptions, blogOptions] = await Promise.all([
    getServiceLinkOptions(),
    getBlogLinkOptions(),
  ]);
  return (
    <>
      <PageHeader title="New service" description="Add a service offering." />
      <ServiceForm serviceOptions={serviceOptions} blogOptions={blogOptions} />
    </>
  );
}
