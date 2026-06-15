import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/ui";
import { ContactForm } from "@/components/public/ContactForm";
import { getCachedSiteContent } from "@/server/services/siteContent.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { getCachedSettings } from "@/server/services/settings.service";
import { siteConfig } from "@/config/site";
import { metadataFromDb } from "@/lib/seo";

// ISR: cached HTML; site-content & settings admin saves call
// revalidatePath("/contact") so edits appear immediately. Drafts render via
// draftMode() for editors only.
export const revalidate = 3600;

export async function generateMetadata() {
  return metadataFromDb("contact", {
    path: "/contact",
    title: "Contact Our Delhi Web Design Team",
    description:
      "Talk to Web Digital Development about your website, SEO or e-commerce project. We reply within 4 business hours — call, WhatsApp or send the form.",
  });
}

const PROMISES: [IconName, string, string, string][] = [
  ["zap", "Quick Response", "Reply in < 4 hours", "#2563EB"],
  ["badgeCheck", "Direct Access", "You talk to the team, not a call centre", "#22C55E"],
  ["shield", "NDA on Request", "We'll sign before you share anything", "#F59E0B"],
  ["heart", "No Hard Sell", "A quick chat about your goals", "#EC4899"],
];

const FALLBACK_SERVICES = ["Website Design", "Development", "SEO", "E-commerce", "Digital Marketing"];

export default async function ContactPage() {
  const [siteContentDb, settings, draft] = await Promise.all([
    getCachedSiteContent().catch(() => null),
    getCachedSettings().catch(() => null),
    getPreviewDoc<Record<string, unknown>>("site-content"),
  ]);
  const siteContent = (draft as unknown as typeof siteContentDb) ?? siteContentDb;

  const contactPage = siteContent?.contactPage ?? null;
  const business = settings?.business ?? null;
  const social = settings?.social ?? null;

  const promises: [IconName, string, string, string][] = contactPage?.quickPromises?.length
    ? contactPage.quickPromises.slice(0, 4).map((line, i): [IconName, string, string, string] => {
        const [defIcon, defTitle, defDesc, color] = PROMISES[i % PROMISES.length];
        const m = line.match(/^(.*?)[—:-]\s*(.*)$/);
        return [defIcon, m?.[1]?.trim() || defTitle, m?.[2]?.trim() || defDesc, color];
      })
    : PROMISES;

  const contactInfo: [IconName, string, string][] = [
    ["phone", "Phone", business?.phone || siteConfig.phone],
    ["mail", "Email", business?.email || siteConfig.email],
    ["map", "Office", business?.address || "Palam, New Delhi, Delhi — 110045"],
    ["clock", "Hours", business?.hoursWeek || siteConfig.business.hoursWeek],
  ];

  const socialLinks: { name: IconName; href: string }[] = [
    { name: "facebook", href: social?.fb || siteConfig.social.facebook },
    { name: "linkedin", href: social?.li || siteConfig.social.linkedin },
    { name: "instagram", href: social?.ig || siteConfig.social.instagram },
    { name: "youtube", href: social?.yt || siteConfig.social.youtube },
  ];

  return (
    <div className="page-wrapper--wide">
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <Reveal><h1 className="t-h1">Get in Touch — We&apos;re Here to Help</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 14 }}>
              {contactPage?.descText ||
                "Have a project, question or just want to chat? We reply within 4 business hours."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section--sm" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="promise-grid">
            {promises.map(([ic, t, d, c], idx) => (
              <Reveal key={t + idx} delay={idx * 60}>
                <div className="card promise-card">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: c + "18",
                      color: c,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={ic} />
                  </div>
                  <div style={{ fontWeight: 700 }}>{t}</div>
                  <div className="t-small" style={{ marginTop: 4 }}>{d}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="contact-grid" id="contact-form">
            <Reveal>
              <ContactForm services={FALLBACK_SERVICES} />
            </Reveal>

            <div>
              <Reveal delay={80}>
                <div className="card" style={{ padding: 28 }}>
                  <h2 className="t-h4">Contact Information</h2>
                  <div className="contact-info-list">
                    {contactInfo.map(([ic, l, v]) => (
                      <div key={l} className="contact-info-item">
                        <div className="contact-info-item__icon">
                          <Icon name={ic} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{l}</div>
                          <div className="t-small" style={{ fontSize: 13 }}>{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    {socialLinks.filter((s) => s.href).map((s) => (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-btn"
                        aria-label={s.name}
                      >
                        <Icon name={s.name} size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                {contactPage?.mapEmbedUrl ? (
                  <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", aspectRatio: "4 / 3" }}>
                    <iframe
                      src={contactPage.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Office location"
                    />
                  </div>
                ) : (
                  <div className="map-placeholder">
                    <svg viewBox="0 0 400 280" style={{ width: "100%", height: "100%", display: "block" }}>
                      <rect width={400} height={280} fill="#F1F5F9" />
                      {[40, 90, 170, 230, 310].map((x) => (
                        <line key={x} x1={x} y1={0} x2={x} y2={280} stroke="#D3DBE6" strokeWidth={1} />
                      ))}
                      {[40, 110, 180, 240].map((y) => (
                        <line key={y} x1={0} y1={y} x2={400} y2={y} stroke="#D3DBE6" strokeWidth={1} />
                      ))}
                      <path d="M 0 130 Q 120 80 200 140 Q 280 200 400 160" stroke="#94A3B8" strokeWidth={3} fill="none" />
                      <circle cx={200} cy={140} r={14} fill="#2563EB" />
                      <circle cx={200} cy={140} r={6} fill="#fff" />
                    </svg>
                    <div className="map-placeholder__label">📍 Web Digital Development, Palam, New Delhi</div>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
