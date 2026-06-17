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
  name: z.string().min(2).max(120),
  designation: z.string().default(""),
  photo: z.string().default(""),
  photoAlt: z.string().default(""),
  bio: z.string().default(""),
  linkedinUrl: z.string().default(""),
  visible: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

interface InitialDoc {
  _id?: string;
  name?: string;
  designation?: string;
  photo?: string;
  photoAlt?: string;
  bio?: string;
  linkedinUrl?: string;
  visible?: boolean;
}

export function TeamForm({ initial }: { initial?: InitialDoc }) {
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
      name: initial?.name ?? "",
      designation: initial?.designation ?? "",
      photo: initial?.photo ?? "",
      photoAlt: initial?.photoAlt ?? "",
      bio: initial?.bio ?? "",
      linkedinUrl: initial?.linkedinUrl ?? "",
      visible: initial?.visible ?? true,
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      if (isEdit) {
        await adminApi.put(`/api/admin/team/${initial!._id}`, values);
        toast.success("Member updated");
      } else {
        await adminApi.post("/api/admin/team", values);
        toast.success("Member added");
      }
      router.push("/admin/team");
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
            <label className="field__label">Name</label>
            <input className="input" {...register("name")} />
            {errors.name && <span className="admin-form-err">{errors.name.message}</span>}
          </div>
          <div className="field">
            <label className="field__label">Designation</label>
            <input className="input" {...register("designation")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">Bio</label>
          <textarea className="textarea" {...register("bio")} style={{ minHeight: 100 }} />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field__label">LinkedIn URL</label>
          <input className="input" {...register("linkedinUrl")} />
        </div>
        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <div style={{ marginTop: 14 }}>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                label="Photo"
                altValue={watch("photoAlt")}
                onAltChange={(alt) => setValue("photoAlt", alt)}
              />
            </div>
          )}
        />
        <div className="admin-form-row" style={{ marginTop: 14 }}>
          <label className="admin-form-checkbox" style={{ alignSelf: "end", paddingBottom: 10 }}>
            <input type="checkbox" {...register("visible")} /> Visible
          </label>
        </div>
      </div>

      <div className="admin-form-actions">
        <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add member"}
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => router.push("/admin/team")}>
          Cancel
        </Btn>
      </div>
    </form>
  );
}
