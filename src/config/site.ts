/**
 * Centralised site metadata — single source of truth for SEO, OG cards,
 * structured data, sitemap, robots, and any place that needs branding.
 *
 * Keep this file free of secrets — only public-safe values belong here.
 */

export const siteConfig = {
  name: "Web Digital Development",
  shortName: "Web Digital",
  title: "Website Design Company in Delhi | Web Digital Development",
  description:
    "Delhi web design & development studio building fast, responsive sites that turn visitors into paying customers. 150+ delivered — get a free quote.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://webdigitaldevelopment.com",
  ogImage: "/og-image.png",
  twitterHandle: "@webdigitaldev",
  email: "support@webdigitaldevelopment.com",
  phone: "+91 81302 70050",
  whatsapp: "918130270050",
  address: {
    street: "Palam",
    city: "New Delhi",
    region: "Delhi",
    country: "IN",
    postalCode: "110045",
  },
  social: {
    facebook: "https://www.facebook.com/share/17p9P2C62A/?mibextid=wwXIfr",
    twitter: "",
    linkedin: "https://linkedin.com/in/gudia-yadav-7aa002220",
    instagram: "https://www.instagram.com/web_digital_development112211",
    youtube: "",
  },
  keywords: [
    "website design company in Delhi",
    "web development company India",
    "website designing services Delhi",
    "SEO services Delhi",
    "ecommerce website development Delhi",
    "digital marketing agency Delhi",
    "responsive web design",
    "web digital development",
  ],
  business: {
    hoursWeek: "Mon-Sat: 10:00 AM - 7:00 PM",
    hoursSunday: "Sunday: Closed",
  },
} as const;

export type SiteConfig = typeof siteConfig;
