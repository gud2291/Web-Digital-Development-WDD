import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import { brand, fontFamily } from "./_shared";

export interface PasswordChangedProps {
  email: string;
  timestamp?: string;
}

export function PasswordChanged({ email, timestamp }: PasswordChangedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your admin password was changed</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 22, marginBottom: 8 }}>
            Password changed
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            The password for {email} was changed on{" "}
            {timestamp ?? new Date().toLocaleString("en-IN")}.
          </Text>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            If you did not make this change, contact the site owner immediately and rotate
            credentials.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordChanged;
