"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Delivery, DeliveryStatus } from "@/lib/dynamodb";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Confirmed", picked_up: "Processing", in_transit: "Dispatched",
  delivered: "Delivered", failed: "Failed",
};
const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "#f5c451", picked_up: "#5cc8ff", in_transit: "#f5a623",
  delivered: "#3ecf8e", failed: "#ff5a5f",
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span style={{
      background: STATUS_COLORS[status] + "22", color: STATUS_COLORS[status],
      border: `1px solid ${STATUS_COLORS[status]}44`, padding: "4px 10px",
      borderRadius: 20, fontFamily: "DM Mono", fontSize: 11,
      textTransform: "uppercase", letterSpacing: "0.08em"
    }}>{STATUS_LABELS[status]}</span>
  );
}

function CreateDeliveryModal({ onClose, onCreated }: { onClose: () => void; onCreated: (d: Delivery) => void }) {
  const [form, setForm] = useState({ recipientName: "", recipientPhone: "", pickupAddress: "", deliveryAddress: "", itemDescription: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.recipientName || !form.recipientPhone || !form.pickupAddress || !form.deliveryAddress || !form.itemDescription) {
      setError("Please fill all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/deliveries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.delivery);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
      <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Bebas Neue", fontSize: 28 }}>New Delivery</h2>
          <button onClick={onClose} style={{ background: "none", color: "var(--muted)", fontSize: 22, padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "recipientName", label: "Recipient Name *", placeholder: "Customer full name" },
            { key: "recipientPhone", label: "Recipient Phone *", placeholder: "+234 800 000 0000" },
            { key: "pickupAddress", label: "Pickup Address *", placeholder: "Street, area, Lagos" },
            { key: "deliveryAddress", label: "Delivery Address *", placeholder: "Street, area, Lagos" },
            { key: "itemDescription", label: "Item Description *", placeholder: "e.g. 2 bags of rice, pharmacy order" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <div className="label" style={{ marginBottom: 8 }}>{label}</div>
              <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
            </div>
          ))}
          {error && <div style={{ background: "#ff174422", border: "1px solid #ff174444", color: "#ff1744", padding: "12px 16px", borderRadius: 8, fontFamily: "DM Mono", fontSize: 13 }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2, opacity: loading ? 0.6 : 1 }}>{loading ? "Creating..." : "Create Delivery →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateStatusModal({ delivery, onClose, onUpdated }: { delivery: Delivery; onClose: () => void; onUpdated: (d: Delivery) => void }) {
  const [status, setStatus] = useState<DeliveryStatus>(delivery.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const statuses: DeliveryStatus[] = ["pending", "picked_up", "in_transit", "delivered", "failed"];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/${delivery.trackingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.delivery);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
      <div style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 14, padding: 36, width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontFamily: "Bebas Neue", fontSize: 28, marginBottom: 6 }}>Update Status</h2>
        <div className="mono" style={{ fontSize: 13, color: "var(--orange)", marginBottom: 24 }}>{delivery.trackingId} — {delivery.recipientName}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              background: status === s ? STATUS_COLORS[s] + "22" : "var(--gray-mid)",
              border: `1px solid ${status === s ? STATUS_COLORS[s] : "var(--border)"}`,
              color: status === s ? STATUS_COLORS[s] : "var(--muted)",
              padding: "12px 16px", borderRadius: 8, textAlign: "left",
              fontFamily: "DM Sans", fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[s], display: "inline-block" }} />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="label" style={{ marginBottom: 8 }}>Note (optional)</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Rider arrived at pickup..." rows={3} style={{ resize: "none", marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={handleUpdate} disabled={loading} style={{ flex: 2, opacity: loading ? 0.6 : 1 }}>{loading ? "Updating..." : "Update →"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ businessName?: string; isAdmin?: boolean } | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [updating, setUpdating] = useState<Delivery | null>(null);
  const [filter, setFilter] = useState<DeliveryStatus | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.authenticated) { router.push("/login"); return; }
      setUser(data);
    });
  }, [router]);

  const loadDeliveries = useCallback(async () => {
    try {
      const res = await fetch("/api/deliveries");
      const data = await res.json();
      if (data.deliveries) {
        setDeliveries(data.deliveries.sort((a: Delivery, b: Delivery) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) loadDeliveries(); }, [user, loadDeliveries]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const copyTracking = (trackingId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/track/${trackingId}`);
    setCopied(trackingId); setTimeout(() => setCopied(null), 2000);
  };

  const filtered = deliveries
    .filter(d => filter === "all" || d.status === filter)
    .filter(d => !search || d.recipientName.toLowerCase().includes(search.toLowerCase()) || d.trackingId.toLowerCase().includes(search.toLowerCase()) || d.deliveryAddress.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: deliveries.length,
    active: deliveries.filter(d => ["picked_up", "in_transit"].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === "delivered").length,
    pending: deliveries.filter(d => d.status === "pending").length,
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div className="mono" style={{ color: "var(--muted)" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--black)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "var(--orange)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 12 }}>DX</span>
            </div>
            <span style={{ fontFamily: "Bebas Neue", fontSize: 18 }}>DropsEx</span>
          </Link>
          <div style={{ height: 16, width: 1, background: "var(--border)" }} />
          <span className="label">{user.businessName || "Dashboard"}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user.isAdmin && (
            <Link href="/admin">
              <button className="btn-ghost" style={{ fontSize: 12, padding: "8px 16px", color: "var(--orange)", borderColor: "var(--orange)" }}>Admin Panel</button>
            </Link>
          )}
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ fontSize: 13, padding: "10px 18px" }}>+ New Delivery</button>
          <button onClick={logout} style={{ background: "none", color: "var(--muted)", fontSize: 13, fontFamily: "DM Sans", border: "1px solid var(--border)", padding: "8px 14px", borderRadius: 6 }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total", value: stats.total, color: "var(--white)" },
            { label: "Active", value: stats.active, color: "var(--orange)" },
            { label: "Delivered", value: stats.delivered, color: "var(--green)" },
            { label: "Pending", value: stats.pending, color: "var(--yellow)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px" }}>
              <div className="label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 38, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, tracking ID, address..." style={{ flex: 1, minWidth: 200 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "pending", "picked_up", "in_transit", "delivered", "failed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? "var(--orange)" : "var(--gray)",
                color: filter === f ? "var(--black)" : "var(--muted)",
                border: "1px solid " + (filter === f ? "var(--orange)" : "var(--border)"),
                padding: "8px 14px", borderRadius: 6, fontFamily: "DM Mono", fontSize: 11, textTransform: "uppercase"
              }}>
                {f === "all" ? "All" : STATUS_LABELS[f as DeliveryStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--muted)", fontFamily: "DM Mono" }}>Loading deliveries...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, border: "1px dashed var(--border)", borderRadius: 12 }}>
            <div style={{ fontFamily: "Bebas Neue", fontSize: 32, color: "var(--muted)", marginBottom: 12 }}>
              {search || filter !== "all" ? "No matching deliveries" : "No deliveries yet"}
            </div>
            {!search && filter === "all" && (
              <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create First Delivery</button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(d => (
              <div key={d.trackingId} style={{
                background: "var(--gray)", border: "1px solid var(--border)", borderRadius: 10,
                padding: "16px 20px", display: "grid",
                gridTemplateColumns: "150px 1fr 1fr 130px 110px 100px",
                alignItems: "center", gap: 14
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--orange)", fontWeight: 500 }}>{d.trackingId}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                    {new Date(d.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{d.recipientName}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "DM Mono" }}>{d.recipientPhone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2 }} title={d.deliveryAddress}>
                    {d.deliveryAddress.length > 32 ? d.deliveryAddress.slice(0, 32) + "…" : d.deliveryAddress}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.itemDescription}</div>
                </div>
                <StatusBadge status={d.status} />
                <button onClick={() => copyTracking(d.trackingId)} style={{
                  background: copied === d.trackingId ? "var(--green)" : "var(--gray-mid)",
                  color: copied === d.trackingId ? "var(--black)" : "var(--white)",
                  border: "1px solid var(--border)", padding: "8px 10px",
                  borderRadius: 6, fontSize: 12, fontFamily: "DM Sans", fontWeight: 600
                }}>
                  {copied === d.trackingId ? "✓ Copied" : "Copy Link"}
                </button>
                <button onClick={() => setUpdating(d)} style={{
                  background: "none", color: "var(--orange)", border: "1px solid var(--orange)",
                  padding: "8px 10px", borderRadius: 6, fontSize: 12, fontFamily: "DM Sans", fontWeight: 600
                }}>Update</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateDeliveryModal onClose={() => setShowCreate(false)} onCreated={d => { setDeliveries(prev => [d, ...prev]); setShowCreate(false); }} />}
      {updating && <UpdateStatusModal delivery={updating} onClose={() => setUpdating(null)} onUpdated={d => { setDeliveries(prev => prev.map(x => x.trackingId === d.trackingId ? d : x)); setUpdating(null); }} />}
    </div>
  );
}
