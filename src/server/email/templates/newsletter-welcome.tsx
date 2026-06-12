import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { brand, fontFamily } from "./_shared";
import { siteConfig } from "@/config/site";

export interface NewsletterWelcomeProps {
  email: string;
}

export function NewsletterWelcome({ email }: NewsletterWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re subscribed to the {siteConfig.name} newsletter</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 24, marginBottom: 12 }}>
            You&apos;re in! 🎉
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            Thanks for subscribing to the {siteConfig.name} newsletter. You&apos;ll get our best
            plain-English writing on websites, SEO and growing a small business online — no spam,
            unsubscribe anytime.
          </Text>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            In the meantime, browse our latest articles at{" "}
            <a href={`${siteConfig.url}/blog`} style={{ color: brand.primary600 }}>
              {siteConfig.url.replace(/^https?:\/\//, "")}/blog
            </a>
            .
          </Text>
          <Hr style={{ borderColor: brand.border, margin: "24px 0" }} />
          <Text style={{ color: brand.inkMuted, fontSize: 13 }}>
            Subscribed as {email} — The {siteConfig.shortName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterWelcome;
