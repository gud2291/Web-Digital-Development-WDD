/* eslint-disable no-console */
/** Insert ONE published blog post + upsert its SeoMeta. Idempotent (upsert by slug).
 *  featuredImage / ogImage live only in $setOnInsert so a later manual upload
 *  survives a re-run. Run: npx tsx scripts/seed-blog-website-audit-checklist.ts */
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

const slug = "website-audit-checklist";
const pageSlug = "blog/" + slug;
const canonical = "https://webdigitaldevelopment.com/blog/" + slug;

const th = 'style="border:1px solid #D7E0F0;padding:10px 12px;text-align:left"';
const td = 'style="border:1px solid #D7E0F0;padding:10px 12px"';

const content = `<p>A website audit is a structured check of everything that decides whether your site wins customers: speed, mobile experience, SEO, security, content, and the paths visitors take to contact you. You don't need an agency to do a useful one — this website audit checklist walks a business owner through the whole thing in about 30 minutes, using free tools, with a simple score at the end.</p>
<p>Why bother? Because websites don't usually fail loudly. They fail quietly — a form that stopped sending last month, a page that takes eight seconds on mobile, a homepage still advertising last year's offer. The business keeps paying for hosting while the site slowly stops earning it.</p>
<p>We've audited hundreds of business websites — alongside building 150+ of them for 100+ clients from our studio in Delhi — and the same handful of silent problems shows up in almost every one. This checklist is built around exactly those.</p>

<h2>Key Takeaways</h2>
<ul>
<li>You can run a meaningful website audit yourself in about 30 minutes with free tools — no developer required.</li>
<li>Check eight areas: first impressions, speed, mobile, functionality, security and trust, SEO basics, content freshness, and AI-search readiness.</li>
<li>Score each area out of 5. The total tells you whether you need quick fixes, a maintenance plan, or a rebuild conversation.</li>
<li>The most common silent killer we find isn't design — it's broken forms and pages nobody has tested in months.</li>
<li>Audit quarterly; glance monthly. Problems caught early are cheap; problems found by customers are not.</li>
</ul>

<h2>What You Need Before You Start</h2>
<p>Three things, all free: your own phone (using mobile data, not office Wi-Fi), a browser in incognito mode so you see the site the way a stranger does, and two Google tools — <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener">PageSpeed Insights</a> for speed and <a href="https://search.google.com/search-console/about" target="_blank" rel="noopener">Search Console</a> for how Google sees your site. If Search Console isn't set up yet, note that as your first finding — flying blind is itself an audit result.</p>
<p>Grade each of the eight sections below from 0 (broken or missing) to 5 (genuinely good). Write the numbers down as you go; the total out of 40 matters at the end.</p>

<h2>The 30-Minute Website Audit Checklist</h2>
<p>Work through the sections in order — they're sequenced from a stranger's first impression down to the machinery underneath.</p>

<h3>1. The five-second test (2 minutes)</h3>
<p>Open your homepage in incognito and look at only what's visible before scrolling. Within five seconds, could a stranger answer: what does this business do, who is it for, and what should I do next? Ask someone outside your company to try it — you're too close to your own site to see it fresh. If the answer to any of the three is "not really," nothing else in this audit will fully compensate.</p>

<h3>2. Speed (5 minutes)</h3>
<p>Run your homepage and one key service page through PageSpeed Insights and look at the mobile score first — that's where your visitors are. As a working rule, the main content should appear within about 2.5 seconds; every extra second visibly costs enquiries. Oversized images are the usual culprit, followed by bloated themes and cheap hosting — our breakdown of <a href="/blog/why-is-my-website-slow">why websites load slowly</a> explains where the seconds typically hide and which fixes are easy.</p>

<h3>3. Mobile experience (5 minutes)</h3>
<p>Now browse the whole site on your phone, on mobile data. Is the text readable without zooming? Are buttons big enough to tap without hitting the one next to them? Does anything overflow the screen or jump around while loading? Try completing your own contact form with your thumb. Most owners check their site on a desktop at launch and never again — meanwhile most of their visitors have never seen the desktop version at all.</p>

<h3>4. Forms, links, and functionality (5 minutes)</h3>
<p>Submit every form on the site with a real message and confirm it actually arrives — today, not "it worked at launch." Silent form failure is the most expensive fault we find in audits: everything looks fine, and enquiries simply stop arriving. Then click your phone number on mobile (it should dial), test your WhatsApp button if you have one, and click through the main menu and footer links watching for 404 pages.</p>

<h3>5. Security and trust (3 minutes)</h3>
<p>Check for the padlock: your site should load as https:// with no browser warnings — an expired SSL certificate turns every visitor away at the door. Then the small trust signals visitors notice more than you'd think: is the copyright year in the footer current? Is your name, address, and phone number identical on the website and your Google Business Profile? Are there real testimonials or recognizable client names anywhere?</p>

<h3>6. SEO basics (5 minutes)</h3>
<p>Search Google for your business name — you should own the first result. Then search for your main service plus your city and see where you honestly stand. In Search Console, look for coverage errors and check which queries bring you traffic. On your key pages: does each have a unique title and meta description, exactly one main heading, and descriptive alt text on images? This section only scratches the surface — a proper technical audit is part of what dedicated <a href="/services/seo-services">SEO services</a> exist for — but even the surface check catches missing titles and pages Google can't see.</p>

<h3>7. Content freshness and clarity (3 minutes)</h3>
<p>Read your homepage and service pages as a suspicious stranger. Anything outdated — old offers, "coming soon" sections that never came, a blog whose last post is two years old — quietly signals that nobody is home. Check that every important page ends with a specific next step: "Get a quote for your project" beats "Learn more." If the words themselves are the weak point, our guide to <a href="/blog/website-content-that-converts">website content that converts</a> covers how to fix them.</p>

<h3>8. AI-search readiness (2 minutes)</h3>
<p>New for this decade: ask ChatGPT or Gemini "who is [your business name]" and "best [your service] in [your city]" and see what comes back. AI assistants recommend sites they can read and quote — clear headings, direct answers, FAQ sections, up-to-date facts. If your site is a wall of vague paragraphs, you're invisible to the fastest-growing way people ask for recommendations. Almost no audit checklist covers this yet, which is exactly why it's worth points.</p>

<h2>Score Your Website</h2>
<p>Add up your eight section scores. Out of 40, here's what the total means — and what to do about it.</p>
<div style="overflow-x:auto;margin-top:16px">
<table style="border-collapse:collapse;width:100%;font-size:16px;min-width:640px">
<thead>
<tr style="background:#EFF4FF">
<th ${th}>Score</th>
<th ${th}>What it means</th>
<th ${th}>What to do</th>
</tr>
</thead>
<tbody>
<tr><td ${td}>34–40</td><td ${td}>Healthy site — rare, honestly</td><td ${td}>Keep a quarterly audit cadence and don't break what works</td></tr>
<tr><td ${td}>24–33</td><td ${td}>Solid but leaking in places</td><td ${td}>Fix the two lowest-scoring sections within a month</td></tr>
<tr><td ${td}>14–23</td><td ${td}>Actively losing customers</td><td ${td}>Prioritize forms, speed, and mobile now; get ongoing upkeep in place</td></tr>
<tr><td ${td}>Below 14</td><td ${td}>Patching may cost more than replacing</td><td ${td}>Have the rebuild conversation before spending on fixes</td></tr>
</tbody>
</table>
</div>

<h2>What to Do With What You Found</h2>
<p>An audit is only worth the actions it triggers. Findings sort into three buckets.</p>
<p><strong>Quick wins you can do yourself.</strong> Copyright year, outdated offers, vague button text, oversized images, a missing FAQ — most owners can clear these in an afternoon, and they're often worth several points on their own.</p>
<p><strong>Recurring problems that need a routine.</strong> If your findings include out-of-date software, no backups, slow pages, or forms nobody tests, the fix isn't a one-time patch — it's upkeep. Our checklist of <a href="/blog/website-maintenance-after-launch">website maintenance tasks after launch</a> covers what that routine looks like, and our guide to <a href="/blog/website-maintenance-cost-india">website maintenance costs</a> shows what the market charges so you can budget it sensibly.</p>
<p><strong>Structural problems that no checklist fixes.</strong> If the site scored badly almost everywhere — slow on every page, painful on mobile, built on a template nobody can edit — more patching is money down the drain. The honest next step is weighing the <a href="/blog/website-redesign-signs-losing-customers">signs your website needs a redesign</a> and, if they fit, treating this audit as the brief for proper <a href="/services/website-development">website development</a> rather than a repair job.</p>

<h2>How Often Should You Audit Your Website?</h2>
<p>A useful rhythm for a business site: a five-minute glance monthly (submit the form, check the padlock, load the homepage on your phone), this full 30-minute audit quarterly, and a deeper professional audit yearly or before any major marketing spend. The monthly glance matters most — it's the one that catches a broken form in week one instead of month four.</p>

<h2>Frequently Asked Questions</h2>

<h3>What does a website audit include?</h3>
<p>A full website audit covers first impressions, loading speed, mobile experience, working forms and links, security and trust signals, on-page SEO, content freshness, and increasingly AI-search readiness. Professional audits go deeper into technical SEO, analytics, and conversion tracking, but those eight areas capture what decides whether visitors become enquiries.</p>

<h3>Can I audit my website myself without technical skills?</h3>
<p>Yes — meaningfully. Testing your own forms, browsing on your phone, running free speed tools, and reading your content as a stranger requires no technical background, and it catches the majority of expensive problems. What a professional adds is depth: crawl errors, code quality, analytics setup, and a prioritized fix plan.</p>

<h3>What free tools do I need for a website audit?</h3>
<p>Three cover most of it: Google PageSpeed Insights for speed, Google Search Console for how Google sees and indexes your site, and your own phone on mobile data for the real visitor experience. An incognito browser window helps you see the site fresh, without logins or cached files flattering it.</p>

<h3>How long does a website audit take?</h3>
<p>A useful self-audit takes about 30 minutes for a typical business website using the checklist above — longer if you have many pages or keep stopping to write down problems as you go. A professional audit typically takes a few days, because it includes crawling every page, analytics review, and a written, prioritized action plan.</p>

<h3>How often should a business website be audited?</h3>
<p>Quarterly for the full check, with a five-minute monthly glance at the essentials: form submissions, the SSL padlock, and homepage speed on your phone. Audit immediately before spending on ads or SEO — sending paid traffic to a site with a broken form or eight-second load time burns the budget twice.</p>

<h3>What should I do if my audit finds serious problems?</h3>
<p>Triage before spending. Fix revenue-critical faults first — broken forms, security warnings, unusable mobile pages — then decide whether the rest points to a maintenance routine or a structural rebuild. If most sections scored poorly, get a professional opinion on repair versus rebuild before paying for piecemeal fixes that may not add up.</p>

<h2>Final Thoughts</h2>
<p>A website audit checklist isn't about perfection — it's about finding out where your site quietly leaks customers before the leak gets expensive. Thirty minutes, free tools, eight scores out of five. Most owners who do this for the first time find at least one fault they had no idea about, and it's usually one a customer found first.</p>
<p>If your score landed in an uncomfortable band, or you'd rather have professional eyes go through all of it — crawl, code, SEO, and a prioritized fix list — <a href="/contact">talk to Web Digital Development</a>. We'll tell you plainly what's worth fixing, what isn't, and what order to do it in.</p>`;

const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const blogDoc = {
  slug,
  title: "Website Audit Checklist for Business Owners: The 30-Minute DIY Guide",
  excerpt:
    "Your website might be quietly losing customers. This 30-minute website audit checklist for business owners covers speed, mobile, SEO, security, and content using free tools — with a simple score and a clear plan for whatever you find.",
  content,
  author: "Web Digital Development Team",
  authorFollowUrl: "https://www.instagram.com/web_digital_development",
  category: "Maintenance",
  readTime: Math.ceil(words / 200),
  tags: [
    "website audit checklist",
    "website audit",
    "diy website audit",
    "website health check",
    "small business website audit",
    "site audit for business owners",
  ],
  featuredImageAlt:
    "Website audit checklist for business owners — reviewing site speed, SEO, and mobile scores on a laptop",
  seoTitle: "Website Audit Checklist for Business Owners",
  seoDescription:
    "Audit your website in 30 minutes with this business-owner checklist — speed, mobile, SEO, security, content — using free tools, no developer needed.",
  relatedServices: ["seo-services", "website-development"],
  relatedBlogs: [
    "website-maintenance-after-launch",
    "website-maintenance-cost-india",
    "website-redesign-signs-losing-customers",
  ],
  published: true,
};

const seoMetaDoc = {
  title: "Website Audit Checklist for Business Owners",
  description:
    "Audit your website in 30 minutes with this business-owner checklist — speed, mobile, SEO, security, content — using free tools, no developer needed.",
  keywords: [
    "website audit checklist",
    "website audit checklist for business owners",
    "how to audit a website",
    "diy website audit",
    "website health check",
    "small business website audit",
    "website audit free tools",
    "website seo audit checklist",
  ],
  canonical,
  noIndex: false,
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const now = new Date();

  const [maxDoc] = await db
    .collection("blogs")
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = ((maxDoc?.order as number) || 0) + 1;

  await db.collection("blogs").updateOne(
    { slug },
    {
      $set: { ...blogDoc, updatedAt: now },
      $setOnInsert: { createdAt: now, order: nextOrder, featuredImage: "", __v: 0 },
    },
    { upsert: true }
  );
  console.log("✓ blogs upserted:", slug);

  await db.collection("seometas").updateOne(
    { pageSlug },
    {
      $set: { ...seoMetaDoc, updatedAt: now },
      $setOnInsert: { pageSlug, createdAt: now, ogImage: "", __v: 0 },
    },
    { upsert: true }
  );
  console.log("✓ seometas upserted:", pageSlug);

  const b: any = await db.collection("blogs").findOne({ slug });
  const sm: any = await db.collection("seometas").findOne({ pageSlug });
  const internalLinks = (b.content.match(/href="\/[^"]+"/g) || []) as string[];
  console.log(
    "BLOG published:", b.published, "| category:", b.category, "| order:", b.order,
    "| readTime:", b.readTime, "| words ~", words,
    "| h1-in-content:", (b.content.match(/<h1/g) || []).length,
    "| h2:", (b.content.match(/<h2/g) || []).length,
    "| h3:", (b.content.match(/<h3/g) || []).length,
    "| tables:", (b.content.match(/<table/g) || []).length
  );
  console.log("in-body internal links:", internalLinks.join(", "));
  console.log("relatedServices:", b.relatedServices, "| relatedBlogs:", b.relatedBlogs);
  console.log(
    "seoTitle len:", b.seoTitle.length, "| seoDescription len:", b.seoDescription.length,
    "| featuredImage:", JSON.stringify(b.featuredImage), "| alt set:", !!b.featuredImageAlt
  );
  console.log(
    "SEOMETA noIndex:", sm.noIndex, "| keywords:", sm.keywords.length,
    "| desc len:", sm.description.length, "| canonical:", sm.canonical,
    "| ogImage:", JSON.stringify(sm.ogImage)
  );
  console.log("LIVE URL:", canonical);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
