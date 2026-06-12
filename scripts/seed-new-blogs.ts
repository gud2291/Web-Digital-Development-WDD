/* eslint-disable no-console */
/** Seed 5 new blog posts for Phase 3.
 *  Run: npx tsx scripts/seed-new-blogs.ts */
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

const blogs = [
  {
    slug: "how-to-choose-website-design-company-delhi-2026",
    title: "How to Choose a Website Design Company in Delhi (2026 Checklist)",
    excerpt:
      "Delhi has hundreds of web agencies. How do you pick the right one for your business? This checklist covers what to look for, what to avoid, and how to verify their work.",
    category: "How-To",
    author: "Gudia Yadav",
    readTime: 8,
    content: `<p><strong>The problem:</strong> Delhi's web design market is crowded. Freelancers, agencies, and consultants all claim to build great sites. Many deliver templates with your logo slapped on top. Others overcharge for work a junior developer could do. How do you find the right partner?</p>
<h2>1. Check their actual work</h2>
<p>Ask for client sites they've shipped. Visit 3-5 of them. Are they fast (under 2 seconds load)? Do they look professional? Most importantly — click around and ask yourself, "Would I be proud to own this?"</p>
<p>Avoid agencies that can't show live work or only show template sites.</p>
<h2>2. Verify they code, not just template</h2>
<p>Ask: "Will you build on Wix/Webflow/Squarespace?" If yes, walk away. Custom code (Next.js, PHP, WordPress with custom themes) is faster, cheaper to maintain, and easier for SEO.</p>
<h2>3. Ask about SEO</h2>
<p>Real web agencies build SEO in during development — schema markup, clean HTML, fast load times. Agencies that talk about SEO as an "add-on service" don't understand web fundamentals.</p>
<h2>4. Get a written scope</h2>
<p>Before you commit, get a written proposal that lists: number of pages, which features, third-party integrations, timeline, and price. If it's vague, it's a red flag.</p>
<h2>5. Ask about post-launch support</h2>
<p>You'll find bugs after launch. Ask how long they support you and what happens after that. "One month free" is standard. Anything less is stingy.</p>
<h2>6. Talk to the actual person doing the work</h2>
<p>Not a project manager, not a salesperson — the developer or designer who will touch your project. Can you reach them? Do they answer your questions clearly?</p>
<h2>Red flags</h2>
<ul><li>Pressure to decide "today" or in the next few hours</li>
<li>Can't show you live client work</li>
<li>Price is suspiciously cheap ("₹5,000 website!!") or vaguely high</li>
<li>Won't put scope and price in writing</li>
<li>No clear communication channel (email disappears, only messages via WhatsApp)</li>
<li>Templates reused across clients (same design, different company names)</li></ul>
<h2>Green flags</h2>
<ul><li>They ask about YOUR business before talking features</li>
<li>They have real examples (live sites, case studies, before/after)</li>
<li>They clearly explain their process (discovery, design, dev, launch)</li>
<li>Fixed price in writing — no surprises</li>
<li>Founder or senior person is accessible</li>
<li>They talk about SEO and performance as basics, not extras</li></ul>
<p>Choosing a web partner is one of the few decisions that directly affects your business's ability to win customers online. Take time, ask questions, and don't rush.</p>`,
    seoTitle: "How to Choose a Website Design Company in Delhi (2026 Checklist)",
    seoDescription:
      "Delhi checklist for picking the right website design company. What to look for, red flags, green flags, and how to verify their work before you hire.",
    tags: ["web design", "Delhi", "choosing agencies", "tips"],
  },
  {
    slug: "website-redesign-signs-losing-customers",
    title: "Website Redesign: 9 Signs Your Business Site Is Losing You Customers",
    excerpt:
      "Your site gets traffic but few leads. Is it the design? The speed? The copy? Here are 9 signs it's time for a redesign — and what actually fixes them.",
    category: "Strategy",
    author: "Gudia Yadav",
    readTime: 7,
    content: `<p><strong>You've got traffic but few leads.</strong> Visitors come, spend 5 seconds, leave. Something is wrong. Is it the design? The copy? The site speed? This post covers the most common killers.</p>
<h2>1. Your site is visually dated</h2>
<p>Web design trends shift every 2-3 years. If your site looks like it's from 2015 (heavy shadows, gradients, cheesy stock photos), visitors assume your business is also out of date. A fresh visual refresh signals you're current.</p>
<h2>2. It doesn't work on phones</h2>
<p>70-80% of your traffic is on mobile. If your site is not fully mobile-friendly — buttons too small to tap, forms cramped, images pixelated — visitors bounce immediately. Mobile-first is mandatory in 2026.</p>
<h2>3. Pages take 3+ seconds to load</h2>
<p>Studies show every 1 second of delay costs 7% of conversions. If your homepage takes 4 seconds to load, you're losing 20%+ of potential customers. Compress images, clean up code, use a CDN.</p>
<h2>4. The copy is all about you, not them</h2>
<p>"We've been in business since 2000. We have the best team. We offer 50 services." Visitors don't care. They care: "Will this solve MY problem?" Rewrite from the customer's perspective.</p>
<h2>5. There's no clear call-to-action</h2>
<p>Each page should have ONE clear thing you want the visitor to do: "Book a call." "Buy now." "Request a quote." If you have 5 CTAs competing, visitors do nothing.</p>
<h2>6. You can't edit it yourself</h2>
<p>If you need to pay $500 to a developer every time you update a blog post or change a phone number, you'll never keep content fresh. A good site lets your team edit content without code knowledge.</p>
<h2>7. Google doesn't rank you for your main keywords</h2>
<p>You should rank page 1 for "website design Delhi" or whatever your main service is. If you don't, your site either lacks SEO fundamentals (schema markup, clean HTML, quality content) or has thin/duplicate content.</p>
<h2>8. Your competitors' sites look better</h2>
<p>Visit 3-5 competitors. If theirs feel more modern, more trustworthy, or easier to navigate, redesign. Customers make snap judgments in seconds.</p>
<h2>9. Your bounce rate is 60%+</h2>
<p>Google Analytics shows your bounce rate (visitors who leave after one page). Above 60% means something is wrong — slow speed, unclear messaging, poor design, or wrong traffic source.</p>
<h2>What actually fixes these</h2>
<ul><li><strong>Design:</strong> Fresh, modern look. Mobile-first. Clean, readable type.</li>
<li><strong>Speed:</strong> Image optimization, code cleanup, CDN hosting, lazy-loading.</li>
<li><strong>Copy:</strong> Rewrite for the customer, not about you.</li>
<li><strong>SEO:</strong> Schema markup, internal linking, keyword-first titles, quality content.</li>
<li><strong>Usability:</strong> Clear CTAs, easy navigation, editable CMS.</li></ul>
<p>A redesign isn't just about looking pretty — it's about building a machine that actually converts.</p>`,
    seoTitle: "Website Redesign: 9 Signs Your Business Site Is Losing Customers",
    seoDescription:
      "Is your website costing you customers? Check: outdated design, mobile issues, slow speed, wrong copy, unclear CTA. Here are 9 signs and how to fix them.",
    tags: ["website redesign", "conversion", "UX"],
  },
  {
    slug: "local-seo-delhi-businesses-step-by-step",
    title: "Local SEO for Delhi Businesses: A Step-by-Step Guide",
    excerpt:
      "Local SEO gets Delhi customers to find YOU. Here's the exact process: keywords, Google Business, citations, reviews, and on-page optimization.",
    category: "SEO",
    author: "Gudia Yadav",
    readTime: 9,
    content: `<p><strong>Local SEO is how customers in Delhi find your business on Google Maps and search.</strong> Unlike global SEO, local SEO is small — but if done right, it's fast. Here's how.</p>
<h2>Step 1: Keyword research for Delhi</h2>
<p>Search Google for keywords like "website design near me" or "accountant Delhi" from a Delhi location. Note which businesses appear in the map pack. Those are your competitors.</p>
<p>Find 10-15 local keywords: "plumber South Delhi", "dentist Noida", "accountant Faridabad". Mix broad ("digital marketing Delhi") and specific ("digital marketing strategy Connaught Place").</p>
<h2>Step 2: Claim and optimize Google Business Profile</h2>
<p>Go to business.google.com. Create or claim your profile. Fill EVERY field: name, address (exact, matching your on-site NAP), phone, hours, website, services, photos.</p>
<p>Upload 10+ photos: office exterior, team, work, happy clients. Google shows these in results. Fresh photos get more clicks.</p>
<h2>Step 3: Build NAP consistency</h2>
<p>NAP = Name, Address, Phone. It must be IDENTICAL everywhere: your website, Google, Facebook, local directories, emails. Even minor differences (D-54 vs D54) can confuse Google's algorithm.</p>
<p>Audit: Google your business name + address. Check every result. Fix mismatches.</p>
<h2>Step 4: Get reviews on Google</h2>
<p>More reviews = higher rank. Ask 10 happy clients to leave a Google review. Make it easy: give them a short link to your review page.</p>
<p>Respond to all reviews — positive AND negative. Show you care.</p>
<h2>Step 5: Build local citations</h2>
<p>Citations = mentions of your NAP on directories. Submit your business to: JustDial, Sulekha, India Business Pages, Yellow Pages, LinkedIn Company Page. It's tedious but it works.</p>
<h2>Step 6: On-page local SEO</h2>
<p>In your homepage and service pages, mention Delhi prominently: "Website design company in Delhi", "Serving Delhi NCR", "Based in Palam, New Delhi". Add your full address in footer.</p>
<p>Schema markup (structured data) tells Google where you are and what you do. Add your schema to your site.</p>
<h2>Step 7: Build local content</h2>
<p>Write blog posts about local topics: "Best neighborhoods for a startup in Delhi", "Delhi's tech ecosystem in 2026". Link them to your main services. This builds authority on "Delhi + your industry".</p>
<h2>Step 8: Get local backlinks</h2>
<p>Ask your clients to link to you. Ask local partner businesses. Get mentioned in Delhi business publications online. Quality matters more than quantity.</p>
<h2>Results timeline</h2>
<ul><li><strong>Weeks 1-4:</strong> Fix Google Business, claim citations, get initial reviews</li>
<li><strong>Weeks 5-12:</strong> Content, NAP consistency, initial backlinks start to work</li>
<li><strong>Months 4-6:</strong> You should start ranking for local keywords</li></ul>
<p>Local SEO is a marathon, not a sprint. But unlike national SEO, you're competing with fewer businesses. Consistency wins.</p>`,
    seoTitle: "Local SEO for Delhi Businesses: A Step-by-Step Guide",
    seoDescription:
      "Local SEO playbook for Delhi, Noida, Gurgaon businesses: Google Business, NAP, citations, reviews, local content, backlinks. Get found by nearby customers.",
    tags: ["local SEO", "Delhi", "Google Business", "small business"],
  },
  {
    slug: "nextjs-vs-wordpress-business-websites",
    title: "Next.js vs WordPress for Business Websites in India",
    excerpt:
      "Which platform should you choose for your business site? Next.js for speed and custom features. WordPress for easy editing. Here's the real comparison.",
    category: "Technology",
    author: "Gudia Yadav",
    readTime: 7,
    content: `<p><strong>You're building a website. Someone recommends WordPress. Someone else says Next.js. Which is right for you?</strong> It depends on what your business actually needs.</p>
<h2>WordPress</h2>
<p><strong>Best for:</strong> Blogs, content-heavy sites, sites your team will edit frequently.</p>
<p><strong>Pros:</strong></p>
<ul><li>Easy to edit content — no coding needed</li>
<li>Huge ecosystem of plugins for almost anything</li>
<li>Cheap hosting (₹200-500/month)</li>
<li>SEO-friendly out-of-the-box (with plugins)</li>
<li>Familiar to most developers</li></ul>
<p><strong>Cons:</strong></p>
<ul><li>Gets bloated with plugins — slow if not maintained</li>
<li>Security requires constant updates</li>
<li>Not ideal for complex custom features</li>
<li>Can feel outdated visually if you don't invest in a good theme</li></ul>
<p><strong>Cost:</strong> ₹200/month hosting + ₹0-5,000 one-time for custom theme + ongoing maintenance.</p>
<h2>Next.js</h2>
<p><strong>Best for:</strong> Fast sites, e-commerce, custom web apps, sites you want to own completely.</p>
<p><strong>Pros:</strong></p>
<ul><li>Lightning fast — pages load in milliseconds</li>
<li>Modern, clean code — easy to scale</li>
<li>Custom design without plugin limitations</li>
<li>SEO built-in (server-side rendering)</li>
<li>No plugin bloat</li>
<li>Free hosting tier (Vercel) for most businesses</li></ul>
<p><strong>Cons:</strong></p>
<ul><li>Requires a developer to update content (unless you add a CMS)</li>
<li>Higher initial dev cost</li>
<li>Smaller ecosystem than WordPress</li>
<li>Learning curve for non-technical teams</li></ul>
<p><strong>Cost:</strong> ₹30,000-75,000+ upfront + ₹0-2,000/month hosting (Vercel or AWS).</p>
<h2>The decision tree</h2>
<p><strong>Choose WordPress if:</strong> You want to blog frequently, you're budget-conscious, your team will edit content, you want a familiar platform, you need plugins for specific features.</p>
<p><strong>Choose Next.js if:</strong> Speed is critical, you want custom design, you have a developer on staff or budget for updates, you want to avoid plugin bloat, you're building an e-commerce or membership site.</p>
<h2>The hybrid approach</h2>
<p>Next.js with a headless CMS (like Contentful or Sanity). You get Next.js speed with an editor-friendly backend. Cost: ₹40,000-80,000 upfront, but faster updates.</p>
<h2>What we recommend</h2>
<p>For 80% of Delhi businesses: <strong>Next.js with a simple CMS (or static content)</strong>. You get speed, modern design, and SEO. For blogs, add a simple blog CMS on top.</p>
<p>For content-heavy businesses (publishers, agencies, news sites): <strong>WordPress with a custom theme</strong>. The plugin ecosystem is unbeatable.</p>
<p>The best platform is the one your team will actually maintain and keep updated.</p>`,
    seoTitle: "Next.js vs WordPress for Business Websites in India",
    seoDescription:
      "Comparing Next.js and WordPress for Indian business websites. Speed, cost, editing, maintenance, SEO. Which platform fits your business?",
    tags: ["technology", "Next.js", "WordPress", "web development"],
  },
  {
    slug: "ecommerce-mistakes-indian-stores",
    title: "E-commerce Website Mistakes Indian Stores Keep Making",
    excerpt:
      "Online stores in India often make the same mistakes: slow sites, unclear pricing, complicated checkout. Here are 9 common e-commerce bugs and how to fix them.",
    category: "E-commerce",
    author: "Gudia Yadav",
    readTime: 8,
    content: `<p><strong>You've launched an e-commerce store and traffic is good — but conversions are low.</strong> Most Indian online stores make the same mistakes. Here's what's probably costing you sales.</p>
<h2>1. The site is slow on 3G</h2>
<p>India's average internet is 4G or slower. If your product photos are unoptimized, your checkout takes 5 seconds to load, you're losing 20%+ of orders. Compress images aggressively. Use lazy-loading. Test on slow networks.</p>
<h2>2. Checkout has too many steps</h2>
<p>If customers have to create an account, enter 10 fields, enter payment details separately, they'll abandon. Minimize steps. Let them check out as a guest. Auto-fill what you can.</p>
<h2>3. No trust signals</h2>
<p>Show a real address, real phone number, real return policy, customer reviews, security badges. Indian shoppers don't trust faceless stores.</p>
<h2>4. Unclear product information</h2>
<p>Small product photos, vague descriptions, no size/colour variants clearly displayed. Customers can't tell if it fits. Show 5-10 photos per product. Describe material, size, care instructions.</p>
<h2>5. Shipping cost is a shock</h2>
<p>Calculate shipping on the product page, not at checkout. Show exactly how much it'll cost. Hidden costs lose sales. Consider free shipping over ₹500 to encourage larger orders.</p>
<h2>6. Payment options are limited</h2>
<p>Indians use UPI, net banking, credit card, debit card, Razorpay. Support at least 3-4. If you only accept credit card, you're losing 60% of potential customers.</p>
<h2>7. No abandoned cart recovery</h2>
<p>30% of carts are abandoned. Email them a reminder with their cart contents + a discount code. You'll recover 5-10% of those orders.</p>
<h2>8. Customer support is invisible</h2>
<p>Phone number buried in footer. Chat unavailable. Email takes 2 days to respond. Customers want to reach you fast. Have live chat or quick email response (under 4 hours).</p>
<h2>9. Returns policy is unclear</h2>
<p>Write it clearly: how many days for returns, who pays shipping, how to initiate, when refund is issued. Unclear policy kills trust and increases support requests.</p>
<h2>Fixes that move the needle</h2>
<ul><li>Optimize images: compress to under 200KB each</li>
<li>Reduce checkout to 3 steps max</li>
<li>Add Razorpay + UPI payment</li>
<li>Add customer reviews (with photos)</li>
<li>Setup abandoned cart emails</li>
<li>Add live chat widget</li>
<li>Show shipping cost on product page</li></ul>
<p>The best e-commerce sites remove friction at every step. What's costing YOU the most sales?</p>`,
    seoTitle: "E-commerce Website Mistakes Indian Stores Keep Making",
    seoDescription:
      "9 common e-commerce mistakes in India: slow sites, unclear pricing, limited payment options, poor trust signals. Fixes that actually increase conversions.",
    tags: ["e-commerce", "conversion", "online store", "India"],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;

  for (const blog of blogs) {
    const doc = {
      ...blog,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
      featuredImage: "", // Owner will add via admin
      order: 4 + blogs.indexOf(blog),
    };
    await db.collection("blogs").updateOne({ slug: blog.slug }, { $set: doc }, { upsert: true });
    console.log(`✓ ${blog.slug}`);
  }

  await mongoose.disconnect();
  console.log("✓ Done. (Note: Owner should add featuredImage for each via admin panel)");
}

run().catch((e) => { console.error(e); process.exit(1); });
