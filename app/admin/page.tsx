"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Business, Delivery, DeliveryStatus } from "@/lib/dynamodb";

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "#f5c451", picked_up: "#5cc8ff", in_transit: "#f5a623",
  delivered: "#3ecf8e", failed: "#ff5a5f",
};
const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Confirmed", picked_up: "Processing", in_transit: "Dispatched",
  delivered: "Delivered", failed: "Failed",
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<{ businesses: Business[]; deliveries: Delivery[] } | null>(null);
  const [tab, setTab] = useState<"overview" | "businesses" | "deliveries">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(me => {
      if (!me.authenticated || !me.isAdmin) { router.push("/login"); return; }
    });
    fetch("/api/admin").then(r => r.json()).then(d => {
      setData(d); setLoading(false);
    });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || !data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div className="mono" style={{ color: "var(--muted)" }}>Loading admin panel...</div>
    </div>
  );

  const { businesses, deliveries } = data;
  const totalRevenue = deliveries.filter(d => d.status === "delivered").length * 1500;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--black)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "var(--orange)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 12 }}>DX</span>
            </div>
            <span style={{ fontFamily: "Bebas Neue", fontSize: 18 }}>DropsEx</span>
          </Link>
          <div style={{ background: "var(--orange)", color: "var(--black)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "DM Mono", fontWeight: 600 }}>MASTER ADMIN</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard"><button className="btn-ghost" style={{ fontSize: 12, padding: "8px 14px" }}>My Dashboard</button></Link>
          <button onClick={logout} style={{ background: "none", color: "var(--muted)", fontSize: 13, fontFamily: "DM Sans", border: "1px solid var(--border)", padding: "8px 14px", borderRadius: 6 }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Bebas Neue", fontSize: 42, marginBottom: 28, letterSpacing: "0.03em" }}>
          Admin Overview
        </h1>

        {/* TOP STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Registered Businesses", value: businesses.length, color: "var(--white)" },
            { label: "Total Deliveries", value: deliveries.length, color: "var(--orange)" },
            { label: "Delivered", value: deliveries.filter(d => d.status === "delivered").length, color: "var(--green)" },
            { label: "Est. Revenue", value: `₦${(totalRevenue / 1000).toFixed(0)}K`, color: "var(--yellow)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px" }}>
              <div className="label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 38, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["overview", "businesses", "deliveries"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "var(--orange)" : "var(--gray)",
              color: tab === t ? "var(--black)" : "var(--muted)",
              border: "1px solid " + (tab === t ? "var(--orange)" : "var(--border)"),
              padding: "10px 20px", borderRadius: 6, fontFamily: "DM Sans",
              fontWeight: 700, fontSize: 13, textTransform: "capitalize"
            }}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Active deliveries */}
            <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <div className="label" style={{ marginBottom: 16 }}>Active Deliveries</div>
              {deliveries.filter(d => ["picked_up", "in_transit"].includes(d.status)).slice(0, 6).map(d => (
                <div key={d.trackingId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 12, color: "var(--orange)" }}>{d.trackingId}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{d.recipientName}</div>
                  </div>
                  <span style={{ background: STATUS_COLORS[d.status] + "22", color: STATUS_COLORS[d.status], border: `1px solid ${STATUS_COLORS[d.status]}44`, padding: "3px 8px", borderRadius: 20, fontSize: 10, fontFamily: "DM Mono" }}>
                    {STATUS_LABELS[d.status]}
                  </span>
                </div>
              ))}
              {deliveries.filter(d => ["picked_up", "in_transit"].includes(d.status)).length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 14, fontFamily: "DM Mono" }}>No active deliveries</div>
              )}
            </div>

            {/* Top businesses */}
            <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <div className="label" style={{ marginBottom: 16 }}>Businesses</div>
              {businesses.map(b => {
                const bDeliveries = deliveries.filter(d => d.clientId === b.businessId);
                return (
                  <div key={b.businessId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{b.businessName}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{b.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Bebas Neue", fontSize: 22, color: "var(--orange)" }}>{bDeliveries.length}</div>
                      <div className="label" style={{ fontSize: 9 }}>deliveries</div>
                    </div>
                  </div>
                );
              })}
              {businesses.length === 0 && <div style={{ color: "var(--muted)", fontSize: 14, fontFamily: "DM Mono" }}>No businesses registered yet</div>}
            </div>
          </div>
        )}

        {/* BUSINESSES TAB */}
        {tab === "businesses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {businesses.map(b => {
              const bDeliveries = deliveries.filter(d => d.clientId === b.businessId);
              const delivered = bDeliveries.filter(d => d.status === "delivered").length;
              return (
                <div key={b.businessId} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 80px", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{b.businessName}</div>
                    <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{b.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{b.phone}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{b.address}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Bebas Neue", fontSize: 28, color: "var(--orange)" }}>{bDeliveries.length}</div>
                    <div className="label" style={{ fontSize: 9 }}>total</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Bebas Neue", fontSize: 28, color: "var(--green)" }}>{delivered}</div>
                    <div className="label" style={{ fontSize: 9 }}>delivered</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "Bebas Neue", fontSize: 20, color: "var(--yellow)" }}>₦{(delivered * 1500 / 1000).toFixed(0)}K</div>
                    <div className="label" style={{ fontSize: 9 }}>revenue</div>
                  </div>
                </div>
              );
            })}
            {businesses.length === 0 && (
              <div style={{ textAlign: "center", padding: 60, border: "1px dashed var(--border)", borderRadius: 12, color: "var(--muted)" }}>
                No businesses registered yet. Share the registration link with your clients.
              </div>
            )}
          </div>
        )}

        {/* DELIVERIES TAB */}
        {tab === "deliveries" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {deliveries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(d => (
              <div key={d.trackingId} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 20px", display: "grid", gridTemplateColumns: "140px 120px 1fr 1fr 120px 80px", alignItems: "center", gap: 14 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--orange)" }}>{d.trackingId}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "DM Mono" }}>{d.clientName}</div>
                <div style={{ fontSize: 13 }}>{d.recipientName}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }} title={d.deliveryAddress}>
                  {d.deliveryAddress.length > 28 ? d.deliveryAddress.slice(0, 28) + "…" : d.deliveryAddress}
                </div>
                <span style={{ background: STATUS_COLORS[d.status] + "22", color: STATUS_COLORS[d.status], border: `1px solid ${STATUS_COLORS[d.status]}44`, padding: "4px 8px", borderRadius: 20, fontFamily: "DM Mono", fontSize: 10, textTransform: "uppercase" }}>
                  {STATUS_LABELS[d.status]}
                </span>
                <Link href={`/track/${d.trackingId}`} target="_blank">
                  <button style={{ background: "none", color: "var(--muted)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: 6, fontSize: 11, fontFamily: "DM Sans" }}>View →</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
