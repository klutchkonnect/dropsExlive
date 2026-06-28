"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Delivery, DeliveryStatus } from "@/lib/dynamodb";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Confirmed",
  picked_up: "Processing",
  in_transit: "Dispatched",
  delivered: "Delivered!",
  failed: "Delivery Failed",
};

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "#f5c451",
  picked_up: "#5cc8ff",
  in_transit: "#f5a623",
  delivered: "#3ecf8e",
  failed: "#ff5a5f",
};

const STATUS_ORDER: DeliveryStatus[] = ["pending", "picked_up", "in_transit", "delivered"];

function TimelineStep({ status, currentStatus, timestamp, note }: {
  status: DeliveryStatus; currentStatus: DeliveryStatus;
  timestamp?: string; note?: string;
}) {
  const order = STATUS_ORDER;
  const stepIdx = order.indexOf(status);
  const currentIdx = order.indexOf(currentStatus);
  const isDone = currentIdx >= stepIdx;
  const isActive = currentIdx === stepIdx;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      {/* DOT + LINE */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isDone ? STATUS_COLORS[status] : "var(--gray-mid)",
          border: `2px solid ${isDone ? STATUS_COLORS[status] : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, transition: "all 0.3s",
          boxShadow: isActive ? `0 0 20px ${STATUS_COLORS[status]}66` : "none"
        }}>
          {isDone ? <span style={{ color: "var(--black)", fontWeight: 700, fontSize: 18 }}>✓</span> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />}
        </div>
        {status !== "delivered" && (
          <div style={{
            width: 2, height: 40, marginTop: 4,
            background: isDone && currentIdx > stepIdx ? STATUS_COLORS[status] : "var(--border)",
            transition: "all 0.3s"
          }} />
        )}
      </div>

      {/* CONTENT */}
      <div style={{ paddingBottom: 24 }}>
        <div style={{
          fontWeight: 700, fontSize: 16,
          color: isDone ? "var(--white)" : "var(--muted)",
          marginBottom: 4
        }}>
          {STATUS_LABELS[status]}
          {isActive && (
            <span style={{
              marginLeft: 10, fontSize: 11, fontFamily: "DM Mono",
              color: STATUS_COLORS[status],
              background: STATUS_COLORS[status] + "22",
              padding: "3px 8px", borderRadius: 20
            }}>NOW</span>
          )}
        </div>
        {timestamp && (
          <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: note ? 4 : 0 }}>
            {new Date(timestamp).toLocaleString("en-NG", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </div>
        )}
        {note && (
          <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>{note}</div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage({ params }: { params: { trackingId: string } }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/delivery/${params.trackingId}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setDelivery(data.delivery);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [params.trackingId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue", fontSize: 48, color: "var(--orange)", marginBottom: 16 }}>
          DropsEx
        </div>
        <div className="mono" style={{ color: "var(--muted)", fontSize: 14 }}>
          Loading your delivery...
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontFamily: "Bebas Neue", fontSize: 80, color: "var(--orange)", lineHeight: 1 }}>404</div>
        <div style={{ fontFamily: "Bebas Neue", fontSize: 28, marginBottom: 12 }}>Tracking ID Not Found</div>
        <p style={{ color: "var(--muted)", marginBottom: 28, fontFamily: "DM Mono", fontSize: 14 }}>
          {params.trackingId} doesn't match any delivery. Check the ID and try again.
        </p>
        <Link href="/">
          <button className="btn-primary">Back to DropsEx</button>
        </Link>
      </div>
    </div>
  );

  if (!delivery) return null;

  const color = STATUS_COLORS[delivery.status];
  const historyMap = Object.fromEntries(
    delivery.statusHistory.map(h => [h.status, h])
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>

      {/* HEADER */}
      <div style={{
        background: color + "11", borderBottom: `1px solid ${color}33`,
        padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, background: "var(--orange)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 12 }}>DX</span>
          </div>
          <span style={{ fontFamily: "Bebas Neue", fontSize: 16 }}>DropsEx</span>
        </Link>
        <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          Auto-refreshes every 30s
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>

        {/* STATUS HERO */}
        <div style={{
          background: color + "11", border: `1px solid ${color}33`,
          borderRadius: 16, padding: "36px 32px", marginBottom: 32, textAlign: "center"
        }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 32px ${color}55` }}>
            <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 32 }}>
              {delivery.status === "delivered" ? "✓" : delivery.status === "failed" ? "!" : "•"}
            </span>
          </div>
          <div style={{ fontFamily: "Bebas Neue", fontSize: 42, color, letterSpacing: "0.03em", marginBottom: 8 }}>
            {STATUS_LABELS[delivery.status]}
          </div>
          <div className="mono" style={{ fontSize: 16, color: "var(--muted)", marginBottom: 4 }}>
            {delivery.trackingId}
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            {delivery.itemDescription}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {/* DELIVERY INFO */}
          <div style={{
            background: "var(--gray)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 22
          }}>
            <div className="label" style={{ marginBottom: 16 }}>Delivery Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="label" style={{ fontSize: 10, marginBottom: 4 }}>From</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{delivery.pickupAddress}</div>
              </div>
              <div style={{ height: 1, background: "var(--border)" }} />
              <div>
                <div className="label" style={{ fontSize: 10, marginBottom: 4 }}>To</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{delivery.deliveryAddress}</div>
              </div>
            </div>
          </div>

          {/* RECIPIENT INFO */}
          <div style={{
            background: "var(--gray)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 22
          }}>
            <div className="label" style={{ marginBottom: 16 }}>Recipient</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="label" style={{ fontSize: 10, marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{delivery.recipientName}</div>
              </div>
              <div style={{ height: 1, background: "var(--border)" }} />
              <div>
                <div className="label" style={{ fontSize: 10, marginBottom: 4 }}>Phone</div>
                <div className="mono" style={{ fontSize: 14 }}>{delivery.recipientPhone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div style={{
          background: "var(--gray)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "28px 28px 8px"
        }}>
          <div className="label" style={{ marginBottom: 24 }}>Delivery Timeline</div>
          {STATUS_ORDER.map(s => (
            <TimelineStep
              key={s}
              status={s}
              currentStatus={delivery.status === "failed" ? "pending" : delivery.status}
              timestamp={historyMap[s]?.timestamp}
              note={historyMap[s]?.note}
            />
          ))}
          {delivery.status === "failed" && (
            <div style={{
              background: "#ff174411", border: "1px solid #ff174433",
              borderRadius: 8, padding: "14px 16px", marginTop: 8, marginBottom: 20
            }}>
              <div style={{ color: "#ff1744", fontWeight: 700, marginBottom: 4 }}>Delivery Failed</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {historyMap["failed"]?.note || "Please contact the business for details."}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 40, color: "var(--muted)", fontSize: 13 }}>
          <span style={{ fontFamily: "DM Mono" }}>Powered by </span>
          <span style={{ fontFamily: "Bebas Neue", fontSize: 16, color: "var(--orange)" }}>DropsEx</span>
          <span style={{ fontFamily: "DM Mono" }}> — {delivery.clientName}</span>
        </div>
      </div>
    </div>
  );
}
