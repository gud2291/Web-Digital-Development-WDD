"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { SortableList } from "@/components/admin/SortableList";
import { applyFieldReorder } from "@/components/admin/reorderFieldArray";
import { adminApi } from "@/lib/adminApi";

const schema = z.object({
  validity: z.string().default(""),
  deliveryTime: z.string().default(""),
  hostingCost: z.string().default(""),
  hostingNote: z.string().default(""),
  domainNote: z.string().default(""),
  greetingTemplate: z.string().default(""),
  footerNote: z.string().default(""),
  paymentTerms: z
    .array(z.object({ percent: z.string().default(""), label: z.string().default(""), sub: z.string().default("") }))
    .default([]),
  featureBadges: z
    .array(z.object({ title: z.string().default(""), subtitle: z.string().default("") }))
    .default([]),
});

type Values = z.infer<typeof schema>;

export interface QuotationSettingsInitial {
  validity?: string;
  deliveryTime?: string;
  hostingCost?: string;
  hostingNote?: string;
  domainNote?: string;
  greetingTemplate?: string;
  footerNote?: string;
  paymentTerms?: { percent?: string; label?: string; sub?: string }[];
  featureBadges?: { title?: string; subtitle?: string }[];
}

export function QuotationSettingsForm({ initial }: { initial: QuotationSettingsInitial }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      validity: initial.validity ?? "1 Month",
      deliveryTime: initial.deliveryTime ?? "",
      hostingCost: initial.hostingCost ?? "",
      hostingNote: initial.hostingNote ?? "",
      domainNote: initial.domainNote ?? "",
      greetingTemplate: initial.greetingTemplate ?? "",
      footerNote: initial.footerNote ?? "",
      paymentTerms: (initial.paymentTerms ?? []).map((p) => ({
        percent: p.percent ?? "",
        label: p.label ?? "",
        sub: p.sub ?? "",
      })),
      featureBadges: (initial.featureBadges ?? []).map((b) => ({
        title: b.title ?? "",
        subtitle: b.subtitle ?? "",
      })),
    },
  });

  const termsArr = useFieldArray({ control, name: "paymentTerms" });
  const badgesArr = useFieldArray({ control, name: "featureBadges" });

  const onSubmit = async (values: Values) => {
    try {
      await adminApi.put("/api/admin/quotation", values);
      toast.success("Quotation settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <h3>Validity & delivery</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Quotation validity</label>
            <input className="input" placeholder="e.g. 1 Month" {...register("validity")} />
          </div>
          <div className="field">
            <label className="field__label">Default delivery time</label>
            <input className="input" placeholder="e.g. 15 – 25 working days" {...register("deliveryTime")} />
          </div>
        </div>
        <p className="admin-form-help" style={{ marginTop: 8 }}>
          A service can override the delivery time in its own Quotation section; this is the fallback.
        </p>
      </div>

      <div className="admin-form-section">
        <h3>Domain &amp; hosting</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Hosting cost</label>
            <input className="input" placeholder="e.g. ₹5,000 / year" {...register("hostingCost")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Hosting note</label>
          <textarea className="textarea" style={{ minHeight: 64 }} {...register("hostingNote")} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Domain note</label>
          <textarea className="textarea" style={{ minHeight: 64 }} {...register("domainNote")} />
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Payment terms</h3>
        <p className="t-small" style={{ marginBottom: 12 }}>
          Shown as the &ldquo;Payment Terms&rdquo; row on the quotation. Drag or use ↑/↓ to reorder.
          A typical split is 20% Advance · 30% After Design Approval · 50% Before Final Deployment.
        </p>
        <SortableList
          items={termsArr.fields}
          getId={(f) => f.id}
          onReorder={(ids) =>
            applyFieldReorder(ids, termsArr.fields.map((f) => f.id), watch("paymentTerms") ?? [], termsArr.replace)
          }
          empty={<span className="t-small">No payment terms yet — add one below.</span>}
          render={(_f, idx) => (
            <div style={{ width: "100%", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input className="input" style={{ maxWidth: 120 }} placeholder="Percent (20%)" {...register(`paymentTerms.${idx}.percent` as const)} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <input className="input" placeholder="Label (Advance)" {...register(`paymentTerms.${idx}.label` as const)} />
                <input className="input" placeholder="Sub-text (optional)" {...register(`paymentTerms.${idx}.sub` as const)} />
              </div>
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" aria-label="Remove payment term" onClick={() => termsArr.remove(idx)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          )}
        />
        <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 12 }} onClick={() => termsArr.append({ percent: "", label: "", sub: "" })}>
          <Icon name="plus" size={12} /> Add payment term
        </Btn>
      </div>

      <div className="admin-form-section">
        <h3>Feature badges</h3>
        <p className="t-small" style={{ marginBottom: 12 }}>
          The &ldquo;What You Get&rdquo; badges near the bottom of the quotation. Drag or use ↑/↓ to reorder.
          e.g. Modern &amp; Responsive · Basic SEO Setup · Secure &amp; Reliable · Support &amp; Assistance.
        </p>
        <SortableList
          items={badgesArr.fields}
          getId={(f) => f.id}
          onReorder={(ids) =>
            applyFieldReorder(ids, badgesArr.fields.map((f) => f.id), watch("featureBadges") ?? [], badgesArr.replace)
          }
          empty={<span className="t-small">No badges yet — add one below.</span>}
          render={(_f, idx) => (
            <div style={{ width: "100%", display: "flex", gap: 8 }}>
              <input className="input" placeholder="Title" {...register(`featureBadges.${idx}.title` as const)} />
              <input className="input" placeholder="Subtitle" {...register(`featureBadges.${idx}.subtitle` as const)} />
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" aria-label="Remove badge" onClick={() => badgesArr.remove(idx)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          )}
        />
        <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 12 }} onClick={() => badgesArr.append({ title: "", subtitle: "" })}>
          <Icon name="plus" size={12} /> Add badge
        </Btn>
      </div>

      <div className="admin-form-section">
        <h3>Greeting &amp; footer</h3>
        <div className="field">
          <label className="field__label">Greeting template</label>
          <textarea
            className="textarea"
            style={{ minHeight: 90 }}
            placeholder="Dear {clientName}, thank you for your interest…"
            {...register("greetingTemplate")}
          />
          <span className="admin-form-help">
            Use <code>{"{clientName}"}</code> where the visitor&apos;s name should appear.
          </span>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Footer note</label>
          <textarea className="textarea" style={{ minHeight: 64 }} {...register("footerNote")} />
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save quotation settings"}
        </Btn>
      </div>
    </form>
  );
}
