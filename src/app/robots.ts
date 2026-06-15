import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  // No trailing slash — blocks /admin AND /admin/* (stricter than /admin/).
  // /registrations is intentionally removed from the public site; block it
  // so any cached/legacy links don't get indexed if they're hit again.
  const disallow = ["/admin", "/api", "/registrations"];
  // Major AI / answer-engine crawlers — explicitly allowed so the brand can be
  // cited in ChatGPT, Perplexity, Gemini, AI Overviews, Copilot, etc. (GEO).
  // They get the same private-path disallows as every other agent.
  const aiAgents = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "Claude-Web",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiAgents.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
