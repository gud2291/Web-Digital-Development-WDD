import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/config/env";
import { siteConfig } from "@/config/site";

/**
 * Lazy Resend client. Constructing at module load fails build-time page
 * data collection when env vars are absent — and serverEnv is itself a
 * runtime concern, so we defer instantiation.
 */
let _client: Resend | null = null;
export function getResend(): Resend {
  if (!_client) _client = new Resend(serverEnv.RESEND_API_KEY);
  return _client;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(params: SendEmailParams) {
  const { data, error } = await getResend().emails.send({
    from: `${siteConfig.name} <${serverEnv.RESEND_FROM_EMAIL}>`,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    react: params.react,
    replyTo: params.replyTo,
    cc: params.cc,
    bcc: params.bcc,
  } as Parameters<Resend["emails"]["send"]>[0]);

  if (error) {
    console.error("[email] send failed", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
  return data;
}
