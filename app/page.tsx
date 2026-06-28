"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WHATSAPP = "https://wa.me/2348127140217";
const WHATSAPP_ENTERPRISE =
  "https://wa.me/2348127140217?text=Hi%20Klutch%20Konnect%20%E2%9A%A1%20I%27d%20like%20to%20discuss%20DropsEx%20Enterprise%20pricing%20for%20my%20business.";

const TIERS = [
  {
    tag: "Starter",
    name: "Per Trip",
    price: "₦3,500",
    per: "₦3,500 / trip",
    featured: false,
    features: [
      "Real-time KLUTCH tracking ID",
      "WhatsApp tracking link auto-sent",
      "Status updates: Confirmed → Delivered",
      "Pay as you go — no commitment",
    ],
  },
  {
    tag: "Most Popular",
    name: "Starter Bundle",
    price: "₦50,000",
    per: "₦2,500 / trip — save 28%",
    featured: true,
    features: [
      "Everything in Per Trip",
      "Up to 20 deliveries/month",
      "Priority dispatch",
      "Monthly delivery report",
    ],
  },
  {
    tag: "Best Value",
    name: "Business Plan",
    price: "₦80,000",
    per: "₦2,000 / trip — save 43%",
    featured: false,
    features: [
      "Everything in Starter Bundle",
      "Up to 40 deliveries/month",
      "Dedicated support line",
      "Branded tracking page",
    ],
  },
];

const ZONES = [
  "Isolo", "Surulere", "Lagos Island", "Victoria Island",
  "Lekki", "Yaba", "Mushin", "Oshodi", "+ More on request",
];

const STEPS = [
  { n: "01", title: "Confirm order", body: "Log the order in your dashboard. A unique KLUTCH-XXXXXX ID is generated instantly." },
  { n: "02", title: "Share the link", body: "The live tracking link is sent to your customer on WhatsApp automatically." },
  { n: "03", title: "Rider dispatched", body: "Confirmed → Processing → Dispatched. Your customer sees each stage live." },
  { n: "04", title: "Delivered", body: "Marked delivered the moment it lands. No more 'where's my order?' calls." },
];

export default function Home() {
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState("");

  const handleTrack = () => {
    const id = trackingInput.trim().toUpperCase();
    if (id) router.push(`/track/${id}`);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--black)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--gold)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 16 }}>DX</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "Bebas Neue", fontSize: 22, letterSpacing: "0.05em" }}>DropsEx</span>
            <span className="label" style={{ fontSize: 8, letterSpacing: "0.18em" }}>by Klutch Konnect</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#how-it-works" style={{ color: "var(--muted)", fontSize: 14 }}>How it works</a>
          <a href="#pricing" style={{ color: "var(--muted)", fontSize: 14 }}>Pricing</a>
          <a href="#contact" style={{ color: "var(--muted)", fontSize: 14 }}>Contact</a>
          <Link href="/login"><button className="btn-ghost" style={{ fontSize: 13 }}>Business Login</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ fontSize: 13, padding: "11px 20px" }}>Get Started</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 40px 80px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div className="label" style={{ marginBottom: 20, color: "var(--gold)" }}>● Lagos Farm-to-Door Delivery</div>
          <h1 style={{ fontFamily: "Bebas Neue", fontSize: "clamp(60px, 7.5vw, 96px)", lineHeight: 0.95, letterSpacing: "0.02em", marginBottom: 28 }}>
            YOUR <span style={{ color: "var(--gold)" }}>DROPS,</span><br />NOW<br />TRACKED.
          </h1>
          <p style={{ fontSize: 18, color: "#bdbdb8", lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
            Lagos businesses lose customers to delivery anxiety — no tracking, constant callbacks.
            DropsEx gives every order a unique KLUTCH ID so your customers watch their delivery live.
            That &quot;where&apos;s my order?&quot; call is our job now.
          </p>

          {/* TRACK BOX */}
          <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
            <div className="label" style={{ marginBottom: 12 }}>Track a delivery</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Enter tracking ID (e.g. KLUTCH-A1B2C3)"
                onKeyDown={e => e.key === "Enter" && handleTrack()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={handleTrack} style={{ whiteSpace: "nowrap" }}>
                Track →
              </button>
            </div>
          </div>
        </div>

        {/* INCLUDED CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { title: "Live KLUTCH Tracking ID", body: "Every order gets a KLUTCH-XXXXXX ID generated instantly. Customers track live on our site." },
            { title: "WhatsApp Auto-Notify", body: "Tracking link auto-sent to your customer the moment their order is confirmed." },
            { title: "Live Status Updates", body: "Confirmed → Processing → Dispatched → Delivered. Your customer sees every stage." },
          ].map(c => (
            <div key={c.title} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "var(--green)", fontSize: 16 }}>✓</span>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, paddingLeft: 26 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 40px", borderTop: "1px solid var(--border)", maxWidth: 1100, margin: "0 auto" }}>
        <div className="label" style={{ marginBottom: 48, textAlign: "center" }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {STEPS.map(step => (
            <div key={step.n} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: 28 }}>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 48, color: "var(--gold)", opacity: 0.5, marginBottom: 16, lineHeight: 1 }}>{step.n}</div>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 16 }}>{step.title}</div>
              <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 40px", borderTop: "1px solid var(--border)", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="label" style={{ marginBottom: 14, color: "var(--gold)" }}>Rate card</div>
          <h2 style={{ fontFamily: "Bebas Neue", fontSize: 52, letterSpacing: "0.02em" }}>Simple, transparent pricing</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
          {TIERS.map(tier => (
            <div key={tier.name} style={{
              background: tier.featured ? "var(--gold)" : "var(--gray)",
              border: `1px solid ${tier.featured ? "var(--gold)" : "var(--border)"}`,
              borderRadius: 16, padding: 32, position: "relative",
            }}>
              <div className="label" style={{ color: tier.featured ? "rgba(0,0,0,0.55)" : "var(--muted)", marginBottom: 10 }}>{tier.tag}</div>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 30, color: tier.featured ? "var(--black)" : "var(--white)", letterSpacing: "0.02em", marginBottom: 14 }}>{tier.name}</div>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 52, color: tier.featured ? "var(--black)" : "var(--gold)", lineHeight: 1 }}>{tier.price}</div>
              <div className="mono" style={{ fontSize: 12, color: tier.featured ? "rgba(0,0,0,0.6)" : "var(--muted)", marginTop: 6, marginBottom: 22 }}>{tier.per}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {tier.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: tier.featured ? "rgba(0,0,0,0.8)" : "#cfcfca", lineHeight: 1.4 }}>
                    <span style={{ color: tier.featured ? "var(--black)" : "var(--green)", flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button style={{
                  width: "100%", padding: 14, borderRadius: 8,
                  background: tier.featured ? "var(--black)" : "var(--gold)",
                  color: tier.featured ? "var(--white)" : "var(--black)",
                  fontWeight: 700, fontSize: 14,
                }}>Choose {tier.name} →</button>
              </Link>
            </div>
          ))}
        </div>

        {/* ENTERPRISE */}
        <div style={{ background: "var(--gray-mid)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "Bebas Neue", fontSize: 26, letterSpacing: "0.02em", marginBottom: 6 }}>Enterprise — Custom Pricing</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>40+ deliveries/month · Dedicated rider · White-label tracking · Volume rates from ₦1,500/trip</div>
          </div>
          <a href={WHATSAPP_ENTERPRISE} target="_blank" rel="noopener noreferrer">
            <button className="btn-primary" style={{ whiteSpace: "nowrap" }}>Talk to Us →</button>
          </a>
        </div>
      </section>

      {/* COVERAGE */}
      <section style={{ padding: "60px 40px", borderTop: "1px solid var(--border)", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div className="label" style={{ marginBottom: 24 }}>Coverage zones · Lagos</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {ZONES.map(z => (
            <span key={z} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 24, padding: "8px 18px", fontSize: 13, color: z.startsWith("+") ? "var(--gold)" : "var(--white)" }}>{z}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: "40px auto", background: "var(--gold)", borderRadius: 16, padding: "56px 64px", maxWidth: 1020, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Bebas Neue", fontSize: 50, color: "var(--black)", letterSpacing: "0.02em", marginBottom: 8 }}>Ready to track your drops?</h2>
          <p style={{ color: "rgba(0,0,0,0.65)", fontSize: 16 }}>Register your business and start in under 2 minutes.</p>
        </div>
        <Link href="/register">
          <button style={{ background: "var(--black)", color: "var(--white)", padding: "18px 36px", borderRadius: 10, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>
            Register Free →
          </button>
        </Link>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 40px", borderTop: "1px solid var(--border)", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <div className="label" style={{ marginBottom: 20, color: "var(--gold)" }}>Get in touch</div>
            <h2 style={{ fontFamily: "Bebas Neue", fontSize: 52, lineHeight: 1, marginBottom: 24 }}>
              WANT TO LIST YOUR BUSINESS?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              DropsEx is built for Lagos businesses who want to stop losing customers over delivery anxiety.
              Restaurant, pharmacy, supermarket, boutique — if you deliver, we track it.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "WhatsApp", value: "+234 812 714 0217", href: WHATSAPP },
                { label: "Email", value: "klutchkonnect@outlook.com", href: "mailto:klutchkonnect@outlook.com" },
                { label: "Based in", value: "Jakande Estate, Isolo, Lagos", href: null },
              ].map(c => (
                <a key={c.label} href={c.href || undefined} target={c.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, cursor: c.href ? "pointer" : "default" }}>
                  <div style={{ width: 40, height: 40, background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", fontFamily: "Bebas Neue", fontSize: 14 }}>{c.label[0]}</div>
                  <div>
                    <div className="label" style={{ fontSize: 10, marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 15, fontFamily: "DM Mono" }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontFamily: "Bebas Neue", fontSize: 32, marginBottom: 12 }}>Talk to us on WhatsApp</h3>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              The fastest way to onboard. Send us a message about your business and delivery volume,
              and we&apos;ll get you set up the same day.
            </p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <button className="btn-primary" style={{ width: "100%", padding: 16 }}>Message Klutch Konnect →</button>
            </a>
            <Link href="/register" style={{ marginTop: 12 }}>
              <button className="btn-ghost" style={{ width: "100%", padding: 16 }}>Or register online →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "Bebas Neue", fontSize: 18, letterSpacing: "0.05em", marginBottom: 4 }}>DropsEx</div>
          <div style={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--muted)" }}>by Klutch Konnect Ltd · RC 9207504 · Lagos, Nigeria</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/login" style={{ color: "var(--muted)", fontSize: 13 }}>Business Login</Link>
          <Link href="/register" style={{ color: "var(--muted)", fontSize: 13 }}>Register</Link>
          <a href="#pricing" style={{ color: "var(--muted)", fontSize: 13 }}>Pricing</a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", fontSize: 13 }}>WhatsApp</a>
        </div>
        <div style={{ fontFamily: "DM Mono", fontSize: 12, color: "var(--muted)" }}>Built on Vercel + AWS DynamoDB</div>
      </footer>
    </main>
  );
}
