"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon } from "@/components/Icon";
import { Eyebrow } from "@/components/ui";

/**
 * Newsletter signup (CLAUDE.md §14.7). POSTs to /api/public/newsletter (which
 * stores the subscriber + sends a Resend welcome email). On success the form is
 * replaced with a confirmation. `compact` is the footer variant; `card` is the
 * full-width post-blog variant.
 */
const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export function NewsletterSignup({ variant = "card", source = "footer" }: { variant?: "card" | "compact"; source?: string }) {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (values: Values) => {
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, source }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setDone(true); // fail soft — still thank the user (record may be queued)
    }
  };

  const compact = variant === "compact";

  if (done) {
    return (
      <div className={compact ? "newsletter newsletter--compact" : "card newsletter newsletter--card"}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: compact ? "#fff" : "#16A34A" }}>
          <Icon name="check" size={16} stroke={3} />
          <span style={{ fontWeight: 600 }}>Thanks! Check your inbox to confirm.</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={compact ? "newsletter newsletter--compact" : "card newsletter newsletter--card"}
      noValidate
    >
      {!compact && (
        <>
          <Eyebrow>STAY IN THE LOOP</Eyebrow>
          <h3 className="t-h3" style={{ fontSize: 24, marginTop: 6 }}>Get our best writing on websites &amp; SEO</h3>
          <p className="t-small" style={{ marginTop: 8, marginBottom: 16 }}>
            Plain-English tips for growing a small business online. No spam, unsubscribe anytime.
          </p>
        </>
      )}
      {compact && <h5 className="newsletter__heading">Newsletter</h5>}
      <div className="newsletter__row">
        <input
          type="email"
          className="newsletter__input"
          placeholder="you@business.com"
          aria-label="Email address"
          {...register("email")}
        />
        <button type="submit" className="newsletter__btn" disabled={isSubmitting}>
          {isSubmitting ? "…" : compact ? <Icon name="arrowRight" size={16} /> : "Subscribe"}
        </button>
      </div>
      {errors.email && (
        <span className="newsletter__err">{errors.email.message}</span>
      )}
    </form>
  );
}
