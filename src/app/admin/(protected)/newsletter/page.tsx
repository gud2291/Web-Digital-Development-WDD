import { listSubscribers } from "@/server/services/newsletter.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterClient } from "./NewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const subs = await listSubscribers().catch(() => [] as Awaited<ReturnType<typeof listSubscribers>>);

  const serialised = subs.map((s) => ({
    email: s.email,
    source: s.source ?? "footer",
    unsubscribed: !!s.unsubscribed,
    subscribedAt: s.subscribedAt
      ? new Date(s.subscribedAt).toISOString()
      : s.createdAt
        ? new Date(s.createdAt).toISOString()
        : new Date().toISOString(),
  }));

  return (
    <>
      <PageHeader title="Newsletter" description="Email subscribers from the footer and blog signup forms." />
      <NewsletterClient initial={serialised} />
    </>
  );
}
