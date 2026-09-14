import Link from "next/link";
import { Icon } from "./Icon";
import { Logo } from "./ui";
import { NewsletterSignup } from "@/components/public/NewsletterSignup";
import { siteConfig } from "@/config/site";
import { getCachedSettings } from "@/server/services/settings.service";

const QUICK_LINKS: [string, string][] = [
  ["/", "Home"],
  ["/about", "About Us"],
  ["/projects", "Projects"],
  ["/blog", "Blog"],
  ["/reviews", "Reviews"],
  ["/contact", "Contact Us"],
];

// Service-area pages (/locations/[slug]). Linked here so every location page has
// a sitewide internal link instead of being reachable only via the sitemap.
const LOCATION_LINKS: [string, string][] = [
  ["Delhi", "/locations/delhi"],
  ["Noida", "/locations/noida"],
  ["Gurgaon", "/locations/gurgaon"],
  ["Faridabad", "/locations/faridabad"],
  ["Ghaziabad", "/locations/ghaziabad"],
  ["Rohini", "/locations/rohini"],
  ["South Delhi", "/locations/south-delhi"],
  ["Dwarka", "/locations/dwarka"],
  ["Janakpuri", "/locations/janakpuri"],
];

const SERVICE_LINKS: [string, string][] = [
  ["Website Design", "/services/website-designing"],
  ["Website Development", "/services/website-development"],
  ["E-commerce", "/services/ecommerce-development"],
  ["SEO Optimization", "/services/seo-services"],
  ["Digital Marketing", "/services/digital-marketing"],
  ["Graphic Designing", "/services/graphic-designing"],
  ["Website Redesign", "/services/website-redesign"],
  ["WordPress Website", "/services/wordpress-website"],
  ["Mobile-First Design", "/services/mobile-first-design"],
];

export async function SiteFooter() {
  const settings = await getCachedSettings().catch(() => null);

  const socialLinks: Record<string, string> = {
    facebook: settings?.social?.fb || siteConfig.social.facebook,
    linkedin: settings?.social?.li || siteConfig.social.linkedin,
    instagram: settings?.social?.ig || siteConfig.social.instagram,
    youtube: settings?.social?.yt || siteConfig.social.youtube,
  };

  const phone = settings?.business?.phone || siteConfig.phone;
  const email = settings?.business?.email || siteConfig.email;
  const addressStr = settings?.business?.address || `${siteConfig.address.street}, ${siteConfig.address.city}`;

  return (
    <footer className="site-ftr">
      <div className="container site-ftr__grid">
        <div className="site-ftr__about">
          <Logo h={36} />
          <p>
            Web Digital Development — a Delhi-based website design and development studio.
            Serving clients across Delhi NCR (Delhi, Noida, Gurgaon, Faridabad) and the rest
            of India since 2019.
          </p>
          <div className="site-ftr__socials">
            {(["facebook", "linkedin", "instagram", "youtube"] as const).map((s) => {
              const url = socialLinks[s];
              if (!url) return null;
              return (
                <a key={s} href={url} target="_blank" rel="noopener noreferrer" className="site-ftr__social" aria-label={s}>
                  <Icon name={s} size={16} />
                </a>
              );
            })}
          </div>
          <div style={{ marginTop: 20 }}>
            <NewsletterSignup variant="compact" source="footer" />
          </div>
        </div>

        <div>
          <h5>Quick Links</h5>
          {QUICK_LINKS.map(([to, label]) => (
            <Link key={to + label} href={to}>{label}</Link>
          ))}
        </div>

        <div>
          <h5>Services</h5>
          {SERVICE_LINKS.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>

        <div>
          <h5>Contact</h5>
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="site-ftr__contact-item">
            <Icon name="phone" size={13} /> {phone}
          </a>
          <a href={`mailto:${email}`} className="site-ftr__contact-item">
            <Icon name="mail" size={13} /> {email}
          </a>
          <span className="site-ftr__contact-item">
            <Icon name="map" size={13} /> {addressStr}
          </span>
          <h5 style={{ marginTop: 18 }}>Legal</h5>
          <Link href="/legal/privacy-policy">Privacy Policy</Link>
          <Link href="/legal/terms">Terms &amp; Conditions</Link>
        </div>
      </div>

      <div className="container site-ftr__areas">
        <h5>Service Areas</h5>
        <div className="site-ftr__areas-list">
          {LOCATION_LINKS.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>
      </div>

      <div className="container site-ftr__bottom">
        <div>© 2026 Web Digital Development — All rights reserved.</div>
        <div>Made with care in Delhi, India 🇮🇳</div>
      </div>
    </footer>
  );
}
