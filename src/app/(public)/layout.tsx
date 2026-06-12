import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingActions } from "@/components/FloatingActions";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { ToastProvider } from "@/components/public/ToastProvider";
import { BrandLoader } from "@/components/public/BrandLoader";
import { ChatWidget } from "@/components/public/Chatbot/ChatWidget";
import { CookieBanner } from "@/components/public/CookieBanner";
import { StickyQuoteCTA } from "@/components/public/StickyQuoteCTA";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import { SmoothScrollProvider } from "@/components/public/SmoothScrollProvider";
import { PageTransition } from "@/components/public/PageTransition";
import { ActivityTicker } from "@/components/public/ActivityTicker";
import { getSettings } from "@/server/services/settings.service";
import { siteConfig } from "@/config/site";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => null);

  const socialLinks: Record<string, string> = {
    facebook: settings?.social?.fb || siteConfig.social.facebook,
    linkedin: settings?.social?.li || siteConfig.social.linkedin,
    instagram: settings?.social?.ig || siteConfig.social.instagram,
    youtube: settings?.social?.yt || siteConfig.social.youtube,
  };

  const analyticsIds = {
    ga4: settings?.analytics?.ga4 || undefined,
    gtm: settings?.analytics?.gtm || undefined,
    clarity: settings?.analytics?.clarity || undefined,
  };

  return (
    <>
      <SmoothScrollProvider />
      <ReadingProgressBar />
      <BrandLoader />
      <SiteHeader socialLinks={socialLinks} />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <FloatingActions />
      <MobileBottomBar />
      <ToastProvider />
      <ChatWidget />
      <StickyQuoteCTA />
      <CookieBanner analyticsIds={analyticsIds} />
      <ActivityTicker />
    </>
  );
}
