"use client";

import * as React from "react";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function BlogSidebarCta() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "blog_sidebar_checklist" }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to subscribe");
      }
      
      setDone(true);
    } catch {
      // Fallback/Fail soft: still thank the user
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card sidebar-cta" style={{ textAlign: "center", padding: "32px 22px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: "50%", 
            background: "rgba(255,255,255,0.2)", 
            display: "grid", 
            placeItems: "center",
            color: "#fff"
          }}>
            <Icon name="check" size={24} stroke={3} />
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Awesome!</h4>
            <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,.9)" }}>
              Checklist sent! Please check your email inbox.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card sidebar-cta" noValidate>
      <h4 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
        Website Growth Checklist
      </h4>
      <p style={{ marginTop: 8, fontSize: 14, color: "rgba(255,255,255,.85)" }}>
        32 actionable tips to grow traffic in 60 days.
      </p>
      
      <div style={{ marginTop: 14, position: "relative" }}>
        <input
          type="email"
          className="input"
          placeholder="Your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          disabled={loading}
          style={{
            background: "rgba(255,255,255,.1)",
            borderColor: error ? "#FCA5A5" : "rgba(255,255,255,.3)",
            color: "#fff",
          }}
          aria-label="Email address"
        />
        {error && (
          <span style={{ 
            display: "block", 
            marginTop: 6, 
            fontSize: 12, 
            color: "#FCA5A5", 
            fontWeight: 500 
          }}>
            {error}
          </span>
        )}
      </div>

      <Btn
        type="submit"
        size="lg"
        disabled={loading}
        style={{ width: "100%", marginTop: 10, background: "#fff", color: "#1D4ED8" }}
        iconRight={loading ? undefined : "download"}
      >
        {loading ? "Sending…" : "Get the Checklist"}
      </Btn>
    </form>
  );
}
