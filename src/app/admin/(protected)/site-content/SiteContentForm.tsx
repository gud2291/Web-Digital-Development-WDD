"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { SortableList } from "@/components/admin/SortableList";
import { applyFieldReorder } from "@/components/admin/reorderFieldArray";
import { LivePreview } from "@/components/admin/LivePreview";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminApi } from "@/lib/adminApi";

const navLink = z.object({ label: z.string().min(1), href: z.string().min(1) });

const schema = z.object({
  about: z.object({
    heroImage: z.string().default(""),
    heading: z.string().default(""),
    description: z.string().default(""),
    whyChooseUs: z.array(z.object({ value: z.string().min(1) })).default([]),
    timeline: z
      .array(z.object({ year: z.string().default(""), title: z.string().default(""), description: z.string().default("") }))
      .default([]),
    founderName: z.string().default(""),
    founderTitle: z.string().default(""),
    founderPhoto: z.string().default(""),
    founderPhotoAlt: z.string().default(""),
    founderNote: z.string().default(""),
    mission: z.string().default(""),
    vision: z.string().default(""),
    founderHighlights: z.array(z.object({ value: z.string().default(""), label: z.string().default("") })).default([]),
  }),
  contactPage: z.object({
    mapEmbedUrl: z.string().default(""),
    descText: z.string().default(""),
    budgetRanges: z.array(z.object({ value: z.string().min(1) })).default([]),
    quickPromises: z.array(z.object({ value: z.string().min(1) })).default([]),
  }),
  navLinks: z.object({
    header: z.array(navLink).default([]),
    footerQuick: z.array(navLink).default([]),
    footerServices: z.array(navLink).default([]),
  }),
  footer: z.object({
    tagline: z.string().default(""),
    copyright: z.string().default(""),
    policyLinks: z.array(navLink).default([]),
  }),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  about?: {
    heroImage?: string;
    heading?: string;
    description?: string;
    whyChooseUs?: string[];
    timeline?: { year?: string; title?: string; description?: string }[];
    founderName?: string;
    founderTitle?: string;
    founderPhoto?: string;
    founderPhotoAlt?: string;
    founderNote?: string;
    mission?: string;
    vision?: string;
    founderHighlights?: { value?: string; label?: string }[];
  };
  contactPage?: {
    mapEmbedUrl?: string;
    descText?: string;
    budgetRanges?: string[];
    quickPromises?: string[];
  };
  navLinks?: {
    header?: { label: string; href: string }[];
    footerQuick?: { label: string; href: string }[];
    footerServices?: { label: string; href: string }[];
  };
  footer?: {
    tagline?: string;
    copyright?: string;
    policyLinks?: { label: string; href: string }[];
  };
}

export function SiteContentForm({ initial }: { initial: InitialDoc }) {
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
      about: {
        heroImage: initial.about?.heroImage ?? "",
        heading: initial.about?.heading ?? "",
        description: initial.about?.description ?? "",
        whyChooseUs: (initial.about?.whyChooseUs ?? []).map((v) => ({ value: v })),
        timeline: (initial.about?.timeline ?? []).map((t) => ({
          year: t.year ?? "",
          title: t.title ?? "",
          description: t.description ?? "",
        })),
        founderName: initial.about?.founderName ?? "",
        founderTitle: initial.about?.founderTitle ?? "",
        founderPhoto: initial.about?.founderPhoto ?? "",
        founderPhotoAlt: initial.about?.founderPhotoAlt ?? "",
        founderNote: initial.about?.founderNote ?? "",
        mission: initial.about?.mission ?? "",
        vision: initial.about?.vision ?? "",
        founderHighlights: (initial.about?.founderHighlights ?? []).map((h) => ({
          value: h.value ?? "",
          label: h.label ?? "",
        })),
      },
      contactPage: {
        mapEmbedUrl: initial.contactPage?.mapEmbedUrl ?? "",
        descText: initial.contactPage?.descText ?? "",
        budgetRanges: (initial.contactPage?.budgetRanges ?? []).map((v) => ({ value: v })),
        quickPromises: (initial.contactPage?.quickPromises ?? []).map((v) => ({ value: v })),
      },
      navLinks: {
        header: initial.navLinks?.header ?? [],
        footerQuick: initial.navLinks?.footerQuick ?? [],
        footerServices: initial.navLinks?.footerServices ?? [],
      },
      footer: {
        tagline: initial.footer?.tagline ?? "",
        copyright: initial.footer?.copyright ?? "",
        policyLinks: initial.footer?.policyLinks ?? [],
      },
    },
  });

  const whyArr = useFieldArray({ control, name: "about.whyChooseUs" });
  const timelineArr = useFieldArray({ control, name: "about.timeline" });
  const founderHighlightsArr = useFieldArray({ control, name: "about.founderHighlights" });
  const budgetArr = useFieldArray({ control, name: "contactPage.budgetRanges" });
  const promisesArr = useFieldArray({ control, name: "contactPage.quickPromises" });
  const headerArr = useFieldArray({ control, name: "navLinks.header" });
  const footerQuickArr = useFieldArray({ control, name: "navLinks.footerQuick" });
  const footerSvcArr = useFieldArray({ control, name: "navLinks.footerServices" });
  const policyArr = useFieldArray({ control, name: "footer.policyLinks" });

  const toPayload = (values: Values) => ({
    about: {
      ...values.about,
      whyChooseUs: values.about.whyChooseUs.map((v) => v.value),
    },
    contactPage: {
      ...values.contactPage,
      budgetRanges: values.contactPage.budgetRanges.map((v) => v.value),
      quickPromises: values.contactPage.quickPromises.map((v) => v.value),
    },
    navLinks: values.navLinks,
    footer: values.footer,
  });

  const liveValues = watch();

  const onSubmit = async (values: Values) => {
    const payload = toPayload(values);
    try {
      await adminApi.put("/api/admin/site-content", payload);
      toast.success("Saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <LivePreview resource="site-content" previewPath="/about" state={toPayload(liveValues)}>
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <h3>About section</h3>
        <ImageUploader
          label="Hero Image"
          value={watch("about.heroImage")}
          onChange={(url) => register("about.heroImage").onChange({ target: { value: url, name: "about.heroImage" } })}
        />
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Heading</label>
          <input className="input" {...register("about.heading")} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Description</label>
          <textarea className="textarea" {...register("about.description")} style={{ minHeight: 110 }} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="field__label" style={{ marginBottom: 6 }}>Why choose us (one per line)</div>
          {whyArr.fields.map((f, i) => (
            <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input className="input" {...register(`about.whyChooseUs.${i}.value` as const)} />
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => whyArr.remove(i)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 8 }} onClick={() => whyArr.append({ value: "" })}>
            <Icon name="plus" size={12} /> Add
          </Btn>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="field__label" style={{ marginBottom: 6 }}>Timeline</div>
          {timelineArr.fields.map((f, i) => (
            <div key={f.id} style={{ border: "1px solid var(--c-border)", borderRadius: 10, padding: 12, marginTop: 6 }}>
              <div className="admin-form-row admin-form-row--3">
                <input className="input" placeholder="Year" {...register(`about.timeline.${i}.year` as const)} />
                <input className="input" placeholder="Title" {...register(`about.timeline.${i}.title` as const)} />
                <button type="button" className="admin-icon-btn admin-icon-btn--danger" style={{ alignSelf: "start" }} onClick={() => timelineArr.remove(i)}>
                  <Icon name="x" size={12} />
                </button>
              </div>
              <textarea className="textarea" placeholder="Description" style={{ marginTop: 8, minHeight: 60 }} {...register(`about.timeline.${i}.description` as const)} />
            </div>
          ))}
          <Btn
            size="sm"
            type="button"
            variant="secondary"
            style={{ marginTop: 8 }}
            onClick={() => timelineArr.append({ year: "", title: "", description: "" })}
          >
            <Icon name="plus" size={12} /> Add timeline item
          </Btn>
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Founder &amp; CEO</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Founder name</label>
            <input className="input" placeholder="Gudia Yadav" {...register("about.founderName")} />
          </div>
          <div className="field">
            <label className="field__label">Founder title</label>
            <input className="input" placeholder="Founder & CEO" {...register("about.founderTitle")} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <ImageUploader
            label="Founder photo"
            value={watch("about.founderPhoto")}
            onChange={(url) => register("about.founderPhoto").onChange({ target: { value: url, name: "about.founderPhoto" } })}
            altValue={watch("about.founderPhotoAlt")}
            onAltChange={(alt) => register("about.founderPhotoAlt").onChange({ target: { value: alt, name: "about.founderPhotoAlt" } })}
          />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Short note (a few sentences)</label>
          <textarea className="textarea" {...register("about.founderNote")} style={{ minHeight: 90 }} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Mission</label>
          <textarea className="textarea" {...register("about.mission")} style={{ minHeight: 80 }} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Vision</label>
          <textarea className="textarea" {...register("about.vision")} style={{ minHeight: 80 }} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="field__label" style={{ marginBottom: 6 }}>
            Highlights (3 short stats, e.g. &quot;150+ — Projects shipped&quot;)
          </div>
          {founderHighlightsArr.fields.map((f, i) => (
            <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                className="input"
                placeholder="Value (e.g. 150+)"
                style={{ maxWidth: 160 }}
                {...register(`about.founderHighlights.${i}.value` as const)}
              />
              <input
                className="input"
                placeholder="Label (e.g. Projects shipped)"
                {...register(`about.founderHighlights.${i}.label` as const)}
              />
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => founderHighlightsArr.remove(i)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          <Btn
            size="sm"
            type="button"
            variant="secondary"
            style={{ marginTop: 8 }}
            onClick={() => founderHighlightsArr.append({ value: "", label: "" })}
          >
            <Icon name="plus" size={12} /> Add highlight
          </Btn>
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Contact page</h3>
        <div className="field">
          <label className="field__label">Map embed URL</label>
          <input className="input" {...register("contactPage.mapEmbedUrl")} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Hero text</label>
          <textarea className="textarea" {...register("contactPage.descText")} style={{ minHeight: 80 }} />
        </div>
        <ListEditor
          title="Budget ranges"
          fields={budgetArr.fields}
          register={(i) => register(`contactPage.budgetRanges.${i}.value` as const)}
          onRemove={budgetArr.remove}
          onAdd={() => budgetArr.append({ value: "" })}
        />
        <ListEditor
          title="Quick promises (Title — Description)"
          fields={promisesArr.fields}
          register={(i) => register(`contactPage.quickPromises.${i}.value` as const)}
          onRemove={promisesArr.remove}
          onAdd={() => promisesArr.append({ value: "" })}
        />
      </div>

      <div className="admin-form-section">
        <h3>Navigation</h3>
        <NavGroup title="Header links" fields={headerArr.fields} register={register} prefix="navLinks.header" onRemove={headerArr.remove} onAdd={() => headerArr.append({ label: "", href: "" })} onReorder={(ids) => applyFieldReorder(ids, headerArr.fields.map((f) => f.id), watch("navLinks.header") ?? [], headerArr.replace)} />
        <NavGroup title="Footer — Quick links" fields={footerQuickArr.fields} register={register} prefix="navLinks.footerQuick" onRemove={footerQuickArr.remove} onAdd={() => footerQuickArr.append({ label: "", href: "" })} onReorder={(ids) => applyFieldReorder(ids, footerQuickArr.fields.map((f) => f.id), watch("navLinks.footerQuick") ?? [], footerQuickArr.replace)} />
        <NavGroup title="Footer — Services links" fields={footerSvcArr.fields} register={register} prefix="navLinks.footerServices" onRemove={footerSvcArr.remove} onAdd={() => footerSvcArr.append({ label: "", href: "" })} onReorder={(ids) => applyFieldReorder(ids, footerSvcArr.fields.map((f) => f.id), watch("navLinks.footerServices") ?? [], footerSvcArr.replace)} />
      </div>

      <div className="admin-form-section">
        <h3>Footer</h3>
        <div className="field">
          <label className="field__label">Tagline</label>
          <input className="input" {...register("footer.tagline")} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Copyright text</label>
          <input className="input" {...register("footer.copyright")} />
        </div>
        <NavGroup title="Policy links" fields={policyArr.fields} register={register} prefix="footer.policyLinks" onRemove={policyArr.remove} onAdd={() => policyArr.append({ label: "", href: "" })} onReorder={(ids) => applyFieldReorder(ids, policyArr.fields.map((f) => f.id), watch("footer.policyLinks") ?? [], policyArr.replace)} />
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save site content"}
        </Btn>
      </div>
    </form>
    </LivePreview>
  );
}

function ListEditor({
  title,
  fields,
  register,
  onRemove,
  onAdd,
}: {
  title: string;
  fields: { id: string }[];
  register: (i: number) => ReturnType<ReturnType<typeof useForm>["register"]>;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div className="field__label" style={{ marginBottom: 6 }}>{title}</div>
      {fields.map((f, i) => (
        <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input className="input" {...register(i)} />
          <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => onRemove(i)}>
            <Icon name="x" size={12} />
          </button>
        </div>
      ))}
      <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 8 }} onClick={onAdd}>
        <Icon name="plus" size={12} /> Add
      </Btn>
    </div>
  );
}

function NavGroup<TName extends string>({
  title,
  fields,
  register,
  prefix,
  onRemove,
  onAdd,
  onReorder,
}: {
  title: string;
  fields: { id: string }[];
  register: ReturnType<typeof useForm<Values>>["register"];
  prefix: TName;
  onRemove: (i: number) => void;
  onAdd: () => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div className="field__label" style={{ marginBottom: 6 }}>{title}</div>
      <SortableList
        items={fields}
        getId={(f) => f.id}
        onReorder={onReorder}
        empty={<div className="t-small">No links yet.</div>}
        render={(_f, i) => (
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <input
              className="input"
              placeholder="Label"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(register as any)(`${prefix}.${i}.label`)}
            />
            <input
              className="input"
              placeholder="/path or URL"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(register as any)(`${prefix}.${i}.href`)}
            />
            <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => onRemove(i)}>
              <Icon name="x" size={12} />
            </button>
          </div>
        )}
      />
      <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 8 }} onClick={onAdd}>
        <Icon name="plus" size={12} /> Add link
      </Btn>
    </div>
  );
}
