import { NextResponse } from "next/server";
import { subscribeSchema } from "@/server/validation/newsletter";
import { subscribe } from "@/server/services/newsletter.service";
import { sendEmail } from "@/server/email/resend";
import { NewsletterWelcome } from "@/server/email/templates/newsletter-welcome";
import { siteConfig } from "@/config/site";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:newsletter:${ip}`);
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = subscribeSchema.parse(body);
    const { isNew } = await subscribe(data);

    if (isNew) {
      try {
        await sendEmail({
          to: data.email,
          subject: `You're subscribed — ${siteConfig.name}`,
          react: NewsletterWelcome({ email: data.email }),
        });
      } catch (err) {
        logger.error({ err }, "newsletter welcome email failed");
        // Subscription is saved — surface success even if email fails.
      }
    }

    return NextResponse.json({ ok: true, already: !isNew }, { status: 201 });
  });
}
