/* eslint-disable no-console */
/** Insert ONE published blog post + upsert its SeoMeta. Idempotent (upsert by slug).
 *  Content is CLIENT-PROVIDED — formatted to HTML with two owner-required factual
 *  corrections (200+ -> 150+ websites; one year of maintenance -> one month of free
 *  post-launch support) and in-body internal links added. Substance unchanged.
 *  featuredImage / ogImage live only in $setOnInsert so a later manual upload
 *  survives a re-run. Run: npx tsx scripts/seed-blog-questions-before-hiring-website-agency.ts */
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

const slug = "questions-to-ask-before-hiring-website-design-company";
const pageSlug = "blog/" + slug;
const canonical = "https://webdigitaldevelopment.com/blog/" + slug;

const content = `<p>Imagine this...</p>
<p>You decide it's finally time to build a website for your business. You search on Google for a "<a href="/blog/website-development-company-near-me">website designing company near me</a>" and within seconds, hundreds of agencies appear. Every website looks professional. Every agency claims they are the best. Every company promises affordable pricing, modern designs, fast delivery, and excellent support.</p>
<p>So, how do you decide which one is actually right for your business?</p>
<p>This is where many business owners make a costly mistake.</p>
<p>Some choose the cheapest quotation without checking what is included. Others get attracted by attractive designs but later realize their website is slow, difficult to manage, or doesn't appear on Google. Some agencies deliver the project but disappear when support is needed.</p>
<p>A business website is not just another expense. It is an investment that represents your company online. A well-planned website can help you generate enquiries, build trust, and attract new customers for years. On the other hand, choosing the wrong agency can cost you time, money, and potential business opportunities.</p>
<p>Before signing any agreement, take some time to ask the right questions. The answers will help you understand whether the agency is genuinely interested in helping your business grow or simply trying to complete another project.</p>
<p>In this guide, we'll walk through the most important questions every business owner should ask before hiring a website designing agency.</p>

<h2>1. Have You Worked with Businesses Similar to Mine?</h2>
<p>This should be the first question you ask.</p>
<p>Building a website for a restaurant is completely different from building one for a manufacturer. An exporter needs product catalogues and enquiry forms, while an interior designer needs a strong portfolio with high-quality project galleries. Every industry has different goals, different customers, and different expectations.</p>
<p>An experienced agency won't simply show you attractive designs. They'll ask about your business, your target audience, your competitors, and what you want your website to achieve.</p>
<p>When speaking with an agency, ask them to show websites they've built for businesses similar to yours. Don't just look at screenshots—visit the live websites. Check how fast they load, whether they work properly on mobile phones, and whether they are easy to navigate.</p>
<p>If an agency understands your industry, they are more likely to recommend features that genuinely help your business instead of adding unnecessary elements.</p>
<p><strong>Quick Tip:</strong> Experience in your industry isn't mandatory, but understanding your business goals is.</p>

<h2>2. Will I Own My Website After the Project Is Completed?</h2>
<p>Many business owners don't think about this until it's too late.</p>
<p>After paying for a website, you naturally assume everything belongs to you. Unfortunately, that isn't always the case.</p>
<p>Some agencies register the domain name in their own account. Others keep complete control of the hosting or website files. If you decide to work with another company in the future, transferring your website can become complicated.</p>
<p>Before hiring any agency, ask these questions:</p>
<ul>
<li>Will the domain name be registered in my company's name?</li>
<li>Will I receive hosting login details?</li>
<li>Will I get administrator access?</li>
<li>Will I receive the website files if required?</li>
<li>Can I move my website to another hosting provider later?</li>
</ul>
<p>A trustworthy agency will have no problem giving you complete ownership of your website after the project is completed.</p>
<p>Remember, you're investing in your business. Your website should always remain your asset.</p>

<h2>3. Which Technology Will You Use, and Why?</h2>
<p>Many people ask for a WordPress website simply because they've heard the name before.</p>
<p>Others ask for Laravel or Shopify without understanding whether those platforms actually suit their business.</p>
<p>The better question is:</p>
<p>"Which technology do you recommend for my business, and why?"</p>
<p>A professional agency won't recommend the same platform for every project. Instead, they'll first understand your requirements.</p>
<p>For example:</p>
<ul>
<li>A small local business may need a simple, easy-to-manage website.</li>
<li>A retailer selling products online may benefit from an <a href="/services/ecommerce-development">e-commerce platform</a>.</li>
<li>A manufacturer with custom workflows may require a fully custom solution.</li>
<li>A fast-growing company may need a scalable framework for future expansion.</li>
</ul>
<p>The right technology depends on your goals—not on what's popular.</p>
<p>A good agency will explain the pros and cons of different options in simple language so you can make an informed decision.</p>

<h2>4. Will My Website Be Mobile-Friendly?</h2>
<p>Think about the last time you searched for a business.</p>
<p>There's a good chance you used your mobile phone.</p>
<p>Today, most people browse websites on smartphones. If your website isn't easy to use on a smaller screen, visitors are likely to leave within seconds.</p>
<p>A mobile-friendly website automatically adjusts to different screen sizes, making it easier for customers to read content, browse services, and contact your business.</p>
<p>Before hiring an agency, ask them:</p>
<ul>
<li>Will the website work smoothly on Android and iPhone devices?</li>
<li>Will all pages be responsive?</li>
<li>Will forms and buttons be easy to use on mobile?</li>
<li>Will images load correctly?</li>
</ul>
<p>A mobile-friendly website doesn't just improve user experience—it also supports better visibility in search engines.</p>

<h2>5. Will My Website Be Built with SEO in Mind?</h2>
<p>Many business owners believe that simply launching a website will bring visitors from Google.</p>
<p>Unfortunately, that's not how search engines work.</p>
<p>If your website isn't built with SEO fundamentals, it can struggle to appear in search results, even if it looks attractive.</p>
<p>Ask the agency whether they include:</p>
<ul>
<li>Proper heading structure</li>
<li>SEO-friendly page URLs</li>
<li>Optimized title tags</li>
<li>Meta descriptions</li>
<li>Image optimization</li>
<li>Fast loading speed</li>
<li>Internal linking</li>
<li>Mobile optimization</li>
<li>Technical SEO basics</li>
</ul>
<p>These may seem like small details, but together they help search engines understand your website and improve the experience for visitors.</p>
<p>Also remember that website development and SEO are different services. A well-built website gives you a strong foundation, but <a href="/services/seo-services">ongoing SEO</a> is usually needed if you want to compete for popular search terms.</p>

<h2>6. What Is Included in the Total Cost?</h2>
<p>One of the biggest mistakes businesses make is comparing only the final price.</p>
<p>Imagine two agencies give you quotations.</p>
<p>The first company charges ₹20,000.</p>
<p>The second company charges ₹35,000.</p>
<p>Most people immediately think the first option is better because it's cheaper.</p>
<p>But what if the ₹20,000 package doesn't include hosting, SSL certificate, mobile optimization, basic SEO, revisions, or technical support?</p>
<p>And what if the ₹35,000 package includes everything you need for the first year?</p>
<p>Now the second option may actually save you money.</p>
<p>Instead of asking only "How much will the website cost?", ask for a detailed breakdown.</p>
<p>Questions you should ask include:</p>
<ul>
<li>Is website design included?</li>
<li>Is website development included?</li>
<li>Will you provide content uploading?</li>
<li>Is hosting included?</li>
<li>Is the domain included?</li>
<li>Is the SSL certificate included?</li>
<li>Are email accounts included?</li>
<li>Is basic SEO included?</li>
<li>Are there any annual renewal charges?</li>
<li>Are there any hidden costs?</li>
</ul>
<p>A professional agency should explain everything clearly before the project begins.</p>
<p>Transparency builds trust. For a fuller breakdown of what drives website pricing, see our guide to <a href="/blog/website-cost-delhi-2026">website costs in Delhi</a>.</p>

<h2>7. Will I Receive Support After My Website Goes Live?</h2>
<p>Launching a website is not the end of the journey.</p>
<p>In fact, it's only the beginning.</p>
<p>After your website goes live, you may need to:</p>
<ul>
<li>Update content</li>
<li>Add new services</li>
<li>Upload products</li>
<li>Fix small issues</li>
<li>Improve speed</li>
<li>Update plugins</li>
<li>Add new pages</li>
<li>Improve security</li>
</ul>
<p>Some agencies disappear after delivering the website.</p>
<p>Others charge for every small change.</p>
<p>Before hiring a website designing agency, ask:</p>
<ul>
<li>How long will support be available?</li>
<li>Is maintenance included?</li>
<li>What changes are free?</li>
<li>How quickly do you respond to support requests?</li>
<li>Will someone guide me if I need help?</li>
</ul>
<p>Choosing an agency that offers long-term support can save you a lot of stress later — our checklist of <a href="/blog/website-maintenance-after-launch">website maintenance tasks after launch</a> shows what that ongoing work involves, and our guide to <a href="/blog/website-maintenance-cost-india">website maintenance costs</a> shows what the market typically charges for it.</p>
<p>A good relationship doesn't end after the website is delivered.</p>

<h2>8. How Long Will It Take to Complete My Website?</h2>
<p>Every business owner wants their website as quickly as possible.</p>
<p>That's understandable.</p>
<p>However, be careful if someone promises to complete everything in just a few days without properly understanding your project.</p>
<p>A quality website takes planning.</p>
<p>The agency should first understand:</p>
<ul>
<li>Your business</li>
<li>Your target customers</li>
<li>Your competitors</li>
<li>Your branding</li>
<li>Required features</li>
<li>Content requirements</li>
</ul>
<p>Only then can they estimate a realistic timeline.</p>
<p>Simple business websites may take less time, while ecommerce websites or custom business portals naturally require more planning and development.</p>
<p>Instead of asking for the fastest delivery, ask for a realistic timeline with clear project milestones.</p>
<p>Knowing each stage helps avoid misunderstandings.</p>

<h2>9. Will My Website Be Easy to Update?</h2>
<p>Businesses change over time.</p>
<p>You might introduce new services.</p>
<p>Launch new products.</p>
<p>Change prices.</p>
<p>Publish blogs.</p>
<p>Hire new team members.</p>
<p>If every small update requires contacting the developer, your website can become difficult and expensive to maintain.</p>
<p>Ask the agency:</p>
<ul>
<li>Can I update text myself?</li>
<li>Can I upload images?</li>
<li>Can I add blogs?</li>
<li>Can I create new pages?</li>
<li>Can I manage products?</li>
</ul>
<p>An easy-to-manage website gives your business greater flexibility and saves time in the long run.</p>
<p>Even if you don't plan to update the website today, having that option is valuable for future growth.</p>

<h2>10. How Will My Website Help Me Generate Business?</h2>
<p>A beautiful website alone doesn't generate enquiries.</p>
<p>It should encourage visitors to take action.</p>
<p>Think about your own experience.</p>
<p>When you visit a business website, what makes you contact them?</p>
<p>Usually it's because the website clearly explains:</p>
<ul>
<li>What they offer</li>
<li>Why you should trust them</li>
<li>How to contact them</li>
<li>What happens next</li>
</ul>
<p>Ask the agency how they plan to increase enquiries through your website.</p>
<p>Useful features may include:</p>
<ul>
<li>Contact forms</li>
<li>WhatsApp button</li>
<li>Call now button</li>
<li>Quote request forms</li>
<li>Appointment booking</li>
<li>Live chat</li>
<li>Customer testimonials</li>
<li>Case studies</li>
<li>Clear call-to-action buttons</li>
</ul>
<p>Every page should guide visitors toward the next step instead of simply displaying information.</p>

<h2>11. Will My Website Be Secure?</h2>
<p>Website security is often ignored until something goes wrong.</p>
<p>A hacked website can damage your reputation, affect customer trust, and even impact your Google rankings.</p>
<p>Before choosing a website designing agency, ask how they protect your website.</p>
<p>Important security measures include:</p>
<ul>
<li>SSL certificate</li>
<li>Secure hosting</li>
<li>Regular backups</li>
<li>Malware protection</li>
<li>User access controls</li>
<li>Secure coding practices</li>
<li>Software updates</li>
</ul>
<p>Security should never be treated as an optional extra.</p>
<p>It's an essential part of every professional website.</p>

<h2>Quick Checklist Before Hiring Any Website Designing Agency</h2>
<p>Before making your final decision, make sure you know:</p>
<ul>
<li>✔️ What's included in the quotation.</li>
<li>✔️ Whether support is available after launch.</li>
<li>✔️ The estimated project timeline.</li>
<li>✔️ Whether you can update the website yourself.</li>
<li>✔️ How the website will help generate enquiries.</li>
<li>✔️ What security measures will be implemented.</li>
</ul>
<p>If an agency answers these questions confidently and transparently, you're far more likely to receive a website that supports your business over the long term.</p>

<h2>12. Can You Show Me Live Websites You Have Built?</h2>
<p>Almost every website designing agency has a portfolio page.</p>
<p>But here's something many business owners forget.</p>
<p>A screenshot tells you very little.</p>
<p>Instead of looking at images, ask for live website links.</p>
<p>Spend a few minutes exploring them yourself.</p>
<p>Check whether the website:</p>
<ul>
<li>Loads quickly</li>
<li>Works properly on your mobile phone</li>
<li>Has a professional layout</li>
<li>Is easy to navigate</li>
<li>Has clear contact options</li>
<li>Looks modern and well maintained</li>
</ul>
<p>A live website gives you a much better idea of the agency's quality than a presentation or PDF.</p>
<p>If possible, ask whether any of the websites are in a business similar to yours.</p>
<p>You don't need an identical project—you simply want to see how the agency solves different business problems.</p>

<h2>13. How Will You Measure the Success of My Website?</h2>
<p>Many business owners believe a website project is finished once the website goes live.</p>
<p>A professional agency thinks differently.</p>
<p>The real success of a website is measured after launch.</p>
<p>For example:</p>
<ul>
<li>Are visitors staying on your website?</li>
<li>Are people contacting your business?</li>
<li>Are enquiries increasing?</li>
<li>Are visitors finding your website through Google?</li>
<li>Are customers completing purchases?</li>
<li>Is the bounce rate improving?</li>
</ul>
<p>A good website should support business growth, not simply exist online.</p>
<p>Ask the agency how they measure success after the website is launched.</p>
<p>The conversation should include performance—not just design.</p>

<h2>14. Will My Website Grow Along With My Business?</h2>
<p>Your business today may look very different two years from now.</p>
<p>Perhaps you'll launch new products.</p>
<p>Expand to another city.</p>
<p>Start exporting.</p>
<p>Introduce online payments.</p>
<p>Add a customer portal.</p>
<p>Or launch a complete ecommerce store.</p>
<p>If your website cannot grow with your business, you'll eventually need to rebuild everything.</p>
<p>That's expensive.</p>
<p>Instead, ask whether the website can be expanded in the future.</p>
<p>Some useful questions include:</p>
<ul>
<li>Can new pages be added later?</li>
<li>Can ecommerce be added in the future?</li>
<li>Can multiple languages be supported?</li>
<li>Can customer login features be added?</li>
<li>Can booking systems be integrated?</li>
<li>Can the website handle higher traffic as my business grows?</li>
</ul>
<p>A scalable website protects your future investment.</p>

<h2>15. Why Should I Choose Your Agency Instead of Another One?</h2>
<p>This is probably the most important question of all.</p>
<p>Listen carefully to the answer.</p>
<p>If the agency only talks about low prices or says they're "the best," ask them to explain why.</p>
<p>A professional agency usually talks about:</p>
<ul>
<li>Understanding your business</li>
<li>Long-term partnership</li>
<li>Transparent communication</li>
<li>Quality development</li>
<li>Technical expertise</li>
<li>Business-focused solutions</li>
<li>Ongoing support</li>
</ul>
<p>You're not buying a website.</p>
<p>You're choosing a partner who will represent your business online.</p>
<p>The right agency should be interested in helping your business succeed—not just completing another project.</p>

<h2>Common Mistakes Businesses Make While Hiring a Website Designing Agency</h2>
<p>Over the years, many businesses have repeated the same mistakes.</p>
<p>Learning from them can save you both time and money — and our guide on <a href="/blog/how-to-choose-website-design-company-delhi-2026">how to choose a website design company</a> goes deeper into the warning signs to watch for.</p>

<h3>Choosing the Cheapest Quote</h3>
<p>A lower price may also mean fewer features, lower quality, limited support, or hidden charges later.</p>
<p>Always compare value instead of price alone.</p>

<h3>Ignoring SEO</h3>
<p>Some businesses spend thousands on website design but forget about search visibility.</p>
<p>Without proper SEO planning, even an attractive website may receive very little traffic.</p>

<h3>Not Asking About Ownership</h3>
<p>If you don't own your domain, hosting, or website files, changing agencies later can become difficult.</p>
<p>Always clarify ownership before the project begins.</p>

<h3>Focusing Only on Design</h3>
<p>A beautiful website is helpful.</p>
<p>But if it loads slowly, confuses visitors, or doesn't generate enquiries, appearance alone won't help your business grow.</p>
<p>Good design should support usability and business goals.</p>

<h3>Forgetting About Mobile Users</h3>
<p>Today, most website visitors come from smartphones.</p>
<p>Ignoring mobile optimization can result in lost enquiries and a poor user experience.</p>

<h3>Expecting Instant Google Rankings</h3>
<p>Some agencies promise first-page Google rankings within days.</p>
<p>Be cautious.</p>
<p>SEO is an ongoing process influenced by many factors, including competition, content quality, technical optimization, and website authority.</p>
<p>Reliable agencies will set realistic expectations rather than make unrealistic guarantees.</p>

<h2>A Simple Hiring Checklist</h2>
<p>Before signing any agreement, make sure you know the answers to these questions:</p>
<ul>
<li>✔️ Have they worked with businesses like mine?</li>
<li>✔️ Do I own the website after completion?</li>
<li>✔️ Which technology will they use, and why?</li>
<li>✔️ Is the website mobile responsive?</li>
<li>✔️ Is basic SEO included?</li>
<li>✔️ What exactly is included in the quotation?</li>
<li>✔️ Do they provide support after launch?</li>
<li>✔️ Can I update the website myself?</li>
<li>✔️ How will the website help generate enquiries?</li>
<li>✔️ What security measures will be implemented?</li>
<li>✔️ Can the website grow with my business?</li>
<li>✔️ Can they show live projects?</li>
</ul>
<p>If you can confidently answer "Yes" to these questions, you're much more likely to choose the right website designing agency. And if you want the deeper evaluation criteria behind each of these points, see our complete guide on <a href="/blog/how-to-choose-website-development-company">how to choose a website development company</a>.</p>

<h2>Frequently Asked Questions (FAQs)</h2>

<h3>How much does it cost to build a professional business website?</h3>
<p>The cost depends on several factors, including the number of pages, design requirements, custom features, integrations, and the technology used. Instead of looking for the lowest price, focus on the value you receive. A professionally built website with proper support and SEO fundamentals often delivers better long-term results than a low-cost website that requires frequent fixes.</p>

<h3>How long does it take to complete a website?</h3>
<p>The timeline depends on the project's complexity. A simple business website usually takes less time than an ecommerce website or a custom web application. The quality of content, approvals, and required features also affect the delivery timeline.</p>

<h3>Which platform is best for my business?</h3>
<p>There is no single platform that suits every business.</p>
<p>A local service provider may need a simple business website, while an exporter, manufacturer, or ecommerce business may require a more advanced solution.</p>
<p>A good website designing agency recommends technology based on your business objectives rather than promoting one platform for every project.</p>

<h3>Will my website work on mobile phones?</h3>
<p>Yes, every modern business website should be fully responsive.</p>
<p>Your website should provide a smooth experience on desktops, tablets, and smartphones so visitors can easily browse your services and contact your business from any device.</p>

<h3>Can I update the website after it's launched?</h3>
<p>Most professional websites include an admin panel that allows you to update content, images, blogs, services, or products without needing technical knowledge.</p>
<p>Before hiring an agency, confirm how easy it will be to manage your website.</p>

<h3>Will my website appear on Google?</h3>
<p>A website can only appear in Google when it follows proper SEO practices and contains valuable content.</p>
<p>A good agency builds a website with SEO fundamentals, but long-term rankings also depend on content quality, competition, website authority, and ongoing optimization.</p>

<h3>Do I really need website maintenance?</h3>
<p>Yes.</p>
<p>Like any business asset, a website requires regular updates, security improvements, backups, and performance monitoring.</p>
<p>Ignoring maintenance can create security risks and reduce website performance over time.</p>

<h3>Can my website grow as my business grows?</h3>
<p>Absolutely.</p>
<p>A professionally planned website should allow you to add new services, products, landing pages, payment gateways, booking systems, blogs, or ecommerce features whenever your business expands.</p>
<p>Planning for future growth helps you avoid rebuilding your website later.</p>

<h2>Final Thoughts</h2>
<p>Choosing a website designing agency is an important business decision.</p>
<p>Your website is often the first interaction potential customers have with your company. It represents your brand, builds trust, and helps visitors decide whether they should contact you.</p>
<p>That's why selecting the right agency should never be based only on price or attractive designs.</p>
<p>Instead, look for a team that understands your business, communicates clearly, provides honest advice, and focuses on building a website that supports your long-term growth.</p>
<p>The right website isn't simply a digital brochure.</p>
<p>It becomes a powerful marketing tool that works for your business every day by attracting visitors, generating enquiries, and strengthening your online presence.</p>
<p>Take your time, ask the right questions, compare agencies carefully, and choose a partner that is genuinely invested in your success.</p>

<h2>Why Businesses Choose Web Digital Development</h2>
<p>At <a href="/about">Web Digital Development</a>, we believe every business deserves more than just a visually appealing website.</p>
<p>Before starting any project, we take the time to understand your business, industry, target audience, and long-term goals. This allows us to recommend the right technology, features, and strategy instead of offering the same solution to every client.</p>
<p>Our team has successfully delivered 150+ websites for manufacturers, exporters, service providers, interior designers, agro businesses, startups, and local businesses.</p>
<p>We don't stop after launching your website.</p>
<p>We provide:</p>
<ul>
<li>Free business consultation</li>
<li>Technology recommendations based on your requirements</li>
<li>Responsive website development</li>
<li>Basic SEO setup</li>
<li>One month of free post-launch support</li>
<li>Ongoing technical support</li>
<li>Guidance on improving your online presence</li>
<li>Support for <a href="/services/seo-services">SEO</a>, Google Ads, Meta Ads, and <a href="/services/digital-marketing">digital marketing</a></li>
</ul>
<p>Our objective is simple: to help businesses build websites that create trust, generate enquiries, and support long-term growth.</p>

<h2>Ready to Build a Website That Helps Your Business Grow?</h2>
<p>Whether you're planning your first website or upgrading an existing one, choosing the right development partner can make a significant difference.</p>
<p>If you're looking for a team that combines technical expertise with business understanding, we're here to help.</p>
<p>Talk to our experts, discuss your requirements, and receive practical recommendations based on your business—not generic templates.</p>
<p>Let's build a website that supports your business today and continues to grow with you in the future.</p>
<p>Need professional guidance?</p>
<p><a href="/contact">Contact Web Digital Development</a> today for a free consultation and discover how the right website can become one of your most valuable business assets.</p>`;

const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const blogDoc = {
  slug,
  title: "Questions to Ask Before Hiring a Website Design Company",
  excerpt:
    "Every agency claims to be the best, and every quotation looks reasonable — until the website turns out slow, hard to manage, or invisible on Google. These are the questions to ask before hiring a website design company, so you choose a genuine partner instead of just another project.",
  content,
  author: "Web Digital Development Team",
  authorFollowUrl: "https://www.instagram.com/web_digital_development",
  category: "How-To",
  readTime: Math.ceil(words / 200),
  tags: [
    "website designing agency",
    "questions to ask a web design company",
    "hiring a website design company",
    "web design india",
    "website cost",
    "choosing a web partner",
  ],
  featuredImageAlt:
    "Business owner asking questions before hiring a website design company during an agency meeting",
  seoTitle: "Questions to Ask a Website Design Company",
  seoDescription:
    "The exact questions to ask before hiring a website design company — ownership, costs, SEO, support, and timelines — so you pick the right partner.",
  relatedServices: ["website-designing", "website-development"],
  relatedBlogs: [
    "how-to-choose-website-design-company-delhi-2026",
    "how-to-choose-website-development-company",
    "website-cost-delhi-2026",
  ],
  published: true,
};

const seoMetaDoc = {
  title: "Questions to Ask a Website Design Company",
  description:
    "The exact questions to ask before hiring a website design company — ownership, costs, SEO, support, and timelines — so you pick the right partner.",
  keywords: [
    "questions to ask before hiring a website design company",
    "questions to ask a web design agency",
    "hiring a website design company",
    "website designing agency",
    "how to choose a website design agency",
    "website design company india",
    "website ownership questions",
    "web design agency hiring checklist",
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
    "| h3:", (b.content.match(/<h3/g) || []).length
  );
  console.log("corrections check | '150+':", b.content.includes("150+ websites"),
    "| 'one month support':", b.content.includes("One month of free post-launch support"),
    "| stale '200+':", b.content.includes("200+"), "| stale 'One year of maintenance':", b.content.includes("One year of maintenance"));
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
