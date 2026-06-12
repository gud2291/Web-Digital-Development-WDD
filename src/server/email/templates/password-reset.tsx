import {
  Body,
  Button,
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

export interface PasswordResetProps {
  resetUrl: string;
  email: string;
}

export function PasswordReset({ resetUrl, email }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your admin password — Web Digital Development</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container
          style={{
            maxWidth: 600,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 32,
            border: `1px solid ${brand.border}`,
          }}
        >
          <Heading style={{ color: brand.primary, fontSize: 22, marginBottom: 8 }}>
            Reset your password
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            We received a request to reset the password for <strong>{email}</strong>.
          </Text>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </Text>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button
              href={resetUrl}
              style={{
                display: "inline-block",
                backgroundColor: brand.primary600,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                padding: "14px 32px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Reset Password
            </Button>
          </Section>
          <Hr style={{ borderColor: brand.border, margin: "20px 0" }} />
          <Text style={{ color: brand.inkMuted, fontSize: 13, lineHeight: 1.6 }}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </Text>
          <Text style={{ color: brand.inkMuted, fontSize: 12, lineHeight: 1.5, marginTop: 16 }}>
            — Web Digital Development
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordReset;
