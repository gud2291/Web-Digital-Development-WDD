import Link from "next/link";
import { getQuotationSettings } from "@/server/services/quotationSettings.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { Btn } from "@/components/ui";
import { QuotationSettingsForm } from "./QuotationSettingsForm";

export const dynamic = "force-dynamic";

export default async function QuotationSettingsPage() {
  const doc = await getQuotationSettings().catch(() => null);
  return (
    <>
      <PageHeader
        title="Quotation"
        description="Global defaults for the quotation PDF. Per-service cost & scope are set on each service."
        actions={
          <Link href="/admin/quotation/generate">
            <Btn icon="file">Generate quotation</Btn>
          </Link>
        }
      />
      <QuotationSettingsForm
        initial={{
          validity: doc?.validity ?? "1 Month",
          deliveryTime: doc?.deliveryTime ?? "",
          hostingCost: doc?.hostingCost ?? "",
          hostingNote: doc?.hostingNote ?? "",
          domainNote: doc?.domainNote ?? "",
          greetingTemplate: doc?.greetingTemplate ?? "",
          footerNote: doc?.footerNote ?? "",
          paymentTerms: (doc?.paymentTerms ?? []).map((p) => ({
            percent: p.percent ?? "",
            label: p.label ?? "",
            sub: p.sub ?? "",
          })),
          featureBadges: (doc?.featureBadges ?? []).map((b) => ({
            title: b.title ?? "",
            subtitle: b.subtitle ?? "",
          })),
        }}
      />
    </>
  );
}
