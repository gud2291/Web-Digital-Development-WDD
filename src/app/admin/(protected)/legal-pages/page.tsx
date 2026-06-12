import { listLegalPages } from "@/server/services/legalPage.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { LegalPagesClient } from "./LegalPagesClient";

export const dynamic = "force-dynamic";

export default async function LegalPagesAdminPage() {
  const items = await listLegalPages().catch(() => []);
  const docs = items
    .filter((d) => ["privacy-policy", "terms", "refund"].includes(d.slug))
    .map((d) => ({
      slug: d.slug as "privacy-policy" | "terms" | "refund",
      title: d.title,
      content: d.content,
      lastUpdated: d.lastUpdated ? new Date(d.lastUpdated).toISOString() : undefined,
    }));

  return (
    <>
      <PageHeader
        title="Legal Pages"
        description="Privacy Policy, Terms of Service, and Refund Policy."
      />
      <LegalPagesClient initial={docs} />
    </>
  );
}
