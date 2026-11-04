import Link from "next/link";
import Image from "next/image";
import { Btn, Reveal } from "@/components/ui";
import type { Metadata } from "next";

// 404s must not inherit the root layout's "index, follow" + homepage canonical.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section
      style={{
        padding: "40px 20px",
        background: "linear-gradient(180deg,#F4F8FF,#fff)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
        <Reveal>
          <Image
            src="/assets/404-illustration.png"
            alt="404 - Page Not Found"
            width={1024}
            height={1024}
            priority
            sizes="(max-width: 420px) 100vw, 420px"
            style={{ maxWidth: 420, width: "100%", height: "auto", margin: "0 auto" }}
          />
        </Reveal>
        <Reveal delay={80}>
          <h1 className="t-h2" style={{ marginTop: 24, fontWeight: 800 }}>
            Oops!<br />Page Not Found
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="t-lead" style={{ marginTop: 14, maxWidth: 540, margin: "14px auto 0" }}>
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/"><Btn size="lg" icon="home">Go Back Home</Btn></Link>
            <Link href="/contact"><Btn size="lg" variant="outline">Contact Us</Btn></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
