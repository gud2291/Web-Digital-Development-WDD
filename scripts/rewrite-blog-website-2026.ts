/* eslint-disable no-console */
/** Rewrite + replace existing post (slug kept) and upsert its SEO Meta.
 *  Run: npx tsx scripts/rewrite-blog-website-2026.ts */
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

const slug = "why-every-business-needs-a-website-2026";

const content = `<p><strong>Short answer:</strong> in 2026, a small business in India needs its own website because that's where buyers go to check if you're real before they call, pay, or walk in. A Facebook or Instagram page helps people find you — but a website is the one place you own, where you control the story, show up on Google, take payments, and don't disappear when an algorithm changes its mind. We've built 150+ sites for Indian businesses, and the pattern is always the same: the ones online win the customers the ones offline never even hear about.</p>

<p>We're Web Digital Development, a web studio in Palam, New Delhi. So we'll be upfront — we build websites for a living. But the case below isn't a sales pitch; it's what we've watched happen to real shops, clinics, and service businesses across India, the ones who got online and the ones who kept saying "next year."</p>

<blockquote>A customer who can't find you online assumes you don't exist. In 2026, that's not cynical — it's just how people shop now, from Connaught Place to a kirana store in Nagpur.</blockquote>

<h2>Key takeaways</h2>
<ul>
<li><strong>India is online-first.</strong> With 900M+ internet users and most of them on mobile, your customer's first move is a Google search — not a phone call.</li>
<li><strong>A social page is rented land; a website is owned land.</strong> You don't control the feed, the reach, or whether the account stays up. You do control your site.</li>
<li><strong>A website builds trust before you ever speak.</strong> Reviews, real photos, clear services and an address turn a stranger into a lead.</li>
<li><strong>It works while you sleep.</strong> Enquiries, bookings and UPI payments don't keep shop hours.</li>
<li><strong>"Near me" search is free money.</strong> A simple, fast, mobile-first site with <a href="/blog/local-seo-delhi-businesses-step-by-step">local SEO</a> puts you in front of people ready to buy nearby.</li>
</ul>

<h2>The 2026 reality: your customer checks Google before they check you out</h2>
<p>Here's the behaviour we see every single day. Someone hears about your business — a friend's recommendation, a hoarding, a WhatsApp forward. What do they do next? They search your name. If a clean, professional website comes up, you're legit. If nothing comes up, or just a half-filled Facebook page from 2021, a little doubt creeps in. That doubt is expensive.</p>
<p>India crossed 900 million internet users, and the overwhelming majority browse on a phone over 4G or 5G. UPI made paying online second nature for everyone from college students to your local sabziwala. People search "best dentist near me," "CA in Lajpat Nagar," "boutique in Jaipur" and tap the first few results. No website means you're simply not in that race.</p>

<h3>A real pattern we've watched play out</h3>
<p>We worked with a coaching centre that ran entirely on Instagram. Good content, decent following — but admissions had stalled. We built them a small five-page site with course details, faculty bios, real student results, and a simple enquiry form wired to WhatsApp. Within a couple of months, parents were filling that form at night, after the centre had closed. Same business, same teaching. The difference was a place that showed up on Google and answered questions before anyone had to ask. That's the gap a website closes.</p>

<h2>"But I already have a Facebook/Instagram page" — why that isn't enough</h2>
<p>Social pages are brilliant for reach and personality. We tell every client to keep posting. But leaning on them as your <em>only</em> online presence is a mistake, and here's the honest comparison:</p>

<div style="overflow-x:auto;margin-top:16px">
<table style="border-collapse:collapse;width:100%;font-size:16px;min-width:560px">
<thead>
<tr style="background:#EFF4FF">
<th style="border:1px solid #D7E0F0;padding:10px 12px;text-align:left">What matters</th>
<th style="border:1px solid #D7E0F0;padding:10px 12px;text-align:left">Social media page</th>
<th style="border:1px solid #D7E0F0;padding:10px 12px;text-align:left">Your own website</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">Who owns it</td><td style="border:1px solid #D7E0F0;padding:10px 12px">The platform — they set the rules</td><td style="border:1px solid #D7E0F0;padding:10px 12px"><strong>You do, fully</strong></td></tr>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">Shows up on Google search</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Rarely, and not for "near me"</td><td style="border:1px solid #D7E0F0;padding:10px 12px"><strong>Yes — built for it</strong></td></tr>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">Reach</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Whatever the algorithm allows today</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Anyone who searches, anytime</td></tr>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">Looks credible to a buyer</td><td style="border:1px solid #D7E0F0;padding:10px 12px">"Anyone can make a page"</td><td style="border:1px solid #D7E0F0;padding:10px 12px"><strong>Signals a real business</strong></td></tr>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">Take payments / bookings</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Clunky, off-platform</td><td style="border:1px solid #D7E0F0;padding:10px 12px">UPI, cards, forms built in</td></tr>
<tr><td style="border:1px solid #D7E0F0;padding:10px 12px">If the account is locked</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Your business vanishes</td><td style="border:1px solid #D7E0F0;padding:10px 12px">Still standing</td></tr>
</tbody>
</table>
</div>

<p>The phrase we keep coming back to: a social page is rented land, your website is owned land. Build on land you own.</p>

<h2>Seven things a website actually does for a small Indian business</h2>

<h3>1. It makes you findable on Google</h3>
<p>When someone searches your service plus your area, a well-built site can put you right there in the results. That's the difference between customers finding you and customers finding a competitor. Most of this comes down to <a href="/blog/google-business-profile-local-seo-guide">local SEO and a Google Business Profile</a> working alongside your site.</p>

<h3>2. It builds trust before a single conversation</h3>
<p>Real photos, genuine reviews, clear pricing-free service descriptions, an address and a phone number — these quietly answer the question every buyer is asking: "Can I trust these people with my money?" A page full of stock images and vague claims does the opposite.</p>

<h3>3. It sells while you're closed</h3>
<p>Your shop shuts at 8, but Google doesn't. A website takes enquiries, shows your catalogue, and accepts payments at midnight. We've had clients wake up to orders placed at 2 a.m. — business they'd have lost entirely without a site.</p>

<h3>4. It puts you in control of your story</h3>
<p>On social, the platform decides what people see. On your site, you decide. Your best work, your strongest testimonials, the exact services you want to push — front and centre, the way you want them. If your current site doesn't do that, these are the <a href="/blog/essential-website-features-2026">features every 2026 business site needs</a>.</p>

<h3>5. It works on the device India actually uses</h3>
<p>Most of your traffic is a thumb on a phone screen, often on a patchy mobile connection. A <a href="/blog/mobile-first-design-india">mobile-first website</a> that loads fast and is easy to tap will out-convert a clunky one every time. If yours feels slow, here's <a href="/blog/why-is-my-website-slow">why that happens and how to fix it</a>.</p>

<h3>6. It tells you what's working</h3>
<p>A website plugged into analytics shows you which services people care about, where visitors come from, and what makes them enquire. That's real data to grow on — something a social page barely gives you.</p>

<h3>7. It grows with you</h3>
<p>Start with five pages. Add a blog, an online store, a booking system later. A website is a foundation you build on for years — not a post that scrolls out of sight in a day.</p>

<h2>What a good small-business website needs (and what it doesn't)</h2>
<p>You don't need a giant, complicated site. You need a fast, honest, mobile-first one that does a few things well:</p>
<ul>
<li><strong>A clear homepage</strong> that says what you do and who you do it for, in one glance.</li>
<li><strong>A services or products page</strong> with real detail, not filler.</li>
<li><strong>Proof</strong> — reviews, photos of actual work, results.</li>
<li><strong>An easy way to contact you</strong> — WhatsApp, call button, a short form.</li>
<li><strong>Local SEO basics</strong> — your city and services in the right places, plus a Google Business Profile.</li>
<li><strong>Speed</strong> — it should open in a second or two, even on mobile data.</li>
</ul>
<p>What you can skip early on: animations that slow things down, a dozen pages nobody reads, and features you'll "use someday." Start lean, grow on purpose. Not sure how to pick who builds it? Our <a href="/blog/how-to-choose-website-design-company-delhi-2026">2026 checklist for choosing a web company</a> walks through it.</p>

<h2>The real cost of staying offline</h2>
<p>People obsess over what a website costs and forget what <em>not</em> having one costs. Every "near me" search you miss, every customer who couldn't verify you and went with a competitor, every late-night enquiry that never reached you — that's revenue leaving quietly, and you never see the bill. The businesses that moved online a few years ago aren't smarter than you. They just stopped waiting.</p>

<h2>Frequently asked questions</h2>

<h3>Does a small business in India really need a website in 2026?</h3>
<p>Yes. With most buyers searching Google before they decide, a website is how you get found, get trusted, and get contacted. Even a small five-page site puts you ahead of competitors who rely only on social media or word of mouth.</p>

<h3>Isn't a Facebook or Instagram page enough?</h3>
<p>It's a great start, but not enough on its own. You don't own the platform, you rarely show up in Google search, and your reach depends on an algorithm. A website is land you own — it shows up when people search, takes payments, and stays up no matter what happens to your social account. Keep the socials; add a website.</p>

<h3>How long does it take to get a small business website online?</h3>
<p>A straightforward business website is usually ready in two to four weeks, depending on how quickly you share content and feedback. We break the full timeline down in <a href="/blog/how-long-to-build-a-website">how long it takes to build a website</a>.</p>

<h3>Will a website actually bring me customers, or just sit there?</h3>
<p>A site built for search and conversions brings enquiries — but it isn't magic. It needs the basics done right: local SEO, fast mobile loading, clear calls to action, and real proof. Do those, and it becomes one of your best salespeople. We cover how a good site <a href="/blog/how-a-good-website-pays-for-itself">pays for itself</a>.</p>

<h3>I'm not technical — can I manage a website myself?</h3>
<p>Absolutely. A good build hands you a simple way to edit text, add posts, and update photos without touching code. You run your business; the site should be easy to keep current.</p>

<h3>What's the difference between a website and an online store?</h3>
<p>A website presents your business and captures enquiries. An online store also lets people buy and pay directly. Many Indian businesses start with a website and add a store later — see our <a href="/blog/ecommerce-website-checklist-india">e-commerce checklist for Indian stores</a> when you're ready.</p>

<h2>The bottom line</h2>
<p>In 2026, a website isn't a luxury for big brands — it's the front door of your small business. It's where customers find you, decide they trust you, and reach out, whether you're in Delhi, Pune, or a tier-3 town just getting online. A social page can't do all of that, and it isn't yours to keep. So the real question isn't whether you need a website. It's how much business you're losing without one.</p>
<p>If you'd like a fast, mobile-first website built to get found and bring in enquiries, <strong>that's exactly what we do at Web Digital Development.</strong> <a href="/contact">Get a free quote</a>, or explore our <a href="/services/website-designing">website design</a> and <a href="/services/website-development">development</a> services to see how we'd build yours.</p>`;

const seoTitle = "Why Every Small Business in India Needs a Website in 2026";
const seoDescription =
  "Why every small business in India needs a website in 2026: get found on Google, build trust, take payments 24/7, and why a Facebook page alone isn't enough.";

const keywords = [
  "why every small business in India needs a website in 2026",
  "small business website India",
  "online presence for small business",
  "business website benefits",
  "website vs social media page",
  "local SEO India",
  "mobile-first website India",
  "do I need a website for my business",
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  // Overwrite body + meta in place. KEEP published / order / featuredImage / createdAt.
  await db.collection("blogs").updateOne(
    { slug },
    {
      $set: {
        title:
          "Why Every Small Business in India Needs a Website in 2026 (and Why a Facebook Page Isn't Enough)",
        excerpt:
          "Why every small business in India needs a website in 2026 — get found on Google, build trust, and take payments 24/7. Plus why a social page alone isn't enough.",
        content,
        featuredImageAlt:
          "Small business owner in India using a website on a phone in 2026",
        author: "Web Digital Development Team",
        category: "Business",
        readTime: 10,
        tags: [
          "small business",
          "India",
          "website",
          "online presence",
          "2026",
          "local SEO",
        ],
        seoTitle,
        seoDescription,
        relatedServices: ["website-designing", "website-development", "seo-services"],
        relatedBlogs: [
          "how-a-good-website-pays-for-itself",
          "essential-website-features-2026",
          "website-vs-instagram-for-business",
        ],
        updatedAt: new Date(),
      },
    }
  );

  // Upsert the SEO Meta entry (critical for ranking).
  await db.collection("seometas").updateOne(
    { pageSlug: "blog/why-every-business-needs-a-website-2026" },
    {
      $set: {
        title: seoTitle,
        description: seoDescription,
        keywords,
        ogImage: "",
        canonical:
          "https://webdigitaldevelopment.com/blog/why-every-business-needs-a-website-2026",
        noIndex: false,
        updatedAt: new Date(),
      },
      $setOnInsert: { pageSlug: "blog/why-every-business-needs-a-website-2026", createdAt: new Date(), __v: 0 },
    },
    { upsert: true }
  );

  const b: any = await db.collection("blogs").findOne({ slug });
  console.log("BLOG published:", b.published, "| order:", b.order, "| author:", b.author);
  console.log("content words ~", b.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
    "| h2:", (b.content.match(/<h2/g) || []).length, "| h3:", (b.content.match(/<h3/g) || []).length,
    "| table:", /<table/.test(b.content), "| internal links:", (b.content.match(/href="\//g) || []).length);
  console.log("featuredImage kept:", b.featuredImage ? "yes" : "BLANK");
  const sm: any = await db.collection("seometas").findOne({ pageSlug: "blog/why-every-business-needs-a-website-2026" });
  console.log("SEOMETA noIndex:", sm.noIndex, "| keywords:", sm.keywords.length, "| canonical:", sm.canonical);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
