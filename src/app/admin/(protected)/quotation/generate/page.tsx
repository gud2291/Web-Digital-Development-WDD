import Link from "next/link";
import { listServices } from "@/server/services/service.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { Btn } from "@/components/ui";
import { GenerateQuotationForm, type GenServiceOption } from "./GenerateQuotationForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: { name?: string; email?: string; phone?: string; business?: string };
}

export default async function GenerateQuotationPage({ searchParams }: PageProps) {
  const all = await listServices({ includeHidden: true }).catch(() => []);
  const services: GenServiceOption[] = all
    .filter((s) => s.quotationEnabled)
    .map((s) => ({ slug: s.slug as string, title: (s.quotationTitle || s.title) as string }));

  return (
    <>
      <PageHeader
        title="Generate Quotation"
        description="Enter a client's details, pick a service, then download the quotation PDF or email it to the client."
        actions={
          <Link href="/admin/quotation">
            <Btn variant="ghost" icon="filter">Quotation settings</Btn>
          </Link>
        }
      />
      <GenerateQuotationForm
        services={services}
        prefill={{
          clientName: searchParams?.name ?? "",
          email: searchParams?.email ?? "",
          phone: searchParams?.phone ?? "",
          business: searchParams?.business ?? "",
        }}
      />
    </>
  );
}
