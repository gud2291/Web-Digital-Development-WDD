"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { SortableList } from "@/components/admin/SortableList";
import { applyFieldReorder } from "@/components/admin/reorderFieldArray";
import { LivePreview } from "@/components/admin/LivePreview";
import { adminApi } from "@/lib/adminApi";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase, numbers, dashes"),
  shortDescription: z.string().max(300).default(""),
  content: z.string().default(""),
  coverImage: z.string().default(""),
  icon: z.string().default("monitor"),
  iconName: z.string().default("Globe"),
  accentColor: z.enum(["blue", "green", "orange", "pink", "purple", "teal"]).default("blue"),
  features: z.array(z.object({ value: z.string().min(1) })).default([]),
  faqs: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).default([]),
  pricingTiers: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.string().min(1),
        features: z.array(z.object({ value: z.string().min(1) })).default([]),
        popular: z.boolean().default(false),
      })
    )
    .default([]),
  seoTitle: z.string().max(120).default(""),
  seoDescription: z.string().max(200).default(""),
  visible: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  _id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
  iconName?: string;
  accentColor?: string;
  features?: string[];
  faqs?: { q: string; a: string }[];
  pricingTiers?: { name: string; price: string; features?: string[]; popular?: boolean }[];
  seoTitle?: string;
  seoDescription?: string;
  visible?: boolean;
}

interface Props {
  initial?: InitialDoc;
}

const ICON_CHOICES = ["monitor", "code", "search", "cart", "megaphone", "smartphone", "rocket", "shield", "sparkle"];
const LUCIDE_ICON_CHOICES = ["Palette", "Code2", "Search", "TrendingUp", "ShoppingCart", "PenTool", "Globe", "Smartphone"];
const ACCENT_CHOICES = ["blue", "green", "orange", "pink", "purple", "teal"];

export function ServiceForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial?._id;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      shortDescription: initial?.shortDescription ?? "",
      content: initial?.content ?? "",
      coverImage: initial?.coverImage ?? "",
      icon: initial?.icon ?? "monitor",
      iconName: initial?.iconName ?? "Globe",
      accentColor: (initial?.accentColor ?? "blue") as Values["accentColor"],
      features: (initial?.features ?? []).map((v) => ({ value: v })),
      faqs: initial?.faqs ?? [],
      pricingTiers: (initial?.pricingTiers ?? []).map((t) => ({
        name: t.name,
        price: t.price,
        popular: !!t.popular,
        features: (t.features ?? []).map((v) => ({ value: v })),
      })),
      seoTitle: initial?.seoTitle ?? "",
      seoDescription: initial?.seoDescription ?? "",
      visible: initial?.visible ?? true,
    },
  });

  const title = watch("title");
  React.useEffect(() => {
    if (!isEdit && title) setValue("slug", slugify(title));
  }, [title, isEdit, setValue]);

  const liveValues = watch();
  const featuresArr = useFieldArray({ control, name: "features" });
  const faqsArr = useFieldArray({ control, name: "faqs" });
  const tiersArr = useFieldArray({ control, name: "pricingTiers" });

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      features: values.features.map((f) => f.value),
      pricingTiers: values.pricingTiers.map((t) => ({
        name: t.name,
        price: t.price,
        popular: t.popular,
        features: t.features.map((f) => f.value),
      })),
    };
    try {
      if (isEdit) {
        await adminApi.put(`/api/admin/services/${initial!._id}`, payload);
        toast.success("Service updated");
      } else {
        await adminApi.post("/api/admin/services", payload);
        toast.success("Service created");
      }
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <LivePreview
      resource="service"
      previewPath={`/services/${liveValues.slug || "preview"}`}
      state={{
        ...liveValues,
        features: (liveValues.features ?? []).map((f) => f.value),
        pricingTiers: (liveValues.pricingTiers ?? []).map((t) => ({
          ...t,
          features: (t.features ?? []).map((f) => f.value),
        })),
      }}
    >
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <h3>Basic info</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Title</label>
            <input className="input" {...register("title")} />
            {errors.title && <span className="admin-form-err">{errors.title.message}</span>}
          </div>
          <div className="field">
            <label className="field__label">Slug</label>
            <input className="input" {...register("slug")} />
            {errors.slug && <span className="admin-form-err">{errors.slug.message}</span>}
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Short description</label>
          <textarea className="textarea" {...register("shortDescription")} style={{ minHeight: 80 }} />
        </div>
        <div className="admin-form-row admin-form-row--3" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Icon</label>
            <select className="select" {...register("icon")}>
              {ICON_CHOICES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <label className="admin-form-checkbox" style={{ alignSelf: "end", paddingBottom: 10 }}>
            <input type="checkbox" {...register("visible")} /> Visible on site
          </label>
        </div>
        <div className="admin-form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Card icon (lucide)</label>
            <select className="select" {...register("iconName")}>
              {LUCIDE_ICON_CHOICES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Accent colour</label>
            <select className="select" {...register("accentColor")}>
              {ACCENT_CHOICES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Long description</h3>
        <Controller
          control={control}
          name="content"
          render={({ field }) => <TipTapEditor value={field.value} onChange={field.onChange} />}
        />
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <div style={{ marginTop: 14 }}>
              <ImageUploader value={field.value} onChange={field.onChange} label="Cover image" />
            </div>
          )}
        />
      </div>

      <div className="admin-form-section">
        <h3>Features</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {featuresArr.fields.map((f, idx) => (
            <div key={f.id} style={{ display: "flex", gap: 8 }}>
              <input className="input" {...register(`features.${idx}.value` as const)} placeholder="Feature bullet" />
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => featuresArr.remove(idx)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <Btn size="sm" type="button" variant="secondary" onClick={() => featuresArr.append({ value: "" })}>
            <Icon name="plus" size={12} /> Add feature
          </Btn>
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Pricing tiers</h3>
        <p className="t-small" style={{ marginBottom: 10 }}>Drag tiers to reorder.</p>
        <SortableList
          items={tiersArr.fields}
          getId={(t) => t.id}
          onReorder={(orderedIds) =>
            applyFieldReorder(orderedIds, tiersArr.fields.map((f) => f.id), watch("pricingTiers") ?? [], tiersArr.replace)
          }
          render={(_t, tierIdx) => (
            <TierEditor
              tierIdx={tierIdx}
              register={register}
              control={control}
              onRemove={() => tiersArr.remove(tierIdx)}
            />
          )}
        />
        <Btn
          size="sm"
          type="button"
          variant="secondary"
          style={{ marginTop: 12 }}
          onClick={() => tiersArr.append({ name: "", price: "", popular: false, features: [] })}
        >
          <Icon name="plus" size={12} /> Add tier
        </Btn>
      </div>

      <div className="admin-form-section">
        <h3>FAQs</h3>
        <p className="t-small" style={{ marginBottom: 10 }}>Drag FAQs to reorder.</p>
        <SortableList
          items={faqsArr.fields}
          getId={(f) => f.id}
          onReorder={(orderedIds) =>
            applyFieldReorder(orderedIds, faqsArr.fields.map((f) => f.id), watch("faqs") ?? [], faqsArr.replace)
          }
          render={(_f, idx) => (
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" placeholder="Question" {...register(`faqs.${idx}.q` as const)} />
                <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => faqsArr.remove(idx)}>
                  <Icon name="x" size={12} />
                </button>
              </div>
              <textarea
                className="textarea"
                placeholder="Answer"
                style={{ marginTop: 8, minHeight: 60 }}
                {...register(`faqs.${idx}.a` as const)}
              />
            </div>
          )}
        />
        <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 12 }} onClick={() => faqsArr.append({ q: "", a: "" })}>
          <Icon name="plus" size={12} /> Add FAQ
        </Btn>
      </div>

      <div className="admin-form-section">
        <h3>SEO</h3>
        <div className="field">
          <label className="field__label">SEO title</label>
          <input className="input" {...register("seoTitle")} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">SEO description</label>
          <textarea className="textarea" {...register("seoDescription")} style={{ minHeight: 70 }} />
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create service"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => router.push("/admin/services")}>
          Cancel
        </Btn>
      </div>
    </form>
    </LivePreview>
  );
}

// Sub-component for a pricing tier (so we can use useFieldArray on tier.features)
type FormControl = ReturnType<typeof useForm<Values>>["control"];
type FormRegister = ReturnType<typeof useForm<Values>>["register"];

function TierEditor({
  tierIdx,
  register,
  control,
  onRemove,
}: {
  tierIdx: number;
  register: FormRegister;
  control: FormControl;
  onRemove: () => void;
}) {
  const featuresArr = useFieldArray({ control, name: `pricingTiers.${tierIdx}.features` });
  return (
    <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, padding: 14 }}>
      <div className="admin-form-row" style={{ alignItems: "end" }}>
        <div className="field">
          <label className="field__label">Tier name</label>
          <input className="input" {...register(`pricingTiers.${tierIdx}.name` as const)} />
        </div>
        <div className="field">
          <label className="field__label">Price</label>
          <input className="input" {...register(`pricingTiers.${tierIdx}.price` as const)} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <label className="admin-form-checkbox">
          <input type="checkbox" {...register(`pricingTiers.${tierIdx}.popular` as const)} />
          Mark as popular
        </label>
        <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={onRemove}>
          <Icon name="x" size={12} /> Remove tier
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="field__label" style={{ marginBottom: 6 }}>Features</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {featuresArr.fields.map((f, fi) => (
            <div key={f.id} style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="Tier feature"
                {...register(`pricingTiers.${tierIdx}.features.${fi}.value` as const)}
              />
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => featuresArr.remove(fi)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <Btn size="sm" type="button" variant="ghost" onClick={() => featuresArr.append({ value: "" })}>
            <Icon name="plus" size={12} /> Add feature
          </Btn>
        </div>
      </div>
    </div>
  );
}
