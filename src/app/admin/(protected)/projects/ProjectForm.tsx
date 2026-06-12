"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminApi } from "@/lib/adminApi";

const schema = z.object({
  title: z.string().min(2).max(200),
  category: z.string().default("Web"),
  description: z.string().default(""),
  image: z.string().default(""),
  liveUrl: z.string().default(""),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  tech: z.string().default(""),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  _id?: string;
  title?: string;
  category?: string;
  description?: string;
  image?: string;
  liveUrl?: string;
  featured?: boolean;
  visible?: boolean;
  tech?: string[];
}

export function ProjectForm({ initial }: { initial?: InitialDoc }) {
  const router = useRouter();
  const isEdit = !!initial?._id;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      category: initial?.category ?? "Web",
      description: initial?.description ?? "",
      image: initial?.image ?? "",
      liveUrl: initial?.liveUrl ?? "",
      featured: !!initial?.featured,
      visible: initial?.visible ?? true,
      tech: (initial?.tech ?? []).join(", "),
    },
  });

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      tech: values.tech.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await adminApi.put(`/api/admin/projects/${initial!._id}`, payload);
        toast.success("Project updated");
      } else {
        await adminApi.post("/api/admin/projects", payload);
        toast.success("Project created");
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <h3>Project details</h3>
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Title</label>
            <input className="input" {...register("title")} />
            {errors.title && <span className="admin-form-err">{errors.title.message}</span>}
          </div>
          <div className="field">
            <label className="field__label">Category</label>
            <input className="input" {...register("category")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Description</label>
          <textarea className="textarea" {...register("description")} style={{ minHeight: 100 }} />
        </div>
        <div className="admin-form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Live URL</label>
            <input className="input" placeholder="https://…" {...register("liveUrl")} />
          </div>
          <div className="field">
            <label className="field__label">Tech (comma-separated)</label>
            <input className="input" {...register("tech")} />
          </div>
        </div>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <div style={{ marginTop: 14 }}>
              <ImageUploader value={field.value} onChange={field.onChange} label="Cover image" />
            </div>
          )}
        />
        <div className="admin-form-row" style={{ marginTop: 14 }}>
          <label className="admin-form-checkbox" style={{ alignSelf: "end", paddingBottom: 10 }}>
            <input type="checkbox" {...register("featured")} /> Featured
          </label>
          <label className="admin-form-checkbox" style={{ alignSelf: "end", paddingBottom: 10 }}>
            <input type="checkbox" {...register("visible")} /> Visible
          </label>
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Btn>
      </div>
    </form>
  );
}
