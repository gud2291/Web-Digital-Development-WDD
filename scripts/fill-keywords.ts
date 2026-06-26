/* eslint-disable no-console */
/** One-off: place all 25 target keywords naturally across DB content.
 *  Idempotent. Run: npx tsx scripts/fill-keywords.ts */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

for (const name of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) continue;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const SENT = "<!--KW-->"; // sentinel so appended HTML blocks stay idempotent.

function setBlock(content: string, block: string): string {
  const base = content.split(SENT)[0].trimEnd();
  return `${base}\n${SENT}\n${block.trim()}\n`;
}

/** Replace FAQs whose question matches one of ours, then append ours (idempotent). */
function mergeFaqs(
  existing: { q: string; a: string }[],
  add: { q: string; a: string }[]
) {
  const ours = new Set(add.map((f) => f.q.toLowerCase()));
  const kept = (existing || []).filter((f) => !ours.has(f.q.toLowerCase()));
  return [...kept, ...add];
}

function maskUri(uri: string): string {
  try {
    const u = new URL(uri);
    const host = u.host;
    const db = u.pathname.replace(/^\//, "") || "(default)";
    return `host=${host} db=${db} user=${u.username ? "***" : "(none)"}`;
  } catch {
    return "unparseable URI";
  }
}

async function run() {
  const uri = process.env.MONGODB_URI as string;
  console.log("DB target →", maskUri(uri));

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const services = db.collection("services");
  const seometas = db.collection("seometas");
  const locationpages = db.collection("locationpages");
  const sitecontents = db.collection("sitecontents");
  const now = new Date();

  // ---- 1. SeoMeta titles + descriptions (keyword-optimised, within limits) ----
  const metas: { pageSlug: string; title: string; description: string }[] = [
    {
      pageSlug: "services/website-development",
      title: "Web Development Company in Delhi",
      description:
        "Website development company in Delhi serving businesses across India — hand-coded Next.js, React & WordPress, 400+ launches and Lighthouse 90+ builds.",
    },
    {
      pageSlug: "services/website-designing",
      title: "Website Design Services in Delhi",
      description:
        "Mobile-first website design services in Delhi for small businesses. Figma prototypes before code, conversion-focused, with post-launch support.",
    },
  ];
  for (const m of metas) {
    await seometas.updateOne(
      { pageSlug: m.pageSlug },
      { $set: { title: m.title, description: m.description, noIndex: false, updatedAt: now } },
      { upsert: true }
    );
  }

  // ---- 2. Service body / headings + FAQ + cover alt ----

  // website-designing
  const wd: any = await services.findOne({ slug: "website-designing" });
  const wdBlock = `<h2>Web design services in Delhi</h2>
<p>Our web design services cover everything from a one-page landing site to a full business website design — wireframes, a clickable Figma prototype, and a final design tuned for mobile and conversions. It's website design for small businesses and established brands alike.</p>`;
  const wdFaqs = mergeFaqs(wd.faqs, [
    {
      q: "Do you offer website design for small business owners?",
      a: "Yes. A lot of our work is website design for small business owners who need a professional site without a big in-house team. Our website designers for small business projects keep it simple and affordable — a clean, mobile-first design that builds trust and brings in real enquiries from day one.",
    },
    {
      q: "Can you redesign my existing website?",
      a: "Absolutely. We handle full website redesign work — keeping what already works, fixing what doesn't, and modernising the look, speed and structure. Whether it's a tired old site or a DIY build that never converted, a website redesign can turn it into something that actually earns its keep.",
    },
    {
      q: "I need a website for my business — where do I start?",
      a: "Start with a quick chat. Tell us what your business does and who you want to reach, and we'll map out the pages you need. If you need a website fast, we can usually get a small-business site live in days — no jargon, no pressure, and a fixed scope agreed in writing first.",
    },
  ]);
  await services.updateOne(
    { slug: "website-designing" },
    {
      $set: {
        content: setBlock(String(wd.content || ""), wdBlock),
        faqs: wdFaqs,
        coverImageAlt: "Website design services in Delhi shown on laptop and mobile",
        seoTitle: "Website Design Services in Delhi",
        seoDescription:
          "Mobile-first website design services in Delhi for small businesses. Figma prototypes before code, conversion-focused, with post-launch support.",
        updatedAt: now,
      },
    }
  );

  // website-development
  const dv: any = await services.findOne({ slug: "website-development" });
  const dvBlock = `<h2>Website development company in Delhi, serving all of India</h2>
<p>As a website development company, we build everything from a simple business website to complex web apps, with clients relying on our website development across India. Your business website ships fast, secure, and ready to rank from day one.</p>
<h2>Website management &amp; maintenance</h2>
<p>Launch is the start, not the finish. Our website management services cover updates, backups, security patches and content edits — so website management never becomes a headache after go-live.</p>`;
  const dvFaqs = mergeFaqs(dv.faqs, [
    {
      q: "How do I build a website for my business?",
      a: "The easiest way to build a website for your business is to start with a short discovery call. We plan the pages, then build a website for business goals like leads and sales — design, code, hosting and launch all handled for you. Prefer us to create a website for your business from scratch? Creating a website for business growth is exactly what we do.",
    },
  ]);
  await services.updateOne(
    { slug: "website-development" },
    {
      $set: {
        content: setBlock(String(dv.content || ""), dvBlock),
        faqs: dvFaqs,
        coverImageAlt: "Website development company in Delhi building a custom site",
        seoTitle: "Web Development Company in Delhi",
        seoDescription:
          "Website development company in Delhi serving businesses across India — hand-coded Next.js, React & WordPress, 400+ launches and Lighthouse 90+ builds.",
        updatedAt: now,
      },
    }
  );

  // ---- 3. Location page body (Delhi): "near me" + designing-company-in-delhi ----
  const del: any = await locationpages.findOne({ slug: "delhi" });
  const delBlock = `<p><strong>A website designing company in Delhi that's actually local:</strong> when people search for web design companies near me or web development companies near me, they want a team they can reach — same city, same time zone, same WhatsApp number. That's us. (For "near me" searches, our Google Business Profile also helps you find us on Google Maps.)</p>`;
  await locationpages.updateOne(
    { slug: "delhi" },
    { $set: { content: setBlock(String(del.content || ""), delBlock), updatedAt: now } }
  );

  // ---- 4. Home/About intro: "web design company" (natural, append-once) ----
  const sc: any = await sitecontents.findOne({});
  const aboutSentence =
    "Web Digital Development is a web design company based in Delhi, working with businesses across India and abroad.";
  let aboutDesc = String(sc?.about?.description || "");
  if (!aboutDesc.includes(aboutSentence)) {
    aboutDesc = `${aboutDesc.trimEnd()}\n${aboutSentence}`;
    await sitecontents.updateOne(
      { _id: sc._id },
      { $set: { "about.description": aboutDesc, updatedAt: now } }
    );
  }

  // ---- Report ----
  const lengths = metas.map(
    (m) => `${m.pageSlug}: title ${m.title.length} / desc ${m.description.length}`
  );
  console.log("meta lengths →\n  " + lengths.join("\n  "));
  const wd2: any = await services.findOne({ slug: "website-designing" });
  const dv2: any = await services.findOne({ slug: "website-development" });
  const del2: any = await locationpages.findOne({ slug: "delhi" });
  const sc2: any = await sitecontents.findOne({});
  console.log("designing faqs:", wd2.faqs.length, "| has KW block:", wd2.content.includes(SENT));
  console.log("development faqs:", dv2.faqs.length, "| has KW block:", dv2.content.includes(SENT));
  console.log("delhi has KW block:", del2.content.includes(SENT));
  console.log("about has web-design-company sentence:", sc2.about.description.includes(aboutSentence));

  // Final keyword coverage check across all touched fields.
  const haystack = [
    "Website Design Company in Delhi", // home title (unchanged)
    "Delhi web design & development studio", // home desc (unchanged)
    sc2.about.description,
    wd2.content, wd2.seoTitle, wd2.seoDescription, JSON.stringify(wd2.faqs),
    dv2.content, dv2.seoTitle, dv2.seoDescription, JSON.stringify(dv2.faqs), "Website Development", // dv title/H1
    del2.content,
  ].join("  ").toLowerCase();
  const keywords = [
    "website design company in delhi", "website design company", "web design company",
    "website design", "web design", "web design services", "website design services",
    "business website design", "website design for small business",
    "website designers for small business", "website redesign", "website development",
    "web development company", "website development company", "website development across india",
    "business website", "website management", "website management services",
    "website designing company in delhi", "web design companies near me",
    "web development companies near me", "i need a website", "need a website",
    "build a website for my business", "create a website for your business",
    "build a website for business", "creating a website for business",
  ];
  const missing = keywords.filter((k) => !haystack.includes(k));
  console.log(`keyword coverage: ${keywords.length - missing.length}/${keywords.length}`);
  if (missing.length) console.log("MISSING →", missing);

  await mongoose.disconnect();
  console.log("✓ Done.");
}

run().catch((e) => { console.error(e); process.exit(1); });
