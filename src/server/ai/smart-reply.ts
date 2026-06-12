import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Chatbot from "@/server/models/Chatbot";
import { siteConfig } from "@/config/site";

/**
 * Self-hosted smart reply engine for the chatbot.
 * Uses keyword matching against the admin-managed Knowledge Base (MongoDB)
 * plus a set of hardcoded default responses for common queries.
 * No external AI API required.
 */

// ─── Types ──────────────────────────────────────────────────────────────
interface KbDoc {
  title: string;
  content: string;
  category: string;
}

interface ChatMsg {
  role: "user" | "bot";
  text: string;
}

// ─── Default Responses (fallback when no KB match) ──────────────────────
const DEFAULT_RESPONSES: { keywords: string[]; reply: string; priority: number }[] = [
  // Greetings
  {
    keywords: ["hi", "hello", "hey", "hii", "hiii", "namaste", "namaskar", "good morning", "good afternoon", "good evening"],
    reply: `Hi there! 👋 Welcome to ${siteConfig.name}. I'm Aria, your digital assistant. How can I help you today?\n\nYou can ask me about:\n• Our services (Web Design, Development, SEO, etc.)\n• Our process & how we work\n• Getting a quote for your project\n\nOr just type your question!`,
    priority: 1,
  },
  // Services overview
  {
    keywords: ["services", "service", "offer", "provide", "kya karte", "what do you do", "kya karte ho"],
    reply: `We offer a complete range of digital services:\n\n🎨 **Website Designing** — Mobile-first, pixel-perfect designs\n💻 **Website Development** — Next.js, React, WordPress\n🛒 **E-Commerce Development** — Online stores that convert\n🔍 **SEO Services** — First-page rankings on Google\n📱 **Digital Marketing** — Social media, PPC, content\n🎯 **Graphic Designing** — Logos, branding, print media\n\nWould you like details about any specific service? Or I can connect you with our team for a free consultation!`,
    priority: 2,
  },
  // Web design
  {
    keywords: ["web design", "website design", "designing", "design", "ui", "ux", "figma"],
    reply: `Our **Website Designing** service includes:\n\n✅ Custom UI/UX design (no templates!)\n✅ Mobile-first, responsive layouts\n✅ Figma prototypes you can click through\n✅ Brand-aligned colors, typography & imagery\n✅ Unlimited revisions until you're happy\n\nEvery design is crafted to convert visitors into customers. Want to discuss your project? I can connect you with our design team!`,
    priority: 3,
  },
  // Development
  {
    keywords: ["development", "develop", "developer", "coding", "code", "react", "next", "nextjs", "wordpress", "website banao", "website banana"],
    reply: `Our **Website Development** service covers:\n\n✅ Modern stack: Next.js, React, TypeScript, Tailwind\n✅ Classic WordPress with custom themes\n✅ Lighthouse 90+ performance guaranteed\n✅ HTTPS, security headers, OWASP-checked\n✅ CMS integration for easy content updates\n\nWe build fast, secure, scalable websites. Tell me more about your project and I'll connect you with the right developer!`,
    priority: 3,
  },
  // SEO
  {
    keywords: ["seo", "ranking", "google", "search engine", "organic", "traffic", "rank"],
    reply: `Our **SEO Services** include:\n\n🔍 Technical SEO audit before we start\n📊 Keyword research with monthly search volumes\n📝 On-page SEO — titles, meta, schema, internal linking\n⚡ Technical SEO — speed, crawl, mobile, Core Web Vitals\n📈 Monthly ranking reports & strategy calls\n\nWe focus on real, sustainable rankings — not quick hacks. Want to know how we can improve your website's visibility?`,
    priority: 3,
  },
  // E-commerce
  {
    keywords: ["ecommerce", "e-commerce", "online store", "shop", "shopping", "woocommerce", "shopify", "cart"],
    reply: `Our **E-Commerce Development** includes:\n\n🛒 Custom online stores (WooCommerce, Shopify, custom)\n💳 Secure payment gateway integration\n📦 Inventory & order management\n📱 Mobile-optimized checkout\n🔒 SSL & PCI compliance\n\nWe build stores that actually sell! Would you like to discuss your e-commerce project?`,
    priority: 3,
  },
  // Pricing
  {
    keywords: ["price", "pricing", "cost", "charge", "budget", "kitna", "rate", "quote", "quotation", "estimate", "paisa", "rupee", "inr", "free"],
    reply: `Great question! Every project is unique, so we provide **custom proposals** after understanding your specific needs.\n\nHere's how it works:\n1️⃣ You tell us about your project\n2️⃣ We prepare a detailed proposal within 24 hours\n3️⃣ No obligation — completely free consultation!\n\nWant me to connect you with our team? You can also fill out our [contact form](/contact) or WhatsApp us directly!`,
    priority: 5,
  },
  // Process
  {
    keywords: ["process", "how do you work", "steps", "timeline", "time", "kitna time", "kaise karte", "approach", "methodology"],
    reply: `Our proven 4-step process:\n\n1️⃣ **Discovery** — We understand your goals, audience & competitors\n2️⃣ **Design** — Wireframes → Mockups → Your approval\n3️⃣ **Development** — Clean code, mobile-first, tested\n4️⃣ **Launch & Support** — Go live + 30 days free support\n\nMost projects take 2-6 weeks depending on complexity. Want to start with a free discovery call?`,
    priority: 3,
  },
  // Contact
  {
    keywords: ["contact", "call", "phone", "email", "reach", "talk", "connect", "whatsapp", "number", "address", "location", "office"],
    reply: `You can reach us through:\n\n📞 **Phone:** ${siteConfig.phone}\n📧 **Email:** ${siteConfig.email}\n📍 **Office:** ${siteConfig.address.street}, ${siteConfig.address.city}\n💬 **WhatsApp:** [Chat now](https://wa.me/${siteConfig.whatsapp})\n\nOr fill out our [contact form](/contact) — we reply within 4 business hours!\n\nWant me to connect you with our team right now?`,
    priority: 4,
  },
  // About
  {
    keywords: ["about", "company", "who are you", "team", "experience", "since", "established", "kaun ho"],
    reply: `**${siteConfig.name}** is a Delhi-based website design & development studio, serving clients across India since 2019.\n\n🏢 Based in Palam, New Delhi\n👥 Expert team of designers, developers & SEO specialists\n🌐 100+ websites delivered\n⭐ 5-star rated on Google\n\nWe're passionate about building websites that generate real business leads! Want to know more?`,
    priority: 3,
  },
  // Portfolio / projects
  {
    keywords: ["portfolio", "projects", "work", "previous", "examples", "case study", "client", "dikha do"],
    reply: `Check out our recent work on our [Projects page](/projects)! 🎨\n\nWe've built websites for businesses across various industries including:\n• Corporate & business websites\n• E-commerce stores\n• Service-based businesses\n• Startups & portfolios\n\nWant to see something specific? Or shall I connect you with our team to discuss your project?`,
    priority: 3,
  },
  // Human handoff
  {
    keywords: ["human", "person", "real person", "agent", "support", "manager", "insaan", "banda"],
    reply: `I'd be happy to connect you with our team! 🤝\n\nYou can reach a real person through:\n📞 Call: ${siteConfig.phone}\n💬 WhatsApp: [Chat now](https://wa.me/${siteConfig.whatsapp})\n📧 Email: ${siteConfig.email}\n\nOr fill out our [contact form](/contact) and someone will get back to you within 4 business hours!`,
    priority: 5,
  },
  // Thanks
  {
    keywords: ["thanks", "thank you", "thankyou", "dhanyavaad", "shukriya", "great", "awesome", "nice", "good"],
    reply: `You're welcome! 😊 I'm glad I could help.\n\nIf you have any more questions, feel free to ask anytime. And when you're ready to start your project, our team is just a message away!\n\n📞 ${siteConfig.phone} | 💬 [WhatsApp](https://wa.me/${siteConfig.whatsapp})`,
    priority: 1,
  },
  // Bye
  {
    keywords: ["bye", "goodbye", "see you", "alvida", "ok bye", "chalo"],
    reply: `Goodbye! 👋 It was great chatting with you.\n\nRemember, we're always here when you need us. Have a wonderful day! 🌟`,
    priority: 1,
  },
];

// ─── Keyword Matching Engine ────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function phraseMatch(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(" ")) {
      // Multi-word phrase match (higher value)
      if (lower.includes(kw)) score += 3;
    } else {
      // Single word match
      const tokens = tokenize(text);
      if (tokens.includes(kw)) score += 1;
      // Partial match for longer words
      else if (tokens.some((t) => t.startsWith(kw) || kw.startsWith(t))) score += 0.5;
    }
  }
  return score;
}

// ─── KB Search ──────────────────────────────────────────────────────────

async function searchKb(message: string): Promise<KbDoc | null> {
  try {
    await connectDB();
  } catch {
    return null;
  }

  const tokens = tokenize(message);
  if (tokens.length === 0) return null;

  const regexes = tokens
    .slice(0, 8)
    .map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  const orClauses = regexes.flatMap((r) => [{ title: r }, { content: r }]);

  const candidates = await Chatbot.find({ $or: orClauses })
    .select("title content category")
    .limit(10)
    .lean()
    .catch(() => [] as KbDoc[]);

  if (candidates.length === 0) return null;

  // Score each candidate by how many tokens match
  const scored = candidates.map((doc) => {
    const hits = regexes.reduce(
      (n, r) => (r.test(doc.title) || r.test(doc.content) ? n + 1 : n),
      0
    );
    // Bonus for title match
    const titleBonus = regexes.reduce((n, r) => (r.test(doc.title) ? n + 0.5 : n), 0);
    return { doc, score: hits + titleBonus };
  });

  scored.sort((a, b) => b.score - a.score);
  // Only return if we have a reasonable match (at least 2 tokens or 1 strong phrase)
  if (scored[0].score >= 1.5) {
    return scored[0].doc;
  }
  return null;
}

// ─── Main Reply Function ────────────────────────────────────────────────

const FALLBACK_REPLY = `I'm not sure I understand that fully, but I'm here to help! 🤔\n\nYou can ask me about:\n• Our services (Web Design, SEO, Development, etc.)\n• How we work & our process\n• Getting a quote\n• Contact information\n\nOr you can reach our team directly:\n📞 ${siteConfig.phone}\n💬 [WhatsApp](https://wa.me/${siteConfig.whatsapp})\n📧 ${siteConfig.email}`;

export async function generateSmartReply(message: string, _history: ChatMsg[] = []): Promise<string> {
  // 1. Check KB first (admin-managed answers take priority)
  const kbMatch = await searchKb(message);
  if (kbMatch) {
    return kbMatch.content;
  }

  // 2. Check default responses
  const matches = DEFAULT_RESPONSES.map((r) => ({
    ...r,
    score: phraseMatch(message, r.keywords),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => {
      // Higher priority responses win ties
      if (b.score === a.score) return b.priority - a.priority;
      return b.score - a.score;
    });

  if (matches.length > 0 && matches[0].score >= 0.5) {
    return matches[0].reply;
  }

  // 3. Fallback
  return FALLBACK_REPLY;
}
