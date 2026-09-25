/* eslint-disable no-console */
/** Insert ONE published blog post + upsert its SeoMeta. Idempotent (upsert by slug).
 *  featuredImage / ogImage live only in $setOnInsert so a later manual upload
 *  survives a re-run. Run: npx tsx scripts/seed-blog-how-to-choose-website-development-company.ts */
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

const slug = "how-to-choose-website-development-company";
const pageSlug = "blog/" + slug;
const canonical = "https://webdigitaldevelopment.com/blog/" + slug;

const th = 'style="border:1px solid #D7E0F0;padding:10px 12px;text-align:left"';
const td = 'style="border:1px solid #D7E0F0;padding:10px 12px"';

const content = `<p>To choose the best website development company, judge five things: live portfolio work you can open on your phone, technical fit for your specific project, how the team communicates before you've paid anything, whether the scope and pricing are transparent, and what happens after launch. Everything else — awards, office photos, big claims — is decoration.</p>
<p>The hard part is that every company's website says the same words: best, leading, trusted. You can't choose on adjectives. You need a way to test what's underneath them, and that's what this guide is: the criteria that separate good companies from good marketing, the exact questions to ask before signing, and the red and green flags to watch for.</p>
<p>It's written from the other side of the table. We've been building websites — 150+ projects for 100+ clients from our studio in Delhi — and we've inherited enough half-finished, badly built, or hostage-held projects to know precisely where the choosing process goes wrong.</p>

<h2>Key Takeaways</h2>
<ul>
<li>Judge live work, not claims — open a company's portfolio sites on your own phone and test how they load.</li>
<li>The structure of a quote tells you more than the number on it. Itemized and honest beats cheap and vague.</li>
<li>Ownership is non-negotiable: your domain, hosting, and code should be registered and accessible in your name.</li>
<li>Ask the ten questions in this guide before signing — the answers expose process, honesty, and support quality fast.</li>
<li>Walk away from one-line quotes, guaranteed #1 rankings, full payment upfront, and portfolios made of screenshots.</li>
</ul>

<h2>Before You Compare Companies, Write Your Own Brief</h2>
<p>The best first filter isn't finding the right company — it's knowing your own requirements well enough to recognize it.</p>
<p>One page is enough: what the website is for (enquiries, sales, credibility), the pages and features you think you need, two or three sites you like and why, a realistic budget range, and any hard deadline. Companies quote wildly differently against a vague request; against a clear brief, their quotes finally become comparable. As a bonus, the way a company responds to a clear brief — with questions, suggestions, and honest pushback — is your first real look at how they work.</p>

<h2>The 7 Things That Actually Separate Website Development Companies</h2>
<p>Most comparison lists tell you to "check the portfolio and reviews." Here's how to actually do it, criterion by criterion.</p>

<h3>1. A portfolio you can open, not just look at</h3>
<p>Screenshots prove nothing — ask for live URLs and open at least three on your own phone. Check how fast they load, whether anything is broken, and run one through <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener">Google PageSpeed Insights</a>. Notice whether older projects are still online and maintained: a portfolio full of dead links quietly tells you how the company's client relationships end.</p>

<h3>2. The right technical approach for your project</h3>
<p>There is no single best technology — a content-driven business site has different needs from a custom portal, and our comparison of <a href="/blog/wordpress-vs-custom-website">WordPress vs custom websites</a> walks through exactly that trade-off. What matters is the reasoning: serious <a href="/services/website-development">website development</a> starts by matching the stack to the business, not the other way around. Be wary of any company whose answer is the same platform for every client — that's their convenience, not your fit.</p>

<h3>3. Communication you can test before you pay</h3>
<p>How a company behaves while trying to win you is the best behaviour you will ever see from them. Note how fast they respond, whether they answer questions directly or in sales-speak, and whether you get a named point of contact. Ask how progress will be reported — weekly updates and written milestones are normal; "we'll call you when it's ready" is not.</p>

<h3>4. A quote you can actually read</h3>
<p>A trustworthy quote is itemized — design, development, content, testing, and what's specifically excluded — with a stated number of revisions and a written process for changes in scope. A single line reading "Complete website: one price" isn't a scope, it's the opening of a negotiation you'll lose later. To judge whether the numbers themselves are reasonable, our breakdown of <a href="/blog/website-cost-delhi-2026">website costs in Delhi</a> covers what market rates look like at each level.</p>

<h3>5. Ownership in your name</h3>
<p>Your domain should sit in a registrar account you control, your hosting in your name, and your website files accessible to you — from day one, in writing. We regularly inherit projects where the old developer registered the domain under their own account, and the business had to negotiate to buy back its own name. Any pushback on ownership is a walk-away signal, however good everything else looks.</p>

<h3>6. Post-launch support, in writing</h3>
<p>Every company says "we provide support." The real questions: what does it include, for how long, and how fast do they respond when something breaks? A defined support period with named inclusions beats vague lifetime promises. It also helps to know what ongoing upkeep should cost before anyone quotes you — our guide to <a href="/blog/website-maintenance-cost-india">website maintenance costs</a> lays out the market ranges so you can spot both overcharging and too-cheap-to-be-real.</p>

<h3>7. Reviews you can verify</h3>
<p>Testimonials on a company's own site are marketing; reviews on Google or third-party directories like <a href="https://clutch.co/" target="_blank" rel="noopener">Clutch</a> are evidence. Read the specific, recent ones — "delivered on time, fixed issues quickly" means more than five anonymous stars. Best of all, ask to speak to one past client whose project resembled yours. Confident companies say yes without hesitating.</p>

<h2>The Evaluation Checklist at a Glance</h2>
<p>Here's the whole vetting process in one table — how to verify each criterion, and the answer that should end the conversation.</p>
<div style="overflow-x:auto;margin-top:16px">
<table style="border-collapse:collapse;width:100%;font-size:16px;min-width:640px">
<thead>
<tr style="background:#EFF4FF">
<th ${th}>Criterion</th>
<th ${th}>How to verify it</th>
<th ${th}>Walk away if…</th>
</tr>
</thead>
<tbody>
<tr><td ${td}>Portfolio</td><td ${td}>Open 3 live sites on your phone; test speed</td><td ${td}>Screenshots only, or the sites are offline</td></tr>
<tr><td ${td}>Technical approach</td><td ${td}>Ask why they recommend this stack for you</td><td ${td}>Same platform answer for every project</td></tr>
<tr><td ${td}>Communication</td><td ${td}>Track response times during the sales stage</td><td ${td}>Days of silence before you've even paid</td></tr>
<tr><td ${td}>Pricing</td><td ${td}>Ask for an itemized quote with exclusions</td><td ${td}>One-line quotes, or prices too low to be real</td></tr>
<tr><td ${td}>Ownership</td><td ${td}>Ask whose name the domain and hosting sit in</td><td ${td}>"We manage all that for you" with no access</td></tr>
<tr><td ${td}>Support</td><td ${td}>Get scope, duration, and response time in writing</td><td ${td}>"Free lifetime support" with no definition</td></tr>
<tr><td ${td}>Reviews</td><td ${td}>Check third-party reviews; call one past client</td><td ${td}>Only testimonials on their own website</td></tr>
</tbody>
</table>
</div>

<h2>10 Questions to Ask Before You Sign Anything</h2>
<p>Take these into the meeting. The point isn't only the answers — it's watching how comfortably each one gets answered.</p>
<ol>
<li><strong>Can you show me three live sites similar to my project?</strong> Similar in purpose, not just industry.</li>
<li><strong>Who exactly will work on my website, and who is my single point of contact?</strong> A named person, not "the team."</li>
<li><strong>What's included in this price — and what specifically is not?</strong> The exclusions are where budgets die.</li>
<li><strong>How do you handle changes in scope mid-project?</strong> A written change process protects both sides.</li>
<li><strong>How long will it take, and what are the milestones?</strong> Compare against realistic norms — we've broken down <a href="/blog/how-long-to-build-a-website">how long a website takes to build</a> stage by stage.</li>
<li><strong>Will the domain, hosting, and code be in my name from day one?</strong> Yes is the only acceptable answer.</li>
<li><strong>What does post-launch support include, and for how long?</strong> Scope, duration, response time — in the contract.</li>
<li><strong>How is the site built for speed and SEO from day one?</strong> Listen for specifics: image optimization, mobile performance, clean structure, meta setup.</li>
<li><strong>What happens if we stop working together?</strong> You should keep everything: files, accounts, access.</li>
<li><strong>Can I speak to one of your past clients?</strong> The pause before this answer is data.</li>
</ol>

<h2>Red Flags and Green Flags</h2>
<p>Some signals are worth more than a week of comparison shopping.</p>
<p><strong>Red flags — end the conversation:</strong></p>
<ul>
<li>Guaranteed #1 Google rankings, or fixed "SEO included" promises with no detail.</li>
<li>Full payment demanded upfront, or heavy pressure to sign today for a "special price."</li>
<li>The domain or hosting will be registered under the company's name.</li>
<li>A quote dramatically below everyone else's — you'll pay the difference later, with interest.</li>
<li>No contract, no written scope, "don't worry, we'll adjust as we go."</li>
</ul>
<p><strong>Green flags — lean in:</strong></p>
<ul>
<li>They ask about your business, customers, and goals before talking about pages and prices.</li>
<li>They explain trade-offs honestly, including what you don't need to buy yet.</li>
<li>Milestone-based payments tied to visible progress.</li>
<li>Portfolio sites that have been live and maintained for years.</li>
<li>Completely relaxed about ownership, references, and putting support terms in writing.</li>
</ul>

<h2>Development or Design Company — Which Do You Actually Need?</h2>
<p>The terms get used interchangeably, but the emphasis differs: design companies lead with how the site looks and guides visitors; development companies lead with how it's built — functionality, speed, integrations, and code quality. Most business websites need both, and most serious firms offer both, but knowing which side your project leans on changes what you should scrutinize hardest. If the visual and branding side is your bigger question, we've written a separate guide on <a href="/blog/how-to-choose-website-design-company-delhi-2026">how to choose a website design company</a> that covers that half of the decision.</p>

<h2>What If You'd Rather Work With a Local Team?</h2>
<p>Every criterion in this guide applies whether the company sits across the street or across the country — good process travels. But preferring face-to-face meetings and local market knowledge is legitimate, especially for a first website. If that's you, our guide to finding a <a href="/blog/website-development-company-near-me">website development company near you</a> covers the local angle: what proximity genuinely helps with, and what it doesn't excuse.</p>

<h2>Frequently Asked Questions</h2>

<h3>How do you choose the right website development company?</h3>
<p>Judge evidence over claims: open their live portfolio sites on your phone, verify third-party reviews, demand an itemized quote, confirm the domain and code will be in your name, and get post-launch support in writing. Then compare how each company communicates during the sales stage — it's the best preview of the project itself.</p>

<h3>How do I find a good web development company?</h3>
<p>Start with shortlists you can verify: Google search and Maps reviews, third-party directories like Clutch, and businesses whose websites you admire — ask who built them. Collect three to five candidates, send each the same one-page brief, and compare the quality of their questions as much as the quality of their quotes.</p>

<h3>What questions should I ask before hiring a web development company?</h3>
<p>The essentials: what's included and excluded in the price, who owns the domain and code, how scope changes are handled, what post-launch support covers and for how long, project milestones, and whether you can speak to a past client. Hesitation on ownership or references is a warning in itself.</p>

<h3>How much do website development companies charge?</h3>
<p>In India, basic business websites generally start around ₹20,000–₹50,000, feature-rich or e-commerce builds run into lakhs, and Western agencies charge several times more for comparable work. Treat any figure far below market with suspicion, and judge the quote's structure — itemized scope, exclusions, revision limits — more than its total.</p>

<h3>Should I hire a freelancer or a web development company?</h3>
<p>Freelancers cost less and suit small, well-defined projects; companies bring a team, process, and continuity — your project doesn't stall if one person falls sick or leaves. If the website is central to how your business earns, the reliability of a team usually justifies the difference in price.</p>

<h3>What support should a website development company provide after launch?</h3>
<p>At minimum: a defined support window for bug fixes, help with hosting or domain issues, security updates, and a stated response time for urgent problems. Ongoing maintenance — backups, updates, content changes — is usually a separate monthly arrangement, so ask exactly where free support ends and paid maintenance begins.</p>

<h2>Final Thoughts</h2>
<p>Choosing the best website development company isn't about finding the flashiest portfolio or the lowest quote — it's about verifiable evidence of good work, honest scope, real ownership, and support that survives past the invoice. Bring a clear brief, ask the ten questions, and take the flags seriously in both directions. An hour of proper vetting saves months of regret.</p>
<p>And if you'd like to see how we answer these questions ourselves — every one of them, in writing — <a href="/contact">talk to Web Digital Development</a>. We're happy to be vetted; the good companies always are.</p>`;

const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const blogDoc = {
  slug,
  title: "How to Choose the Best Website Development Company: The Complete Checklist",
  excerpt:
    "Portfolios, tech stacks, quotes, ownership, support promises — here's the complete checklist for choosing the best website development company, with the ten questions to ask and the red flags that should end the conversation.",
  content,
  author: "Web Digital Development Team",
  authorFollowUrl: "https://www.instagram.com/web_digital_development",
  category: "How-To",
  readTime: Math.ceil(words / 200),
  tags: [
    "website development company",
    "how to choose a web development company",
    "best website development company",
    "web development agency",
    "hiring web developers",
    "website development checklist",
  ],
  featuredImageAlt:
    "Checklist for choosing the best website development company — evaluating portfolio, tech stack, pricing, and support",
  seoTitle: "How to Choose the Best Website Development Company",
  seoDescription:
    "Choosing a website development company? Use this checklist — portfolio, tech stack, pricing structure, support, red flags — to pick the right partner.",
  relatedServices: ["website-development", "website-designing"],
  relatedBlogs: [
    "website-development-company-near-me",
    "how-to-choose-website-design-company-delhi-2026",
    "top-10-website-development-companies-delhi",
  ],
  published: true,
};

const seoMetaDoc = {
  title: "How to Choose the Best Website Development Company",
  description:
    "Choosing a website development company? Use this checklist — portfolio, tech stack, pricing structure, support, red flags — to pick the right partner.",
  keywords: [
    "how to choose the best website development company",
    "website development company",
    "how to choose the right website development company",
    "how to find a good web development company",
    "best web development company",
    "questions to ask a web development company",
    "web development company red flags",
    "website development company checklist",
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
