import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/public/ToastProvider";
import { BrandLoader } from "@/components/public/BrandLoader";
import { SmoothScrollProvider } from "@/components/public/SmoothScrollProvider";
import { PageTransition } from "@/components/public/PageTransition";
import { DeferredPublicWidgets } from "@/components/public/DeferredPublicWidgets";
import { GoogleTranslateInit } from "@/components/public/LanguageSwitcher";
import { getCachedSettings } from "@/server/services/settings.service";
import { getCachedNavServices } from "@/server/services/service.service";
import { siteConfig } from "@/config/site";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([
    getCachedSettings().catch(() => null),
    getCachedNavServices().catch(() => []),
  ]);

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
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SmoothScrollProvider />
      <BrandLoader />
      <SiteHeader socialLinks={socialLinks} services={services} />
      {/* Google Translate Element loader + hidden mount node (client-side only). */}
      <GoogleTranslateInit />
      <main id="main-content" suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <ToastProvider />
      {/* PERF Task 3 — these non-critical fixed-overlay widgets are loaded
          client-side only and mounted on idle/first-interaction. They still
          appear and behave identically; see DeferredPublicWidgets. */}
      <DeferredPublicWidgets analyticsIds={analyticsIds} />
    </>
  );
}
