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

export interface LoginAlertProps {
  email: string;
  ip: string;
  browser?: string;
  os?: string;
  timestamp?: string;
}

export function LoginAlert(props: LoginAlertProps) {
  const { email, ip, browser, os, timestamp } = props;
  return (
    <Html>
      <Head />
      <Preview>New admin login detected</Preview>
      <Body style={{ backgroundColor: brand.bg, fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#fff", borderRadius: 12, padding: 32, border: `1px solid ${brand.border}` }}>
          <Heading style={{ color: brand.primary, fontSize: 22, marginBottom: 8 }}>
            New admin login
          </Heading>
          <Text style={{ color: brand.ink, fontSize: 15, lineHeight: 1.6 }}>
            A login to the {email} admin account just happened. If this was you, no action is
            needed. If not, change your password immediately and review login history.
          </Text>
          <Hr style={{ borderColor: brand.border, margin: "20px 0" }} />
          <Row label="IP address" value={ip} />
          {browser ? <Row label="Browser" value={browser} /> : null}
          {os ? <Row label="OS" value={os} /> : null}
          <Row label="Time" value={timestamp ?? new Date().toLocaleString("en-IN")} />
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ color: brand.ink, fontSize: 14, margin: "4px 0" }}>
      <strong style={{ color: brand.inkMuted, fontWeight: 600 }}>{label}: </strong>
      {value}
    </Text>
  );
}

export default LoginAlert;
