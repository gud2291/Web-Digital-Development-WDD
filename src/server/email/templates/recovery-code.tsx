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

export interface RecoveryCodeProps {
  email: string;
  recoveryCode: string;
}

export function RecoveryCode({ email, recoveryCode }: RecoveryCodeProps) {
  return (
    <Html>
      <Head />
      <Preview>Your new admin recovery code</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 22, marginBottom: 8 }}>
            Recovery code generated
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            A one-time recovery code was generated for {email}. Store it somewhere safe — you
            won&apos;t see it again. It can be used to regain access if you lose your 2FA device.
          </Text>
          <Hr style={{ borderColor: brand.border, margin: "20px 0" }} />
          <Section
            style={{
              backgroundColor: brand.bg,
              border: `1px solid ${brand.border}`,
              borderRadius: 8,
              padding: 16,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                color: brand.primary,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "2px",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {recoveryCode}
            </Text>
          </Section>
          <Text style={{ color: brand.inkMuted, fontSize: 13, marginTop: 16 }}>
            This code is single-use. Generating a new one invalidates the previous code.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default RecoveryCode;
