import { getSiteContent } from "@/server/services/siteContent.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { SiteContentForm } from "./SiteContentForm";

export const dynamic = "force-dynamic";

export default async function SiteContentAdminPage() {
  const doc = await getSiteContent().catch(() => null);
  return (
    <>
      <PageHeader
        title="Site Content"
        description="About copy, contact page text, nav links, and footer."
      />
      <SiteContentForm
        initial={{
          about: doc?.about ?? undefined,
          contactPage: doc?.contactPage ?? undefined,
          navLinks: doc?.navLinks ?? undefined,
          footer: doc?.footer ?? undefined,
        }}
      />
    </>
  );
}
