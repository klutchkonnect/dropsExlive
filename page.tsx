"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Delivery, DeliveryStatus } from "@/lib/dynamo";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending:"Order Received", confirmed:"Confirmed ✓", processing:"Processing",
  dispatched:"On The Way 🏍️", delivered:"Delivered! ✅", failed:"Delivery Failed",
};
const STATUS_ICONS: Record<DeliveryStatus, string> = {
  pending:"📋", confirmed:"✅", processing:"⚙️",
  dispatched:"🏍️", delivered:"🎉", failed:"❌",
};
const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending:"#FFD23F", confirmed:"#4FC3F7", processing:"#F5A623",
  dispatched:"#a78bfa", delivered:"#3ECF8E", failed:"#FF4444",
};
const STATUS_ORDER: DeliveryStatus[] = ["pending","confirmed","processing","dispatched","delivered"];

function TimelineStep({ status, currentStatus, timestamp, note }: {
  status: DeliveryStatus; currentStatus: DeliveryStatus; timestamp?: string; note?: string;
}) {
  const stepIdx    = STATUS_ORDER.indexOf(status);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus === "failed" ? "pending" : currentStatus);
  const isDone     = currentIdx >= stepIdx;
  const isActive   = currentIdx === stepIdx;

  return (
    <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{
          width:36, height:36, borderRadius:"50%",
          background: isDone ? STATUS_COLORS[status] : "rgba(255,255,255,0.05)",
          border:`2px solid ${isDone ? STATUS_COLORS[status] : "rgba(255,255,255,0.1)"}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:15,
          boxShadow: isActive ? `0 0 20px ${STATUS_COLORS[status]}55` : "none",
          transition:"all 0.3s"
        }}>
          {isDone ? STATUS_ICONS[status] : <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.15)" }} />}
        </div>
        {status !== "delivered" && (
          <div style={{ width:2, height:40, marginTop:4, background: isDone && currentIdx > stepIdx ? STATUS_COLORS[status] : "rgba(255,255,255,0.08)" }} />
        )}
      </div>
      <div style={{ paddingBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color: isDone ? "#fff" : "rgba(255,255,255,0.3)", marginBottom:4 }}>
          {STATUS_LABELS[status]}
          {isActive && (
            <span style={{ marginLeft:10, fontSize:10, fontFamily:"DM Mono", color:STATUS_COLORS[status], background:STATUS_COLORS[status]+"22", padding:"3px 8px", borderRadius:20 }}>NOW</span>
          )}
        </div>
        {timestamp && (
          <div style={{ fontFamily:"DM Mono", fontSize:11, color:"rgba(255,255,255,0.35)" }}>
            {new Date(timestamp).toLocaleString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
          </div>
        )}
        {note && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontStyle:"italic", marginTop:3 }}>{note}</div>}
      </div>
    </div>
  );
}

export default function TrackPage({ params }: { params: { trackingId: string } }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading,  setLoading]  = useState(true);
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
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [params.trackingId]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"Bebas Neue", fontSize:48, color:"#F5A623", marginBottom:12 }}>DropsEx</div>
        <div style={{ fontFamily:"DM Mono", color:"rgba(255,255,255,0.4)", fontSize:13 }}>Loading your delivery...</div>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontFamily:"Bebas Neue", fontSize:80, color:"#F5A623", lineHeight:1 }}>404</div>
        <div style={{ fontFamily:"Bebas Neue", fontSize:28, marginBottom:12 }}>Tracking ID Not Found</div>
        <p style={{ color:"rgba(255,255,255,0.4)", marginBottom:28, fontFamily:"DM Mono", fontSize:13 }}>
          {params.trackingId} doesn't match any delivery.
        </p>
        <Link href="/"><button style={{ background:"#F5A623", color:"#000", border:"none", padding:"12px 24px", borderRadius:8, fontFamily:"Syne", fontWeight:800, fontSize:14, cursor:"pointer" }}>Back to DropsEx</button></Link>
      </div>
    </div>
  );

  if (!delivery) return null;

  const color = STATUS_COLORS[delivery.status];
  const historyMap = Object.fromEntries(delivery.status_history.map(h => [h.status, h]));

  return (
    <div style={{ minHeight:"100vh", background:"#080808" }}>
      {/* HEADER */}
      <div style={{ background:color+"11", borderBottom:`1px solid ${color}33`, padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:"#F5A623", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#000", fontFamily:"Bebas Neue", fontSize:12 }}>DX</span>
          </div>
          <div>
            <div style={{ fontFamily:"Bebas Neue", fontSize:16 }}>DropsEx</div>
            <div style={{ fontFamily:"DM Mono", fontSize:8, color:"#F5A623", letterSpacing:"0.1em" }}>BY KLUTCH KONNECT</div>
          </div>
        </Link>
        <div style={{ fontFamily:"DM Mono", fontSize:11, color:"rgba(255,255,255,0.35)" }}>Auto-refreshes every 30s</div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"36px 24px" }}>
        {/* STATUS HERO */}
        <div style={{ background:color+"11", border:`1px solid ${color}33`, borderRadius:16, padding:"36px 28px", marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>{STATUS_ICONS[delivery.status]}</div>
          <div style={{ fontFamily:"Bebas Neue", fontSize:40, color, letterSpacing:"0.03em", marginBottom:8 }}>
            {STATUS_LABELS[delivery.status]}
          </div>
          <div style={{ fontFamily:"DM Mono", fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>{delivery.tracking_id}</div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>{delivery.item_description}</div>
        </div>

        {/* INFO CARDS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
          <div style={{ background:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
            <div style={{ fontFamily:"DM Mono", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.35)", marginBottom:14 }}>Delivery Info</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4, textTransform:"uppercase" }}>From</div>
              <div style={{ fontSize:13, lineHeight:1.5 }}>{delivery.pickup_address}</div>
            </div>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:12 }} />
            <div>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4, textTransform:"uppercase" }}>To</div>
              <div style={{ fontSize:13, lineHeight:1.5 }}>{delivery.delivery_address}</div>
              {delivery.delivery_zone && <div style={{ fontSize:11, color:"#F5A623", fontFamily:"DM Mono", marginTop:4 }}>📍 {delivery.delivery_zone}</div>}
            </div>
          </div>
          <div style={{ background:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:20 }}>
            <div style={{ fontFamily:"DM Mono", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.35)", marginBottom:14 }}>Recipient</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4, textTransform:"uppercase" }}>Name</div>
              <div style={{ fontSize:15, fontWeight:700 }}>{delivery.recipient_name}</div>
            </div>
            <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:12 }} />
            <div>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4, textTransform:"uppercase" }}>Phone</div>
              <div style={{ fontFamily:"DM Mono", fontSize:14 }}>{delivery.recipient_phone}</div>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div style={{ background:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"24px 24px 4px" }}>
          <div style={{ fontFamily:"DM Mono", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.35)", marginBottom:24 }}>Delivery Timeline</div>
          {STATUS_ORDER.map(s => (
            <TimelineStep key={s} status={s} currentStatus={delivery.status}
              timestamp={historyMap[s]?.timestamp} note={historyMap[s]?.note} />
          ))}
          {delivery.status === "failed" && (
            <div style={{ background:"rgba(255,68,68,0.08)", border:"1px solid rgba(255,68,68,0.25)", borderRadius:8, padding:"12px 16px", marginTop:4, marginBottom:20 }}>
              <div style={{ color:"#FF4444", fontWeight:700, marginBottom:4 }}>Delivery Failed</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{historyMap["failed"]?.note || "Please contact the business for details."}</div>
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:36, color:"rgba(255,255,255,0.3)", fontSize:13 }}>
          <span style={{ fontFamily:"DM Mono" }}>Powered by </span>
          <span style={{ fontFamily:"Bebas Neue", fontSize:16, color:"#F5A623" }}>DropsEx</span>
          <span style={{ fontFamily:"DM Mono" }}> — {delivery.client_name}</span>
        </div>
      </div>
    </div>
  );
}
