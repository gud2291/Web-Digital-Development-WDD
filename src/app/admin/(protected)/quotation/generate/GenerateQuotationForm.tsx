"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { siteConfig } from "@/config/site";

export interface GenServiceOption {
  slug: string;
  title: string;
}

export interface GenCustomServiceOption {
  title: string;
  costRange: string;
  scope: string[];
}

interface Prefill {
  clientName?: string;
  email?: string;
  phone?: string;
  business?: string;
}

type Action = "download" | "email" | "whatsapp";

function filenameFromHeader(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const m = /filename="?([^"]+)"?/.exec(header);
  return m?.[1] || fallback;
}

/** Digits only, drop leading zeros, default to +91 for 10-digit local numbers. */
function normalizePhone(raw: string): string {
  let d = (raw || "").replace(/\D/g, "").replace(/^0+/, "");
  if (d.length === 10) d = `91${d}`;
  return d;
}

export function GenerateQuotationForm({
  services,
  customServices = [],
  prefill,
}: {
  services: GenServiceOption[];
  customServices?: GenCustomServiceOption[];
  prefill: Prefill;
}) {
  const hasServices = services.length > 0;
  const [clientName, setClientName] = React.useState(prefill.clientName ?? "");
  const [email, setEmail] = React.useState(prefill.email ?? "");
  const [phone, setPhone] = React.useState(prefill.phone ?? "");
  const [business, setBusiness] = React.useState(prefill.business ?? "");
  const [serviceSlug, setServiceSlug] = React.useState(services[0]?.slug ?? "__custom__");
  const [developmentCost, setDevelopmentCost] = React.useState("");
  const [customTitle, setCustomTitle] = React.useState("");
  const [customScopeText, setCustomScopeText] = React.useState("");
  const [busy, setBusy] = React.useState<Action | null>(null);

  const isCustom = serviceSlug === "__custom__";

  const handleServiceChange = (value: string) => {
    if (value.startsWith("list:")) {
      const idx = Number(value.slice("list:".length));
      const item = customServices[idx];
      setServiceSlug("__custom__");
      setCustomTitle(item?.title ?? "");
      setCustomScopeText((item?.scope ?? []).join("\n"));
      setDevelopmentCost(item?.costRange ?? "");
    } else if (value === "__custom__") {
      setServiceSlug("__custom__");
      setCustomTitle("");
      setCustomScopeText("");
      setDevelopmentCost("");
    } else {
      setServiceSlug(value);
    }
  };

  const submit = async (action: Action) => {
    if (!clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!serviceSlug) {
      toast.error("Please choose a service");
      return;
    }
    if (isCustom && !customTitle.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (action === "email" && !email.trim()) {
      toast.error("Client email is required to send the quotation");
      return;
    }
    if (action === "whatsapp" && !phone.trim()) {
      toast.error("Client phone is required to send via WhatsApp");
      return;
    }

    // Pre-open a tab for WhatsApp so the popup isn't blocked after the await.
    let waWin: Window | null = null;
    if (action === "whatsapp") waWin = window.open("about:blank", "_blank");

    setBusy(action);
    try {
      const res = await fetch("/api/admin/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          serviceSlug,
          clientName: clientName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          business: business.trim(),
          developmentCost: developmentCost.trim(),
          customServiceTitle: isCustom ? customTitle.trim() : "",
          customScope: isCustom
            ? customScopeText.split("\n").map((l) => l.trim()).filter(Boolean)
            : [],
          action,
        }),
      });

      if (action === "download") {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not generate the quotation.");
        }
        const blob = await res.blob();
        const filename = filenameFromHeader(res.headers.get("Content-Disposition"), "Quotation-WDD.pdf");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Quotation PDF downloaded");
      } else if (action === "email") {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not email the quotation.");
        toast.success(`Quotation emailed to ${data.emailedTo}`);
      } else {
        // whatsapp
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not prepare the WhatsApp message.");
        const to = normalizePhone(phone);
        const message =
          `Hello ${clientName.trim()}, here is your quotation from ${siteConfig.name} ` +
          `(${data.quotationNo}) for ${data.serviceLabel}.\n\n` +
          `View / download the PDF here:\n${data.pdfUrl}\n\n` +
          `Feel free to reply with any questions — we'd be glad to help.`;
        const waUrl = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
        if (waWin) waWin.location.href = waUrl;
        else window.open(waUrl, "_blank", "noopener,noreferrer");
        toast.success("Opening WhatsApp with the quotation link…");
      }
    } catch (err) {
      if (waWin) waWin.close();
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="admin-form">
      <div className="admin-form-section">
        <h3>Client details</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Client name *</label>
            <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Rajesh Kumar" />
          </div>
          <div className="field">
            <label className="field__label">Client email {`(required to email)`}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" />
          </div>
        </div>
        <div className="admin-form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Phone {`(required for WhatsApp)`}</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98xxxxxxxx (+91 added automatically)" />
          </div>
          <div className="field">
            <label className="field__label">Business name</label>
            <input className="input" value={business} onChange={(e) => setBusiness(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Service</h3>
        <div className="field">
          <label className="field__label">Quotation service *</label>
          <select className="select" value={serviceSlug} onChange={(e) => handleServiceChange(e.target.value)}>
            {hasServices &&
              services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            {customServices.map((c, idx) => (
              <option key={`list:${idx}`} value={`list:${idx}`}>
                {c.title}
              </option>
            ))}
            <option value="__custom__">➕ Other — type a service…</option>
          </select>
          {!hasServices && (
            <span className="admin-form-help">
              Enable “Quotation” on a service (Services → edit → Quotation) to make it available here.
            </span>
          )}
        </div>
        {isCustom && (
          <>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="field__label">Service name *</label>
              <input
                className="input"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Dynamic Website Development"
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="field__label">Scope of work (optional)</label>
              <textarea
                className="textarea"
                style={{ minHeight: 80 }}
                value={customScopeText}
                onChange={(e) => setCustomScopeText(e.target.value)}
                placeholder="One item per line"
              />
            </div>
          </>
        )}
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Total development cost</label>
          <input
            className="input"
            value={developmentCost}
            onChange={(e) => setDevelopmentCost(e.target.value)}
            placeholder="e.g. ₹35,000  (leave blank to use the service's default)"
          />
          <span className="admin-form-help">
            Shown as “Total Development Cost” on the quotation PDF. If left blank, the service’s saved cost is used.
          </span>
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="button" iconRight="download" disabled={busy !== null} onClick={() => submit("download")}>
          {busy === "download" ? "Generating…" : "Download PDF"}
        </Btn>
        <Btn type="button" variant="secondary" iconRight="mail" disabled={busy !== null} onClick={() => submit("email")}>
          {busy === "email" ? "Sending…" : "Email to client"}
        </Btn>
        <Btn type="button" variant="secondary" iconRight="whatsapp" disabled={busy !== null} onClick={() => submit("whatsapp")}>
          {busy === "whatsapp" ? "Preparing…" : "Send via WhatsApp"}
        </Btn>
      </div>
    </div>
  );
}
