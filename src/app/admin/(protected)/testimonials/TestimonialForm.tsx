"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminApi } from "@/lib/adminApi";

const schema = z.object({
  clientName: z.string().min(2).max(120),
  clientCompany: z.string().default(""),
  clientPhoto: z.string().default(""),
  message: z.string().min(10).max(1000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  visible: z.boolean().default(true),
  adminHearted: z.boolean().default(false),
  source: z.enum(["google", "manual"]).default("manual"),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  _id?: string;
  clientName?: string;
  clientCompany?: string;
  clientPhoto?: string;
  message?: string;
  rating?: number;
  visible?: boolean;
  adminHearted?: boolean;
  source?: "google" | "manual";
}

export function TestimonialForm({ initial }: { initial?: InitialDoc }) {
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
      clientName: initial?.clientName ?? "",
      clientCompany: initial?.clientCompany ?? "",
      clientPhoto: initial?.clientPhoto ?? "",
      message: initial?.message ?? "",
      rating: initial?.rating ?? 5,
      visible: initial?.visible ?? true,
      adminHearted: !!initial?.adminHearted,
      source: initial?.source ?? "manual",
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      if (isEdit) {
        await adminApi.put(`/api/admin/testimonials/${initial!._id}`, values);
        toast.success("Updated");
      } else {
        await adminApi.post("/api/admin/testimonials", values);
        toast.success("Added");
      }
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
      <div className="admin-form-section">
        <div className="admin-form-row">
          <div className="field">
            <label className="field__label">Client name</label>
            <input className="input" {...register("clientName")} />
            {errors.clientName && <span className="admin-form-err">{errors.clientName.message}</span>}
          </div>
          <div className="field">
            <label className="field__label">Company</label>
            <input className="input" {...register("clientCompany")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Message</label>
          <textarea className="textarea" {...register("message")} style={{ minHeight: 120 }} />
          {errors.message && <span className="admin-form-err">{errors.message.message}</span>}
        </div>
        <Controller
          control={control}
          name="clientPhoto"
          render={({ field }) => (
            <div style={{ marginTop: 14 }}>
              <ImageUploader value={field.value} onChange={field.onChange} label="Client photo" />
            </div>
          )}
        />
        <div className="admin-form-row admin-form-row--3" style={{ marginTop: 14 }}>
          <div className="field">
            <label className="field__label">Rating</label>
            <select className="select" {...register("rating")}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} stars</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Source</label>
            <select className="select" {...register("source")}>
              <option value="manual">Manual</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 20 }}>
          <label className="admin-form-checkbox">
            <input type="checkbox" {...register("visible")} /> Visible on site
          </label>
          <label className="admin-form-checkbox">
            <input type="checkbox" {...register("adminHearted")} /> Mark as featured ❤
          </label>
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add testimonial"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => router.push("/admin/testimonials")}>
          Cancel
        </Btn>
      </div>
    </form>
  );
}
