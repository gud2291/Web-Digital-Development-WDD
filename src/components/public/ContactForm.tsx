"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Icon } from "@/components/Icon";
import { Btn } from "@/components/ui";
import { FloatingInput } from "@/components/public/FloatingInput";
import { FloatingTextarea } from "@/components/public/FloatingTextarea";
import { FloatingSelect } from "@/components/public/FloatingSelect";
import { siteConfig } from "@/config/site";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone").max(30),
  service: z.string().max(120),
  message: z.string().min(10, "Tell us a bit more (10+ chars)").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  services: string[];
}

export function ContactForm({ services }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: services[0] ?? "",
      message: "",
    },
  });

  // Pre-fill support for deep links / other components (§13.1).
  React.useEffect(() => {
    const onPrefill = (e: Event) => {
      const detail = (e as CustomEvent<{ service?: string; message?: string }>).detail;
      if (!detail) return;
      if (detail.service && services.includes(detail.service)) setValue("service", detail.service);
      if (detail.message) setValue("message", detail.message, { shouldValidate: true });
    };
    window.addEventListener("wdd:prefill-contact", onPrefill as EventListener);
    return () => window.removeEventListener("wdd:prefill-contact", onPrefill as EventListener);
  }, [setValue, services]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send. Try again.");
      }
      toast.success("Message sent — we'll be in touch within 4 business hours.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="card contact-form" style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <h2 className="t-h3" style={{ marginTop: 16 }}>Message Sent</h2>
        <p style={{ marginTop: 10, color: "#475569" }}>
          Thanks for reaching out. A confirmation has been sent to your inbox — we&apos;ll reply
          within 4 business hours.
        </p>
        <Btn variant="outline" onClick={() => reset()} style={{ marginTop: 18 }}>
          Send another
        </Btn>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card contact-form" noValidate>
      <h2 className="t-h3" style={{ fontSize: 24 }}>Send us a message</h2>
      <p className="t-small" style={{ marginTop: 6 }}>Required fields marked *</p>
      <div className="contact-form__fields" style={{ marginTop: 20 }}>
        <FloatingInput label="Your Name *" error={errors.name?.message} {...register("name")} />
        <FloatingInput label="Phone *" inputMode="tel" error={errors.phone?.message} {...register("phone")} />
        <div style={{ gridColumn: "1 / -1" }}>
          <FloatingInput label="Email *" type="email" error={errors.email?.message} {...register("email")} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FloatingSelect label="Service Required" options={services} {...register("service")} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FloatingTextarea label="Your Message *" rows={5} error={errors.message?.message} {...register("message")} />
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn
          size="lg"
          iconRight="arrowRight"
          style={{ width: "100%" }}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </Btn>
      </div>
      <div className="t-small" style={{ textAlign: "center", marginTop: 12 }}>
        or{" "}
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#22C55E", fontWeight: 600 }}
        >
          <Icon name="whatsapp" size={12} /> Chat on WhatsApp
        </a>
      </div>
    </form>
  );
}
