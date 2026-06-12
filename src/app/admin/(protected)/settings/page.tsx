import { getSettings } from "@/server/services/settings.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const doc = await getSettings().catch(() => null);
  return (
    <>
      <PageHeader title="Settings" description="Business info, social, analytics, chatbot and account security." />
      <SettingsForm
        initial={{
          business: doc?.business
            ? {
                phone: doc.business.phone ?? "",
                email: doc.business.email ?? "",
                address: doc.business.address ?? "",
                hoursWeek: doc.business.hoursWeek ?? "",
                hoursSunday: doc.business.hoursSunday ?? "",
              }
            : undefined,
          social: doc?.social
            ? {
                fb: doc.social.fb ?? "",
                tw: doc.social.tw ?? "",
                li: doc.social.li ?? "",
                ig: doc.social.ig ?? "",
                yt: doc.social.yt ?? "",
              }
            : undefined,
          analytics: doc?.analytics
            ? {
                ga4: doc.analytics.ga4 ?? "",
                gtm: doc.analytics.gtm ?? "",
                clarity: doc.analytics.clarity ?? "",
              }
            : undefined,
          chatbot: doc?.chatbot
            ? {
                name: doc.chatbot.name ?? "Aria",
                avatar: doc.chatbot.avatar ?? "",
                welcome: doc.chatbot.welcome ?? "",
                placeholder: doc.chatbot.placeholder ?? "",
                quickActions: (doc.chatbot.quickActions ?? []).map((q) => ({
                  label: q.label,
                  payload: q.payload ?? "",
                })),
              }
            : undefined,
        }}
      />
    </>
  );
}
