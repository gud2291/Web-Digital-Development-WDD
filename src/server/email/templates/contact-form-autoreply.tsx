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

export interface ContactFormAutoReplyProps {
  name: string;
}

export function ContactFormAutoReply({ name }: ContactFormAutoReplyProps) {
  return (
    <Html>
      <Head />
      <Preview>Thanks for reaching out to {siteConfig.name}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 24, marginBottom: 12 }}>
            Thanks, {name}!
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            We&apos;ve received your message and a member of the {siteConfig.name} team will get
            back to you within one business day.
          </Text>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            If you need an immediate response, you can also reach us on WhatsApp at
            {" "}
            <a href={`https://wa.me/${siteConfig.whatsapp}`} style={{ color: brand.primary600 }}>
              +{siteConfig.whatsapp}
            </a>
            .
          </Text>
          <Hr style={{ borderColor: brand.border, margin: "24px 0" }} />
          <Text style={{ color: brand.inkMuted, fontSize: 13 }}>
            — The {siteConfig.shortName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactFormAutoReply;
