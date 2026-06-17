"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { LivePreview } from "@/components/admin/LivePreview";
import { adminApi } from "@/lib/adminApi";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lowercase, numbers, dashes"),
  excerpt: z.string().max(300).optional().default(""),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional().default(""),
  featuredImageAlt: z.string().optional().default(""),
  author: z.string().default("Web Digital Development Team"),
  category: z.string().default("General"),
  tags: z.string().default(""),
  readTime: z.coerce.number().int().min(1).max(120).default(5),
  published: z.boolean().default(false),
  seoTitle: z.string().max(120).optional().default(""),
  seoDescription: z.string().max(200).optional().default(""),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  published?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

interface Props {
  initial?: InitialDoc;
}

export function BlogForm({ initial }: Props) {
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
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      featuredImage: initial?.featuredImage ?? "",
      featuredImageAlt: initial?.featuredImageAlt ?? "",
      author: initial?.author ?? "Web Digital Development Team",
      category: initial?.category ?? "General",
      tags: (initial?.tags ?? []).join(", "),
      readTime: initial?.readTime ?? 5,
      published: initial?.published ?? false,
      seoTitle: initial?.seoTitle ?? "",
      seoDescription: initial?.seoDescription ?? "",
    },
  });

  const title = watch("title");
  React.useEffect(() => {
    if (!isEdit && title) {
      setValue("slug", slugify(title), { shouldDirty: false });
    }
  }, [title, isEdit, setValue]);

  const liveValues = watch();

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await adminApi.put(`/api/admin/blog/${initial!._id}`, payload);
        toast.success("Post updated");
      } else {
        await adminApi.post("/api/admin/blog", payload);
        toast.success("Post created");
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <LivePreview
      resource="blog"
      previewPath={`/blog/${liveValues.slug || "preview"}`}
      state={{ ...liveValues, tags: (liveValues.tags || "").split(",").map((t) => t.trim()).filter(Boolean) }}
    >
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <h3>Content</h3>
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
          <label className="field__label">Excerpt</label>
          <textarea className="textarea" {...register("excerpt")} style={{ minHeight: 80 }} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Body</label>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <TipTapEditor value={field.value} onChange={field.onChange} placeholder="Write the article…" />
            )}
          />
          {errors.content && <span className="admin-form-err">{errors.content.message}</span>}
        </div>
      </div>

      <div className="admin-form-section">
        <h3>Meta</h3>
        <Controller
          control={control}
          name="featuredImage"
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              label="Featured image"
              altValue={watch("featuredImageAlt")}
              onAltChange={(alt) => setValue("featuredImageAlt", alt)}
            />
          )}
        />
        <div className="admin-form-row admin-form-row--3" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Author</label>
            <input className="input" {...register("author")} />
          </div>
          <div className="field">
            <label className="field__label">Category</label>
            <input className="input" {...register("category")} />
          </div>
          <div className="field">
            <label className="field__label">Read time (min)</label>
            <input className="input" type="number" min={1} max={120} {...register("readTime")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Tags (comma-separated)</label>
          <input className="input" {...register("tags")} />
        </div>
        <label className="admin-form-checkbox" style={{ marginTop: 14 }}>
          <input type="checkbox" {...register("published")} />
          <span>Published</span>
        </label>
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
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Btn>
      </div>
    </form>
    </LivePreview>
  );
}
