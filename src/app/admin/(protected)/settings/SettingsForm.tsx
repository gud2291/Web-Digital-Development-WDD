"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApi } from "@/lib/adminApi";

const schema = z.object({
  business: z.object({
    phone: z.string().default(""),
    email: z.string().default(""),
    address: z.string().default(""),
    hoursWeek: z.string().default(""),
    hoursSunday: z.string().default(""),
  }),
  social: z.object({
    fb: z.string().default(""),
    tw: z.string().default(""),
    li: z.string().default(""),
    ig: z.string().default(""),
    yt: z.string().default(""),
  }),
  analytics: z.object({
    ga4: z.string().default(""),
    gtm: z.string().default(""),
    clarity: z.string().default(""),
  }),
  chatbot: z.object({
    name: z.string().default("Aria"),
    avatar: z.string().default(""),
    welcome: z.string().default(""),
    placeholder: z.string().default(""),
    quickActions: z.array(z.object({ label: z.string().min(1), payload: z.string().default("") })).default([]),
  }),
});

type Values = z.infer<typeof schema>;

const TABS = ["business", "social", "analytics", "chatbot", "security"] as const;
type Tab = (typeof TABS)[number];

interface InitialDoc {
  business?: Values["business"];
  social?: Values["social"];
  analytics?: Values["analytics"];
  chatbot?: Values["chatbot"];
}

export function SettingsForm({ initial }: { initial: InitialDoc }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("business");
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      business: initial.business ?? { phone: "", email: "", address: "", hoursWeek: "", hoursSunday: "" },
      social: initial.social ?? { fb: "", tw: "", li: "", ig: "", yt: "" },
      analytics: initial.analytics ?? { ga4: "", gtm: "", clarity: "" },
      chatbot: {
        name: initial.chatbot?.name ?? "Aria",
        avatar: initial.chatbot?.avatar ?? "",
        welcome: initial.chatbot?.welcome ?? "",
        placeholder: initial.chatbot?.placeholder ?? "",
        quickActions: initial.chatbot?.quickActions ?? [],
      },
    },
  });

  const quickArr = useFieldArray({ control, name: "chatbot.quickActions" });

  const onSubmit = async (values: Values) => {
    try {
      await adminApi.put("/api/admin/settings", values);
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pill ${t === tab ? "pill--active" : ""}`}
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "security" ? (
        <SecurityPanel />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="admin-form" noValidate>
          {tab === "business" && (
            <div className="admin-form-section">
              <h3>Business info</h3>
              <div className="admin-form-row">
                <div className="field">
                  <label className="field__label">Phone</label>
                  <input className="input" {...register("business.phone")} />
                </div>
                <div className="field">
                  <label className="field__label">Email</label>
                  <input className="input" type="email" {...register("business.email")} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label className="field__label">Address</label>
                <input className="input" {...register("business.address")} />
              </div>
              <div className="admin-form-row" style={{ marginTop: 14 }}>
                <div className="field">
                  <label className="field__label">Weekday hours</label>
                  <input className="input" {...register("business.hoursWeek")} />
                </div>
                <div className="field">
                  <label className="field__label">Sunday hours</label>
                  <input className="input" {...register("business.hoursSunday")} />
                </div>
              </div>
            </div>
          )}

          {tab === "social" && (
            <div className="admin-form-section">
              <h3>Social links</h3>
              {([
                ["fb", "Facebook"],
                ["tw", "Twitter / X"],
                ["li", "LinkedIn"],
                ["ig", "Instagram"],
                ["yt", "YouTube"],
              ] as const).map(([key, label]) => (
                <div className="field" key={key} style={{ marginTop: 10 }}>
                  <label className="field__label">{label} URL</label>
                  <input className="input" {...register(`social.${key}` as const)} />
                </div>
              ))}
            </div>
          )}

          {tab === "analytics" && (
            <div className="admin-form-section">
              <h3>Analytics IDs</h3>
              <div className="field">
                <label className="field__label">GA4 measurement ID (e.g. G-XXXXXXX)</label>
                <input className="input" {...register("analytics.ga4")} />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label className="field__label">Google Tag Manager ID</label>
                <input className="input" {...register("analytics.gtm")} />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label className="field__label">Microsoft Clarity ID</label>
                <input className="input" {...register("analytics.clarity")} />
              </div>
            </div>
          )}

          {tab === "chatbot" && (
            <div className="admin-form-section">
              <h3>Chatbot UI</h3>
              <div className="admin-form-row">
                <div className="field">
                  <label className="field__label">Bot name</label>
                  <input className="input" {...register("chatbot.name")} />
                </div>
                <div className="field">
                  <label className="field__label">Placeholder</label>
                  <input className="input" {...register("chatbot.placeholder")} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label className="field__label">Welcome message</label>
                <textarea className="textarea" {...register("chatbot.welcome")} style={{ minHeight: 80 }} />
              </div>
              <Controller
                control={control}
                name="chatbot.avatar"
                render={({ field }) => (
                  <div style={{ marginTop: 14 }}>
                    <ImageUploader value={field.value} onChange={field.onChange} label="Avatar" />
                  </div>
                )}
              />
              <div style={{ marginTop: 14 }}>
                <div className="field__label" style={{ marginBottom: 6 }}>Quick actions</div>
                {quickArr.fields.map((f, i) => (
                  <div key={f.id} style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input className="input" placeholder="Label" {...register(`chatbot.quickActions.${i}.label` as const)} />
                    <input className="input" placeholder="Payload / message" {...register(`chatbot.quickActions.${i}.payload` as const)} />
                    <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => quickArr.remove(i)}>
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}
                <Btn size="sm" type="button" variant="secondary" style={{ marginTop: 8 }} onClick={() => quickArr.append({ label: "", payload: "" })}>
                  <Icon name="plus" size={12} /> Add action
                </Btn>
              </div>
            </div>
          )}

          <div className="admin-form-actions">
            <Btn type="submit" iconRight="arrowRight" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save settings"}
            </Btn>
          </div>
        </form>
      )}
    </>
  );
}

interface LoginLog {
  at?: string;
  ip?: string;
  userAgent?: string;
}

function SecurityPanel() {
  const [pwOpen, setPwOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<LoginLog[] | null>(null);
  const [twoFa, setTwoFa] = React.useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = React.useState("");
  const [recovery, setRecovery] = React.useState<string | null>(null);
  const [lockBusy, setLockBusy] = React.useState(false);
  const [lockOpen, setLockOpen] = React.useState(false);
  const [currentPw, setCurrentPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    adminApi
      .get<{ logs: LoginLog[] }>("/api/admin/sessions")
      .then((d) => setLogs((d.logs ?? []).slice(-8).reverse()))
      .catch(() => setLogs([]));
  }, []);

  const setupTwoFa = async () => {
    setBusy(true);
    try {
      const res = await adminApi.post<{ qrCodeDataUrl: string; secret: string }>("/api/admin/2fa/setup", {});
      setTwoFa(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  };

  const verifyTwoFa = async () => {
    if (!/^\d{6}$/.test(twoFaCode)) return;
    setBusy(true);
    try {
      await adminApi.post("/api/admin/2fa/verify", { code: twoFaCode });
      toast.success("2FA enabled");
      setTwoFa(null);
      setTwoFaCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const disableTwoFa = async () => {
    const code = window.prompt("Enter current 2FA code to disable");
    if (!code || !/^\d{6}$/.test(code)) return;
    setBusy(true);
    try {
      await adminApi.post("/api/admin/2fa/disable", { code });
      toast.success("2FA disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Disable failed");
    } finally {
      setBusy(false);
    }
  };

  const rotateRecovery = async () => {
    setBusy(true);
    try {
      const res = await adminApi.post<{ recoveryCode: string }>("/api/admin/recovery-code/generate", {});
      setRecovery(res.recoveryCode);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (newPw.length < 12) {
      toast.error("Password must be at least 12 characters");
      return;
    }
    setBusy(true);
    try {
      await adminApi.post("/api/admin/password/change", { currentPassword: currentPw, newPassword: newPw });
      toast.success("Password changed");
      setPwOpen(false);
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Change failed");
    } finally {
      setBusy(false);
    }
  };

  const emergencyLock = async () => {
    setLockBusy(true);
    try {
      await adminApi.post("/api/admin/emergency-lock", { locked: true });
      toast.success("Account emergency-locked. Use recovery code to unlock.");
      setLockOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLockBusy(false);
    }
  };

  return (
    <>
      <div className="admin-form-section">
        <h3>Password</h3>
        <p className="t-small" style={{ marginBottom: 12 }}>Use 12+ characters with mixed case and a number.</p>
        <Btn type="button" onClick={() => setPwOpen(true)}>Change password</Btn>
      </div>

      <div className="admin-form-section" style={{ marginTop: 16 }}>
        <h3>Two-factor authentication</h3>
        {!twoFa ? (
          <div style={{ display: "flex", gap: 10 }}>
            <Btn type="button" onClick={setupTwoFa} disabled={busy}>Enable 2FA</Btn>
            <Btn variant="ghost" type="button" onClick={disableTwoFa} disabled={busy}>Disable 2FA</Btn>
          </div>
        ) : (
          <div>
            <p className="t-small" style={{ marginBottom: 10 }}>Scan in Authenticator and verify with the 6-digit code.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={twoFa.qrCodeDataUrl} alt="2FA QR" style={{ width: 180, height: 180 }} />
            <div className="t-small" style={{ marginTop: 8 }}>
              Or enter secret manually: <code>{twoFa.secret}</code>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                className="input"
                placeholder="6-digit code"
                inputMode="numeric"
                maxLength={6}
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                style={{ maxWidth: 180 }}
              />
              <Btn type="button" onClick={verifyTwoFa} disabled={busy}>Verify & enable</Btn>
            </div>
          </div>
        )}
      </div>

      <div className="admin-form-section" style={{ marginTop: 16 }}>
        <h3>Recovery code</h3>
        <p className="t-small" style={{ marginBottom: 10 }}>
          Generate a single-use recovery code in case you lose your 2FA device. Generating a new code invalidates the old one.
        </p>
        <Btn type="button" onClick={rotateRecovery} disabled={busy}>Generate new recovery code</Btn>
        {recovery && (
          <div className="admin-card" style={{ marginTop: 14, background: "#FEF3C7", borderColor: "#FCD34D" }}>
            <p className="t-small" style={{ marginBottom: 6 }}>
              <strong>Store this code somewhere safe — you won&apos;t see it again.</strong>
            </p>
            <code style={{ fontSize: 18, letterSpacing: 2 }}>{recovery}</code>
          </div>
        )}
      </div>

      <div className="admin-form-section" style={{ marginTop: 16 }}>
        <h3>Recent logins</h3>
        <p className="t-small" style={{ marginBottom: 10 }}>
          Sessions are stateless (JWT) — signing out clears this device; the emergency lock below blocks all devices.
        </p>
        {logs === null ? (
          <p className="t-small">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="t-small">No login activity recorded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {logs.map((l, i) => (
              <div key={i} className="t-small" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span>{l.at ? new Date(l.at).toLocaleString("en-IN") : "—"}</span>
                <span>{l.ip || ""}</span>
                <span style={{ opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360, whiteSpace: "nowrap" }}>
                  {l.userAgent || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-form-section" style={{ marginTop: 16, borderColor: "#FCA5A5" }}>
        <h3 style={{ color: "#DC2626" }}>Emergency lock</h3>
        <p className="t-small" style={{ marginBottom: 10 }}>
          Locks all logins instantly. Use only if you suspect compromise. Recovery code restores access.
        </p>
        <Btn type="button" style={{ background: "#DC2626" }} onClick={() => setLockOpen(true)}>
          Trigger emergency lock
        </Btn>
      </div>

      {pwOpen && (
        <div className="admin-modal-overlay" onClick={() => setPwOpen(false)} style={{ zIndex: 110 }}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change password</h3>
            <div className="admin-modal__body" style={{ display: "grid", gap: 14 }}>
              <div className="field">
                <label className="field__label">Current password</label>
                <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label">New password</label>
                <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                <span className="admin-form-help">At least 12 characters, with upper, lower, and number.</span>
              </div>
            </div>
            <div className="admin-modal__actions">
              <Btn variant="ghost" type="button" onClick={() => setPwOpen(false)}>Cancel</Btn>
              <Btn type="button" disabled={busy} onClick={changePassword}>Change password</Btn>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={lockOpen}
        title="Trigger emergency lock?"
        message="All sessions will be blocked until you unlock via recovery code."
        confirmLabel="Lock account"
        destructive
        loading={lockBusy}
        onConfirm={emergencyLock}
        onCancel={() => setLockOpen(false)}
      />
    </>
  );
}
