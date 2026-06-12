import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { brand, fontFamily } from "./_shared";

export interface ContactFormAdminProps {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  submittedAt?: string;
}

export function ContactFormAdmin(props: ContactFormAdminProps) {
  const { name, email, phone, service, budget, message, submittedAt } = props;
  return (
    <Html>
      <Head />
      <Preview>New inquiry from {name}</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 24, marginBottom: 8 }}>
            New Contact Inquiry
          </Heading>
          <Text style={{ color: brand.inkMuted, fontSize: 14, marginTop: 0 }}>
            {submittedAt ?? new Date().toLocaleString("en-IN")}
          </Text>
          <Hr style={{ borderColor: brand.border, margin: "20px 0" }} />
          <Section>
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            {phone ? <Row label="Phone" value={phone} /> : null}
            {service ? <Row label="Service" value={service} /> : null}
            {budget ? <Row label="Budget" value={budget} /> : null}
          </Section>
          <Hr style={{ borderColor: brand.border, margin: "20px 0" }} />
          <Text style={{ color: brand.ink, fontSize: 15, fontWeight: 600 }}>Message</Text>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ color: brand.ink, fontSize: 15, margin: "4px 0" }}>
      <strong style={{ color: brand.inkMuted, fontWeight: 600 }}>{label}: </strong>
      {value}
    </Text>
  );
}

export default ContactFormAdmin;
