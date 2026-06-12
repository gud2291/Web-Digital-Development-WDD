import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    // §17.1 — single brand suffix, e.g. "Blog | Web Digital Development".
    // Pages built via buildMetadata() return an absolute title (already
    // suffixed once), so this template only applies to raw string titles.
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1B4DA8" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { title: siteConfig.name, statusBarStyle: "black-translucent" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: siteConfig.url },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1B3B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { SchemaMarkup, localBusinessSchema, websiteSchema } from "@/components/SchemaMarkup";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body>
        {/* §2 — set theme pre-paint to avoid FOUC. Default LIGHT; only go dark
            when the visitor previously toggled it (no OS auto-dark). The admin
            panel has its own independent key (wdd-admin-theme) handled by the
            admin layout, so the public key is ignored on /admin. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname.indexOf('/admin')===0)return;var t=localStorage.getItem('wdd-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
        <SchemaMarkup data={localBusinessSchema()} />
        <SchemaMarkup data={websiteSchema()} />
        {children}
      </body>
    </html>
  );
}
