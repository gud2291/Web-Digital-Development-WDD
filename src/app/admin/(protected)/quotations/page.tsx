import Link from "next/link";
import { listQuotations } from "@/server/services/quotation.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { Btn } from "@/components/ui";
import { QuotationsClient, type QuotationRow } from "./QuotationsClient";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const { items } = await listQuotations({ page: 1, limit: 300 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listQuotations>>["items"],
  }));

  const rows: QuotationRow[] = items.map((q) => ({
    _id: String(q._id),
    quotationNo: q.quotationNo,
    clientName: q.clientName,
    email: q.email ?? "",
    phone: q.phone ?? "",
    serviceTitle: q.serviceTitle ?? "",
    costRange: q.costRange ?? "",
    sentVia: (q.sentVia ?? "download") as QuotationRow["sentVia"],
    pdfUrl: q.pdfUrl ?? "",
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <>
      <PageHeader
        title="Quotation Records"
        description="Every quotation generated or sent — who received what, and how. Newest first."
        actions={
          <Link href="/admin/quotation/generate">
            <Btn icon="file">Generate quotation</Btn>
          </Link>
        }
      />
      <QuotationsClient initial={rows} />
    </>
  );
}
