import Link from "next/link";
import { Btn } from "@/components/ui";

/**
 * Custom 404 for any unmatched `/admin/*` path. Lives at the admin segment
 * root so it covers both the protected pages and the login route without
 * leaking the admin shell. Kept as a Server Component — no interactive bits
 * required.
 */
export default function AdminNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #F4F8FF 0%, #fff 60%)",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 480,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--c-primary-50)",
            color: "var(--c-primary-700)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
            fontSize: 26,
            fontWeight: 800,
            fontFamily: "var(--ff-mono)",
          }}
          aria-hidden
        >
          404
        </div>
        <h1 className="t-h3" style={{ fontSize: 24 }}>Page not found in admin</h1>
        <p className="t-small" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
          The admin route you tried doesn&apos;t exist. It may have been moved, renamed, or never
          existed at all.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 26,
            flexWrap: "wrap",
          }}
        >
          <Link href="/admin/dashboard">
            <Btn type="button" iconRight="arrowRight">
              Back to dashboard
            </Btn>
          </Link>
          <Link href="/admin/login">
            <Btn type="button" variant="secondary">
              Sign in
            </Btn>
          </Link>
        </div>
      </div>
    </div>
  );
}
