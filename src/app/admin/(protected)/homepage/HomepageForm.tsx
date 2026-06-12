"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SortableList } from "@/components/admin/SortableList";
import { applyFieldReorder } from "@/components/admin/reorderFieldArray";
import { LivePreview } from "@/components/admin/LivePreview";
import { adminApi } from "@/lib/adminApi";

const schema = z.object({
  heroSlides: z
    .array(
      z.object({
        type: z.enum(["image", "video"]).default("image"),
        image: z.string().default(""),
        video: z.string().default(""),
        title: z.string().default(""),
        subtitle: z.string().default(""),
        ctaText: z.string().default(""),
        ctaUrl: z.string().default(""),
      })
    )
    .default([]),
  stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).default([]),
  clientLogos: z
    .array(z.object({ name: z.string().min(1), image: z.string().min(1), visible: z.boolean().default(true) }))
    .default([]),
  ctaBanner: z.object({ title: z.string().default(""), sub: z.string().default("") }).default({ title: "", sub: "" }),
  sectionTitles: z
    .object({
      portfolio: z.string().default("Our Portfolio"),
      services: z.string().default("Our Services"),
      testimonials: z.string().default("Client Love"),
      badge: z.string().default(""),
    })
    .default({ portfolio: "Our Portfolio", services: "Our Services", testimonials: "Client Love", badge: "" }),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  heroSlides?: Values["heroSlides"];
  stats?: Values["stats"];
  clientLogos?: Values["clientLogos"];
  ctaBanner?: Values["ctaBanner"];
  sectionTitles?: Values["sectionTitles"];
}

/**
 * §3 — "edit the website, not a form". Sections appear in the SAME order as the
 * public homepage; each card holds all of its content. Clicking into a section
 * scrolls + highlights it in the live preview pane.
 */
export function HomepageForm({ initial }: { initial: InitialDoc }) {
  const router = useRouter();
  const [anchor, setAnchor] = React.useState<string | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      heroSlides: initial.heroSlides ?? [],
      stats: initial.stats ?? [],
      clientLogos: initial.clientLogos ?? [],
      ctaBanner: initial.ctaBanner ?? { title: "", sub: "" },
      sectionTitles: initial.sectionTitles ?? {
        portfolio: "Our Portfolio",
        services: "Our Services",
        testimonials: "Client Love",
        badge: "",
      },
    },
  });

  const heroArr = useFieldArray({ control, name: "heroSlides" });
  const statsArr = useFieldArray({ control, name: "stats" });
  const logosArr = useFieldArray({ control, name: "clientLogos" });
  const liveValues = watch();
  const heroValues = watch("heroSlides");

  const onSubmit = async (values: Values) => {
    try {
      await adminApi.put("/api/admin/homepage", values);
      toast.success("Homepage saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <LivePreview resource="homepage" previewPath="/" state={liveValues} sectionAnchor={anchor}>
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      {/* 1 ── HERO SLIDER */}
      <SectionCard
        n={1}
        title="Hero Slider"
        hint="The big rotating banner at the top of the homepage."
        anchor="s-hero"
        onFocus={setAnchor}
        defaultOpen
      >
        <div className="field" style={{ marginBottom: 12 }}>
          <label className="field__label">Badge text (small pill above the headline)</label>
          <input className="input" placeholder="e.g. Available for new projects" {...register("sectionTitles.badge")} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SortableList
            items={heroArr.fields}
            getId={(s) => s.id}
            onReorder={(ids) => applyFieldReorder(ids, heroArr.fields.map((f) => f.id), watch("heroSlides") ?? [], heroArr.replace)}
            render={(_s, idx) => (
              <SlideCard
                idx={idx}
                thumb={heroValues?.[idx]?.image || ""}
                title={heroValues?.[idx]?.title || ""}
                onRemove={() => heroArr.remove(idx)}
              >
                <div className="admin-form-row">
                  <div className="field">
                    <label className="field__label">Headline (use **word** to highlight it in blue)</label>
                    <input className="input" {...register(`heroSlides.${idx}.title` as const)} />
                  </div>
                  <div className="field">
                    <label className="field__label">Background type</label>
                    <select className="select" {...register(`heroSlides.${idx}.type` as const)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label className="field__label">Supporting line</label>
                  <textarea className="textarea" style={{ minHeight: 64 }} {...register(`heroSlides.${idx}.subtitle` as const)} />
                </div>
                <Controller
                  control={control}
                  name={`heroSlides.${idx}.image` as const}
                  render={({ field }) => (
                    <div style={{ marginTop: 10 }}>
                      <ImageUploader value={field.value} onChange={field.onChange} label="Background image (also the video poster)" />
                    </div>
                  )}
                />
                {heroValues?.[idx]?.type === "video" ? (
                  <Controller
                    control={control}
                    name={`heroSlides.${idx}.video` as const}
                    render={({ field }) => (
                      <div style={{ marginTop: 10 }}>
                        <ImageUploader value={field.value} onChange={field.onChange} label="Background video" accept="video" />
                      </div>
                    )}
                  />
                ) : null}
                <div className="admin-form-row" style={{ marginTop: 10 }}>
                  <div className="field">
                    <label className="field__label">Button text</label>
                    <input className="input" placeholder="Get Free Consultation" {...register(`heroSlides.${idx}.ctaText` as const)} />
                  </div>
                  <div className="field">
                    <label className="field__label">Button link</label>
                    <input className="input" placeholder="/contact" {...register(`heroSlides.${idx}.ctaUrl` as const)} />
                  </div>
                </div>
              </SlideCard>
            )}
          />
          <Btn
            size="sm"
            type="button"
            variant="secondary"
            onClick={() =>
              heroArr.append({ type: "image", image: "", video: "", title: "", subtitle: "", ctaText: "", ctaUrl: "" })
            }
          >
            <Icon name="plus" size={12} /> Add Slide
          </Btn>
        </div>
      </SectionCard>

      {/* 2 ── TRUSTED-BY LOGOS */}
      <SectionCard
        n={2}
        title="Trusted-By Strip"
        hint="The scrolling client-name strip right under the hero."
        anchor="s-trust"
        onFocus={setAnchor}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SortableList
            items={logosArr.fields}
            getId={(f) => f.id}
            onReorder={(ids) => applyFieldReorder(ids, logosArr.fields.map((f) => f.id), watch("clientLogos") ?? [], logosArr.replace)}
            render={(_f, idx) => (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                  <input className="input" placeholder="Brand name" style={{ maxWidth: 240 }} {...register(`clientLogos.${idx}.name` as const)} />
                  <label className="admin-form-checkbox">
                    <input type="checkbox" {...register(`clientLogos.${idx}.visible` as const)} /> Visible
                  </label>
                  <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => logosArr.remove(idx)}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
                <Controller
                  control={control}
                  name={`clientLogos.${idx}.image` as const}
                  render={({ field }) => (
                    <ImageUploader value={field.value} onChange={field.onChange} label="Logo image" />
                  )}
                />
              </div>
            )}
          />
          <Btn size="sm" type="button" variant="secondary" onClick={() => logosArr.append({ name: "", image: "", visible: true })}>
            <Icon name="plus" size={12} /> Add logo
          </Btn>
        </div>
      </SectionCard>

      {/* 3 ── STATS */}
      <SectionCard
        n={3}
        title="Quick Stats"
        hint="The number tiles — e.g. 400+ Websites Delivered."
        anchor="s-stats"
        onFocus={setAnchor}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SortableList
            items={statsArr.fields}
            getId={(f) => f.id}
            onReorder={(ids) => applyFieldReorder(ids, statsArr.fields.map((f) => f.id), watch("stats") ?? [], statsArr.replace)}
            render={(_f, idx) => (
              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <input className="input" placeholder="Value (e.g. 400+)" style={{ maxWidth: 180 }} {...register(`stats.${idx}.value` as const)} />
                <input className="input" placeholder="Label" {...register(`stats.${idx}.label` as const)} />
                <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => statsArr.remove(idx)}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            )}
          />
          <Btn size="sm" type="button" variant="secondary" onClick={() => statsArr.append({ value: "", label: "" })}>
            <Icon name="plus" size={12} /> Add stat
          </Btn>
        </div>
      </SectionCard>

      {/* 4 ── ABOUT BLURB (edited in Site Content) */}
      <LinkCard
        n={4}
        title="About Blurb"
        hint="The studio story next to the photo — text lives in Site Content."
        href="/admin/site-content"
        anchor="s-about"
        onFocus={setAnchor}
      />

      {/* 5 ── SERVICES GRID */}
      <SectionCard
        n={5}
        title="Services Grid"
        hint="The six service cards. Cards themselves are managed in Services."
        anchor="s-services"
        onFocus={setAnchor}
      >
        <div className="field">
          <label className="field__label">Section heading</label>
          <input className="input" {...register("sectionTitles.services")} />
        </div>
        <EditElsewhere href="/admin/services" label="Manage service cards" />
      </SectionCard>

      {/* 6 ── PORTFOLIO */}
      <SectionCard
        n={6}
        title="Portfolio Slider"
        hint="The project carousel. Projects are managed in Projects."
        anchor="s-portfolio"
        onFocus={setAnchor}
      >
        <div className="field">
          <label className="field__label">Section heading</label>
          <input className="input" {...register("sectionTitles.portfolio")} />
        </div>
        <EditElsewhere href="/admin/projects" label="Manage projects" />
      </SectionCard>

      {/* 7 ── PROCESS (static) */}
      <LinkCard
        n={7}
        title="How We Work"
        hint="The 4-step process strip — fixed design, no editable content."
        anchor="s-process"
        onFocus={setAnchor}
      />

      {/* 8 ── REVIEWS */}
      <SectionCard
        n={8}
        title="Reviews"
        hint="The testimonial carousel. Reviews are managed in Testimonials."
        anchor="s-reviews"
        onFocus={setAnchor}
      >
        <div className="field">
          <label className="field__label">Section heading</label>
          <input className="input" {...register("sectionTitles.testimonials")} />
        </div>
        <EditElsewhere href="/admin/testimonials" label="Manage reviews" />
      </SectionCard>

      {/* 9 ── BLOG (edited in Blog Manager) */}
      <LinkCard
        n={9}
        title="Latest Insights"
        hint="Shows your three newest blog posts automatically."
        href="/admin/blog"
        anchor="s-blog"
        onFocus={setAnchor}
      />

      {/* 10 ── CTA BANNER */}
      <SectionCard
        n={10}
        title="Bottom Call-To-Action"
        hint="The blue banner at the end of the page."
        anchor="s-cta"
        onFocus={setAnchor}
      >
        <div className="field">
          <label className="field__label">Headline</label>
          <input className="input" {...register("ctaBanner.title")} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label className="field__label">Supporting line</label>
          <input className="input" {...register("ctaBanner.sub")} />
        </div>
      </SectionCard>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save homepage"}
        </Btn>
      </div>
    </form>
    </LivePreview>
  );
}

// ── Section card: one card per public-site section, in on-site order ────────
function SectionCard({
  n,
  title,
  hint,
  anchor,
  onFocus,
  defaultOpen,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  anchor: string;
  onFocus: (a: string) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div className="admin-form-section section-card" onFocusCapture={() => onFocus(anchor)}>
      <button
        type="button"
        className="section-card__head"
        onClick={() => {
          setOpen((v) => !v);
          onFocus(anchor);
        }}
      >
        <span className="section-card__num">{n}</span>
        <span className="section-card__titles">
          <strong>{title}</strong>
          <span className="t-small">{hint}</span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open ? <div style={{ marginTop: 14 }}>{children}</div> : null}
    </div>
  );
}

// ── Read-only section that's edited on another admin page ───────────────────
function LinkCard({
  n,
  title,
  hint,
  href,
  anchor,
  onFocus,
}: {
  n: number;
  title: string;
  hint: string;
  href?: string;
  anchor: string;
  onFocus: (a: string) => void;
}) {
  return (
    <div className="admin-form-section section-card section-card--link" onClick={() => onFocus(anchor)}>
      <div className="section-card__head" style={{ cursor: "default" }}>
        <span className="section-card__num">{n}</span>
        <span className="section-card__titles">
          <strong>{title}</strong>
          <span className="t-small">{hint}</span>
        </span>
        {href ? (
          <Link href={href} className="admin-icon-btn" onClick={(e) => e.stopPropagation()}>
            <ExternalLink size={13} /> Edit
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function EditElsewhere({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="admin-icon-btn" style={{ marginTop: 12, display: "inline-flex" }}>
      <ExternalLink size={13} /> {label}
    </Link>
  );
}

// ── Numbered, collapsible hero-slide card with thumbnail ─────────────────────
function SlideCard({
  idx,
  thumb,
  title,
  onRemove,
  children,
}: {
  idx: number;
  thumb: string;
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(idx === 0);
  return (
    <div className="slide-card" style={{ width: "100%" }}>
      <div className="slide-card__head">
        <button type="button" className="slide-card__toggle" onClick={() => setOpen((v) => !v)}>
          <span className="section-card__num">{idx + 1}</span>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="slide-card__thumb" />
          ) : (
            <span className="slide-card__thumb slide-card__thumb--empty" />
          )}
          <span className="slide-card__title">{title || `Slide ${idx + 1}`}</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={onRemove}>
          <Icon name="x" size={12} /> Delete
        </button>
      </div>
      {open ? <div style={{ marginTop: 12 }}>{children}</div> : null}
    </div>
  );
}
