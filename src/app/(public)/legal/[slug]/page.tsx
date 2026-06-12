import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Btn, Reveal } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getLegalPageBySlug } from "@/server/services/legalPage.service";
import { getPreviewDoc } from "@/server/preview/getPreviewDoc";
import { buildMetadata, metadataFromDb } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { SchemaMarkup, breadcrumbSchema } from "@/components/SchemaMarkup";

export const dynamic = "force-dynamic";

const ALLOWED_SLUGS = ["privacy-policy", "terms", "refund"] as const;

const FALLBACK_TITLES: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
};

const FALLBACK_CONTENT: Record<string, string> = {
  "privacy-policy": `<p>Web Digital Development (&ldquo;we&rdquo;, &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal data.</p>
<h3>1. Information We Collect</h3>
<p>We collect information you provide via contact forms — including your name, email, phone number, and project details.</p>
<h3>2. How We Use Information</h3>
<ul style="padding-left:24px;list-style:disc"><li>To respond to inquiries</li><li>To send project updates</li><li>To improve our website</li><li>To comply with legal obligations</li></ul>
<h3>3. Data Protection</h3>
<p>We follow strict industry-standard measures. Your data is never sold to third parties.</p>
<h3>4. Cookies</h3>
<p>Our website uses cookies for analytics and personalization. You can disable cookies in your browser.</p>
<h3>5. Changes to This Policy</h3>
<p>We may update this policy occasionally. Please check back periodically.</p>`,
  terms: `<p>By using Web Digital Development&apos;s services, you agree to these terms.</p>
<h3>1. Services</h3>
<p>We provide website design, development, SEO, and digital marketing services as agreed in your engagement letter.</p>
<h3>2. Payments</h3>
<p>Payment terms are defined in your project quote. Late payments may incur additional fees.</p>
<h3>3. Intellectual Property</h3>
<p>On full payment, all deliverables transfer to you. We retain the right to display work in our portfolio.</p>
<h3>4. Liability</h3>
<p>Our liability is limited to the fees paid for the specific service in question.</p>`,
  refund: `<p>We stand behind our work. Refund eligibility depends on the stage and nature of the engagement.</p>
<h3>1. Eligibility</h3>
<p>Refund requests must be made in writing within 7 days of the relevant milestone.</p>
<h3>2. Non-Refundable Items</h3>
<p>Third-party costs (hosting, domains, paid plugins, ad spend) are non-refundable once incurred.</p>
<h3>3. Process</h3>
<p>Approved refunds are issued to the original payment method within 14 business days.</p>`,
};

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  if (!ALLOWED_SLUGS.includes(params.slug as (typeof ALLOWED_SLUGS)[number])) {
    return buildMetadata({ title: "Legal", path: `/legal/${params.slug}` });
  }
  const doc = await getLegalPageBySlug(params.slug).catch(() => null);
  const title = doc?.title || FALLBACK_TITLES[params.slug] || "Legal";
  return metadataFromDb(`legal/${params.slug}`, {
    path: `/legal/${params.slug}`,
    title,
    description: `${title} — Web Digital Development.`,
  });
}

export default async function LegalPage({
  params,
  searchParams,
}: PageProps & { searchParams?: { preview?: string; token?: string } }) {
  if (!ALLOWED_SLUGS.includes(params.slug as (typeof ALLOWED_SLUGS)[number])) {
    notFound();
  }

  const draft = await getPreviewDoc<Record<string, unknown>>("legal", searchParams);
  const doc = draft
    ? (draft as unknown as Awaited<ReturnType<typeof getLegalPageBySlug>>)
    : await getLegalPageBySlug(params.slug).catch(() => null);
  const title = doc?.title || FALLBACK_TITLES[params.slug] || "Legal";
  const content = doc?.content || FALLBACK_CONTENT[params.slug] || "";
  const lastUpdated = doc?.lastUpdated ? formatDate(doc.lastUpdated) : formatDate(new Date());

  return (
    <>
      <SchemaMarkup
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: title, url: `/legal/${params.slug}` },
        ])}
      />
      <section style={{ background: "var(--c-bg-section)", padding: "56px 0 40px" }}>
        <div className="container" style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <Icon name="chevRight" size={12} />
            <b>{title}</b>
          </div>
          <Reveal>
            <Badge kind="neutral">Legal</Badge>
            <h1 className="t-h1" style={{ fontSize: 48, marginTop: 14 }}>{title}</h1>
            <div className="t-small" style={{ marginTop: 10 }}>Last updated: {lastUpdated}</div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container article-content" style={{ maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <div
              className="card"
              style={{
                marginTop: 40,
                padding: 28,
                background: "var(--c-bg-section)",
                borderColor: "var(--c-primary-100)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h4 style={{ fontWeight: 700 }}>Need Help?</h4>
                <div className="t-small" style={{ marginTop: 4 }}>
                  Questions about this policy? We&apos;re here to help.
                </div>
              </div>
              <Link href="/contact">
                <Btn iconRight="arrowRight">Contact Us</Btn>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
