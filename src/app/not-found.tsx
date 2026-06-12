import Link from "next/link";
import { Btn, Reveal } from "@/components/ui";

export default function NotFound() {
  return (
    <section
      style={{
        padding: "100px 0",
        background: "linear-gradient(180deg,#F4F8FF,#fff)",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
        <Reveal>
          <div className="not-found__big">404</div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="t-h2" style={{ marginTop: 14 }}>Oops! Page Not Found</h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="t-lead" style={{ marginTop: 14, maxWidth: 540, margin: "14px auto 0" }}>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/"><Btn size="lg" icon="home">Go Home</Btn></Link>
            <Link href="/services"><Btn size="lg" variant="secondary">View Services</Btn></Link>
            <Link href="/contact"><Btn size="lg" variant="outline">Contact Us</Btn></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
