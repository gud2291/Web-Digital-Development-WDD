/* eslint-disable no-console */
/**
 * One-off content/data fix script (CONTENT_FINAL.md is the source of truth).
 * Covers Issues 1, 2, 3, 6, 8, 12 — all the DB-side fixes:
 *   1  clientLogos → real WDD clients (no fake big brands)
 *   2  heroSlides  → 3 content slides + 1 Cloudinary video slide
 *   3  stats       → 400+/250+/6+/24×7
 *   6  about       → founder-voice heading, description, whyChooseUs, timeline
 *   8  footer      → CONTENT_FINAL tagline
 *   12 hero video  → Pexels mp4 re-hosted on Cloudinary (no external CDN link)
 *
 * Run: npx tsx scripts/fix-content.ts
 */
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { v2 as cloudinary } from "cloudinary";

function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf8");
    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}
loadEnvLocal();

const { MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI missing");
  process.exit(1);
}
const cloudinaryReady = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const PEXELS_VIDEO = "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4";
const ASSET_DIR = "assets-to-upload-OLD-illustrations/05-projects";

async function uploadLocal(localPath: string, folder: string): Promise<string> {
  if (!cloudinaryReady) return "";
  const abs = resolve(process.cwd(), localPath);
  if (!existsSync(abs)) {
    console.warn(`  [warn] missing file ${localPath} — skipping`);
    return "";
  }
  try {
    const res = await cloudinary.uploader.upload(abs, { folder });
    return res.secure_url;
  } catch (err: any) {
    console.warn(`  [warn] upload failed for ${localPath}: ${err.message}`);
    return "";
  }
}

async function uploadRemoteVideo(url: string): Promise<string> {
  if (!cloudinaryReady) return "";
  try {
    const res = await cloudinary.uploader.upload(url, {
      resource_type: "video",
      folder: "wdd/hero",
      public_id: "hero-bg-video",
      overwrite: true,
    });
    return res.secure_url;
  } catch (err: any) {
    console.warn(`  [warn] video upload failed: ${err.message}`);
    return "";
  }
}

async function run() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.db!;
  console.log("Connected.\n");

  // ── Issue 12: re-host the hero video on Cloudinary ──────────────────────
  console.log("[12] Uploading Pexels hero video to Cloudinary (resource_type=video)…");
  const videoUrl = await uploadRemoteVideo(PEXELS_VIDEO);
  console.log(videoUrl ? `  ✓ video → ${videoUrl}` : "  ⚠ no Cloudinary video; slide 4 will be image-only (no external link)");

  // ── Issue 1: upload real client project covers (for the logo image field) ──
  console.log("\n[1] Uploading real client cover images to Cloudinary (wdd/clients)…");
  const coverExpoed = await uploadLocal(`${ASSET_DIR}/expoed-cover.png`, "wdd/clients");
  const coverSbm = await uploadLocal(`${ASSET_DIR}/sbm-greens-cover.png`, "wdd/clients");
  const coverVish = await uploadLocal(`${ASSET_DIR}/vishwakarma-tour-cover.png`, "wdd/clients");
  const coverShree = await uploadLocal(`${ASSET_DIR}/shree-namo-motar-cover.png`, "wdd/clients");

  // ── Read existing homepage to reuse already-uploaded hero slide images ──
  const home = await db.collection("homepages").findOne<{ _id: any; heroSlides?: any[] }>({});
  if (!home) {
    console.error("✗ No homepage document found.");
    await mongoose.disconnect();
    process.exit(1);
  }
  const slides: any[] = Array.isArray(home.heroSlides) ? home.heroSlides : [];
  const imgFor = (frag: string) => slides.find((s) => (s?.image || "").includes(frag))?.image || "";
  const img1 = imgFor("slide-1");
  const img2 = imgFor("slide-2");
  const img3 = imgFor("slide-3");
  const img4 = imgFor("slide-4");
  // never leave a clientLogo image empty (model marks it required)
  const logoFallback = img1 || img2 || img3 || img4 || "";

  // ── Issue 2: 3 content slides (CONTENT_FINAL §6) + 1 video slide ─────────
  const heroSlides = [
    {
      type: "image",
      image: img1,
      video: "",
      title: "Websites that bring you **paying customers** — not just traffic.",
      subtitle:
        "Custom-coded design, SEO-ready development and honest, fixed-price quotes. We've shipped 400+ websites that actually grow businesses.",
      ctaText: "Get a Written Quote",
      ctaUrl: "/contact",
    },
    {
      type: "image",
      image: img2,
      video: "",
      title: "Reach Google's first page. Then **stay there.**",
      subtitle:
        "Most SEO agencies in Delhi sell smoke and a monthly PDF. We send you the actual keyword reports — on-page, technical, content and ethical backlinks, with results you can verify.",
      ctaText: "Free SEO Audit",
      ctaUrl: "/contact",
    },
    {
      type: "image",
      image: img3,
      video: "",
      title: "From the first wireframe to the **first sale.**",
      subtitle:
        "Design, development, content, SEO and post-launch support — all from one team in Delhi. Same time zone, same WhatsApp number, same person you spoke to last week.",
      ctaText: "Start a Project",
      ctaUrl: "/contact",
    },
    {
      type: videoUrl ? "video" : "image",
      image: img4,
      video: videoUrl,
      title: "Custom websites, **built in Delhi.**",
      subtitle:
        "Hand-coded, mobile-first and tuned to load fast on real phones — see the work behind 400+ launches across India and abroad.",
      ctaText: "See Our Work",
      ctaUrl: "/projects",
    },
  ];

  // ── Issue 3: stats ──────────────────────────────────────────────────────
  const stats = [
    { value: "400+", label: "Websites Delivered" },
    { value: "250+", label: "Happy Clients" },
    { value: "6+", label: "Years in Business" },
    { value: "24×7", label: "WhatsApp Support" },
  ];

  // ── Issue 1: real client references (no fake big brands) ─────────────────
  const clientLogos = [
    { name: "Expoed", image: coverExpoed || logoFallback, visible: true },
    { name: "SBM Greens", image: coverSbm || logoFallback, visible: true },
    { name: "Vishwakarma Tour", image: coverVish || logoFallback, visible: true },
    { name: "Shree Namo Motar", image: coverShree || logoFallback, visible: true },
  ];

  await db.collection("homepages").updateOne(
    { _id: home._id },
    { $set: { heroSlides, stats, clientLogos, updatedAt: new Date() } }
  );
  console.log("\n[2/3/1] Homepage updated: heroSlides (4), stats (4), clientLogos (4).");

  // ── Issue 6 + 8: SiteContent about + footer tagline ─────────────────────
  const aboutDescription = [
    "I'm Gudia Yadav, and I run a website design and development studio in Palam, New Delhi. I started it in June 2019 because I was tired of watching small businesses get fleeced — corporate rates for templated work, the few good studios with six-month waiting lists, and freelancers who'd vanish halfway through your project. So I began Web Digital Development with one laptop and a stubborn belief that a small business in Delhi deserves the same quality of website a big company gets, without the big-company invoice.",
    "My first client wasn't even in India — it was Expoed, an e-commerce brand out of Spain, found through a friend's referral. They paid on time, they're still my client six years later, and that one relationship taught me the thing I've built everything else around: do the work properly the first time and the client doesn't go looking for someone else.",
    "Today there are six of us, all in the same office in Palam, all reachable on WhatsApp — me, three developers, an SEO specialist and a content writer. No outsourcing, no white-labelling, no junior pretending to be a senior on your call. We've built for businesses across Delhi NCR, Mumbai, Bangalore, and as far as Spain and the UK, and we'll never sell you something you don't need.",
  ].join("\n\n");

  // Titles are kept free of '-', ':' and '—' so the /about parser
  // (splits on the first of those) renders title/description cleanly.
  const whyChooseUs = [
    "Custom code, never templates — Every WDD website is built from scratch. No Wix template with your logo dropped on top and called custom.",
    "Built to rank from day one — SEO isn't bolted on at the end. Schema markup, clean semantic HTML and fast load times all go in during development.",
    "Founder reviews every project — I review every design before it ships. You'll have my number, not a project manager's, and you talk to the person who can fix things.",
    "Delhi based, India paced — Same time zone, same language, fast replies. Most WhatsApp messages get a reply within the hour on a working day.",
    "One free month after launch — Bug fixes, content tweaks and image swaps, all free for the first thirty days. We don't ship your site and disappear.",
    "Honest quotes that don't move — The number you sign on day one is the number you pay on handover day. No scope-creep surprises.",
  ];

  const timeline = [
    { year: "2019", title: "Studio founded", description: "I started Web Digital Development in New Delhi. First client signed: Expoed, an e-commerce brand in Spain." },
    { year: "2020", title: "60+ projects", description: "COVID arrives and suddenly every business wants a website. We ship 60-plus projects that year." },
    { year: "2022", title: "SEO + marketing added", description: "We add SEO and digital marketing as full services, because nearly every client was asking for both." },
    { year: "2024", title: "300+ launches", description: "The team grows with senior developers and a dedicated content writer. We cross 300 launches." },
    { year: "2026", title: "A modern rebuild", description: "We rebuild our own site on a modern stack (Next.js, AI chatbot, Cloudinary CDN). The one you're reading now." },
  ];

  const footerTagline =
    "Web Digital Development — a Delhi-based website design and development studio. Serving clients across Delhi NCR (Delhi, Noida, Gurgaon, Faridabad) and the rest of India since 2019.";

  const scRes = await db.collection("sitecontents").updateOne(
    {},
    {
      $set: {
        "about.heading": "Built in Delhi. Trusted across India and abroad. Since 2019.",
        "about.description": aboutDescription,
        "about.whyChooseUs": whyChooseUs,
        "about.timeline": timeline,
        "footer.tagline": footerTagline,
        updatedAt: new Date(),
      },
    }
  );
  if (scRes.matchedCount === 0) {
    console.warn("[6/8] ⚠ No sitecontents document found — about/footer not updated.");
  } else {
    console.log("[6/8] SiteContent updated: about.heading, about.description, about.whyChooseUs (6), about.timeline (5), footer.tagline.");
  }

  // ── Verify ──────────────────────────────────────────────────────────────
  const v = await db.collection("homepages").findOne<{ heroSlides: any[]; stats: any[]; clientLogos: any[] }>({ _id: home._id });
  console.log("\n── VERIFY ──");
  console.log("stats:", v?.stats?.map((s) => `${s.value} ${s.label}`).join(" | "));
  console.log("clientLogos:", v?.clientLogos?.map((l) => l.name).join(", "));
  console.log("heroSlides:");
  v?.heroSlides?.forEach((s, i) => console.log(`  ${i + 1}. [${s.type}] "${s.title}" cta="${s.ctaText}"→${s.ctaUrl}${s.video ? " video=" + s.video.slice(0, 55) + "…" : ""}`));

  await mongoose.disconnect();
  console.log("\n✓ Done.");
}

run().catch((err) => {
  console.error("fix-content failed:", err);
  process.exit(1);
});
