import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { customAlphabet } from "nanoid";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  getQuotationSettings,
  getCachedQuotationSettings,
  updateQuotationSettings,
} from "@/server/services/quotationSettings.service";
import { updateQuotationSettingsSchema, generateQuotationSchema } from "@/server/validation/quotation";
import { getServiceBySlug } from "@/server/services/service.service";
import { QuotationDocument } from "@/server/pdf/QuotationDocument";
import { sendEmail } from "@/server/email/resend";
import { uploadToCloudinary } from "@/server/media/cloudinary";
import { createQuotationRecord } from "@/server/services/quotation.service";
import { siteConfig } from "@/config/site";
import { handle, badRequest } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const quoteId = customAlphabet("0123456789", 4);

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getQuotationSettings();
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateQuotationSettingsSchema.parse(await req.json());
    const doc = await updateQuotationSettings(data);
    // Bust the cached read so the next generated PDF reflects the new values.
    revalidateTag("quotation-settings");
    return NextResponse.json(doc);
  });
}

/**
 * Admin-only quotation generator. Loads the selected service's quotation fields
 * + global QuotationSettings, renders the PDF via the existing generator, then
 * either returns it as a download or emails it to the client (Resend).
 */
export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = generateQuotationSchema.parse(await req.json());

    if (data.action === "email" && !data.email) {
      return badRequest("Client email is required to send the quotation");
    }
    if (data.action === "whatsapp" && !data.phone) {
      return badRequest("Client phone is required to send via WhatsApp");
    }

    const service = await getServiceBySlug(data.serviceSlug, true);
    if (!service || !service.quotationEnabled) {
      return badRequest("Selected service is not available for quotation");
    }

    const settings = await getCachedQuotationSettings();

    const quotationNo = `WDD-${quoteId()}`;
    const date = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

    // Per-service values fall back to the global quotation settings.
    const deliveryTime = service.quotationDeliveryTime || settings?.deliveryTime || "";
    const hostingCost = service.quotationHostingCost || settings?.hostingCost || "";
    const headerSubtitle = service.quotationTitle || service.title;
    const greeting = (settings?.greetingTemplate || "").replace(/\{clientName\}/g, data.clientName);
    // Always show the brand domain on the PDF — never siteConfig.url / NEXT_PUBLIC_SITE_URL
    // (which is localhost in dev).
    const website = "www.webdigitaldevelopment.com";

    const buffer = await renderToBuffer(
      QuotationDocument({
        quotationNo,
        date,
        clientName: data.clientName,
        validity: settings?.validity || "",
        headerSubtitle,
        greeting,
        costRange: service.quotationCostRange || "",
        scope: (service.quotationScope as string[]) || [],
        paymentTerms: (settings?.paymentTerms || []).map((p) => ({
          percent: p.percent || "",
          label: p.label || "",
          sub: p.sub || "",
        })),
        hostingCost,
        hostingNote: settings?.hostingNote || "",
        domainNote: settings?.domainNote || "",
        featureBadges: (settings?.featureBadges || []).map((b) => ({
          title: b.title || "",
          subtitle: b.subtitle || "",
        })),
        deliveryTime,
        footerNote: settings?.footerNote || "",
        phone: siteConfig.phone,
        website,
      })
    );

    const filename = `Quotation-${quotationNo}.pdf`;
    const serviceLabel = String(service.quotationTitle || service.title);

    // Record every quotation so the admin can track who got what (never blocks
    // the response on failure).
    const saveRecord = async (sentVia: "download" | "email" | "whatsapp", pdfUrl = "") => {
      try {
        await createQuotationRecord({
          quotationNo,
          clientName: data.clientName,
          phone: data.phone || "",
          email: data.email || "",
          serviceSlug: String(service.slug || data.serviceSlug),
          serviceTitle: serviceLabel,
          costRange: service.quotationCostRange || "",
          sentVia,
          pdfUrl,
        });
      } catch (err) {
        logger.error({ err }, "quotation record save failed");
      }
    };

    if (data.action === "whatsapp") {
      // WhatsApp can't attach a file via a link, so host the PDF on Cloudinary
      // (raw resource) and hand back its public URL for the share message.
      const uploaded = await uploadToCloudinary(buffer, {
        folder: "wdd/quotations",
        publicId: `${quotationNo}.pdf`,
        resourceType: "raw",
      });
      await saveRecord("whatsapp", uploaded.url);
      return NextResponse.json({
        ok: true,
        quotationNo,
        serviceLabel,
        pdfUrl: uploaded.url,
      });
    }

    if (data.action === "email") {
      await sendEmail({
        to: data.email as string,
        subject: `Your Quotation from ${siteConfig.name} (${quotationNo})`,
        replyTo: siteConfig.email,
        html: coveringEmailHtml({
          clientName: data.clientName,
          serviceLabel: String(serviceLabel),
          quotationNo,
          website,
        }),
        attachments: [{ filename, content: buffer }],
      });
      await saveRecord("email");
      return NextResponse.json({ ok: true, quotationNo, emailedTo: data.email });
    }

    await saveRecord("download");
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  });
}

function coveringEmailHtml(p: {
  clientName: string;
  serviceLabel: string;
  quotationNo: string;
  website: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#15803d;border-radius:12px 12px 0 0;padding:22px 24px;">
        <div style="color:#fff;font-size:18px;font-weight:bold;">${siteConfig.name}</div>
        <div style="color:#dcfce7;font-size:12px;margin-top:4px;letter-spacing:.5px;">QUOTATION ${p.quotationNo}</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <p style="margin:0 0 14px;font-size:15px;">Dear ${p.clientName},</p>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
          Thank you for your interest in <strong>${siteConfig.name}</strong>. Please find your detailed
          quotation for <strong>${p.serviceLabel}</strong> attached as a PDF (${p.quotationNo}).
        </p>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
          The attached document outlines the project cost, scope of work, payment terms and timeline.
          If you have any questions or would like to proceed, simply reply to this email or call us —
          we&apos;d be glad to help.
        </p>
        <p style="margin:18px 0 0;font-size:14px;line-height:1.6;">
          Warm regards,<br/>
          <strong>${siteConfig.name}</strong><br/>
          <span style="color:#475569;">${siteConfig.phone} &nbsp;•&nbsp; ${p.website}</span>
        </p>
      </div>
    </div>
  </body>
</html>`;
}
