import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // No trailing slash — blocks /admin AND /admin/* (stricter than /admin/).
        // /registrations is intentionally removed from the public site; block it
        // so any cached/legacy links don't get indexed if they're hit again.
        disallow: ["/admin", "/api", "/registrations"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
