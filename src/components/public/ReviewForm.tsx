"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Btn, Stars } from "@/components/ui";
import { HoneypotField, useSpamShield } from "@/components/public/SpamShield";

const reviewSchema = z.object({
  clientName: z.string().min(2).max(120),
  clientCompany: z.string().max(120).default(""),
  message: z.string().min(10, "Tell us a bit more").max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const { withShield, honeypotRef } = useSpamShield();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { clientName: "", clientCompany: "", message: "", rating: 5 },
  });
  const [submitted, setSubmitted] = React.useState(false);
  const rating = watch("rating");

  const onSubmit = async (values: ReviewValues) => {
    try {
      const res = await fetch("/api/public/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withShield(values)),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not submit review");
      }
      toast.success("Thanks! Your review is pending approval.");
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
  };

  if (submitted) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>🙏</div>
        <h4 className="t-h4" style={{ marginTop: 10 }}>Thanks for the review</h4>
        <p className="t-small" style={{ marginTop: 6 }}>
          We&apos;ll publish it after a quick review.
        </p>
        <Btn variant="outline" size="sm" onClick={() => setSubmitted(false)} style={{ marginTop: 14 }}>
          Submit another
        </Btn>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ padding: 22 }} noValidate>
      <HoneypotField ref={honeypotRef} />
      <h2 className="t-h4">Write a review</h2>
      <div className="field" style={{ marginTop: 14 }}>
        <label className="field__label">Your Name *</label>
        <input className="input" placeholder="Rahul Sharma" {...register("clientName")} />
        {errors.clientName && (
          <span className="t-small" style={{ color: "#DC2626" }}>{errors.clientName.message}</span>
        )}
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label className="field__label">Company (optional)</label>
        <input className="input" placeholder="Acme Pvt Ltd" {...register("clientCompany")} />
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label className="field__label">Rating *</label>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue("rating", n, { shouldValidate: true })}
              style={{ background: "transparent", border: 0, cursor: "pointer", padding: 4 }}
              aria-label={`${n} stars`}
            >
              <Stars value={n <= rating ? 5 : 0} size={20} />
            </button>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label className="field__label">Your Review *</label>
        <textarea
          className="textarea"
          placeholder="Tell us about your experience working with us…"
          style={{ minHeight: 100 }}
          {...register("message")}
        />
        {errors.message && (
          <span className="t-small" style={{ color: "#DC2626" }}>{errors.message.message}</span>
        )}
      </div>
      <Btn
        size="lg"
        iconRight="arrowRight"
        style={{ width: "100%", marginTop: 14 }}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting…" : "Submit Review"}
      </Btn>
    </form>
  );
}
