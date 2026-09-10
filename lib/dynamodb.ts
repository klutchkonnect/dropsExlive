// Shared tracking data-access layer backed by Supabase (Postgres).
//
// This file keeps its original name and exported API so the rest of the app
// (and the DynamoDB-era imports) continue to work unchanged. Internally it now
// talks to the shared Supabase tables used by BOTH the DropsEx app and the
// external Klutch Konnect site. Columns are snake_case in Postgres and mapped
// to the camelCase shapes the app already expects.
import { supabaseAdmin, ordersRead, requireOrdersWrite } from "./supabase";

export type DeliveryStatus = "pending" | "picked_up" | "in_transit" | "delivered" | "failed";
export type DeliverySource = "dropsex" | "klutch";

export interface Business {
  businessId: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  createdAt: string;
  isActive: boolean;
}

export interface Session {
  sessionId: string;
  businessId: string;
  isAdmin: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface Delivery {
  trackingId: string;
  clientId: string;
  clientName: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  status: DeliveryStatus;
  source: DeliverySource;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: DeliveryStatus; timestamp: string; note?: string }[];
  estimatedDelivery?: string;
}

// ---- ROW MAPPERS ----

function toBusiness(row: any): Business {
  return {
    businessId: row.business_id,
    businessName: row.business_name,
    email: row.email,
    phone: row.phone ?? "",
    address: row.address ?? "",
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    isActive: row.is_active,
  };
}

function toSession(row: any): Session {
  return {
    sessionId: row.session_id,
    businessId: row.business_id,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

// ---- STATUS VOCABULARY MAPPING ----
// The DropsEx app uses internal status keys; the shared Klutch `orders` table
// uses its own vocabulary with a CHECK constraint. Map between them so the UI
// stays unchanged while persisting valid values to the shared table.
type OrderStatus = "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled";

const TO_ORDER_STATUS: Record<DeliveryStatus, OrderStatus> = {
  pending: "confirmed",
  picked_up: "processing",
  in_transit: "dispatched",
  delivered: "delivered",
  failed: "cancelled",
};

const FROM_ORDER_STATUS: Record<OrderStatus, DeliveryStatus> = {
  confirmed: "pending",
  processing: "picked_up",
  dispatched: "in_transit",
  delivered: "delivered",
  cancelled: "failed",
};

// Maps an internal delivery status to the per-status timestamp column it sets.
const STATUS_TS_COLUMN: Record<DeliveryStatus, string | null> = {
  pending: "confirmed_at",
  picked_up: "processing_at",
  in_transit: "dispatched_at",
  delivered: "delivered_at",
  failed: null, // orders has no cancelled_at column; we fall back to updated_at
};

// Reconstruct the app's statusHistory[] from the orders row's *_at timestamps.
function historyFromRow(row: any): { status: DeliveryStatus; timestamp: string; note?: string }[] {
  const steps: { col: string; status: DeliveryStatus }[] = [
    { col: "confirmed_at", status: "pending" },
    { col: "processing_at", status: "picked_up" },
    { col: "dispatched_at", status: "in_transit" },
    { col: "delivered_at", status: "delivered" },
  ];
  const history: { status: DeliveryStatus; timestamp: string; note?: string }[] = steps
    .filter((s) => row[s.col])
    .map((s) => ({ status: s.status, timestamp: row[s.col] as string }));
  if (row.status === "cancelled") {
    history.push({ status: "failed", timestamp: row.updated_at || row.created_at });
  }
  // Always guarantee at least the creation entry.
  if (history.length === 0) {
    history.push({ status: "pending", timestamp: row.created_at, note: "Order created" });
  }
  return history;
}

function toDelivery(row: any): Delivery {
  return {
    trackingId: row.tracking_id,
    clientId: row.client_id ?? "",
    clientName: row.client_name ?? "Klutch Konnect",
    recipientName: row.customer_name ?? "",
    recipientPhone: row.phone ?? "",
    pickupAddress: row.pickup_address ?? "",
    deliveryAddress: row.delivery_address ?? "",
    itemDescription: row.product ?? "",
    status: FROM_ORDER_STATUS[(row.status as OrderStatus)] ?? "pending",
    source: (row.source as DeliverySource) ?? "klutch",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    statusHistory: historyFromRow(row),
    estimatedDelivery: row.eta ?? undefined,
  };
}

// ---- BUSINESS AUTH ----

export async function createBusiness(
  data: Omit<Business, "businessId" | "createdAt" | "isActive">,
): Promise<Business> {
  const { data: row, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      business_name: data.businessName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      password_hash: data.passwordHash,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toBusiness(row);
}

export async function getBusinessByEmail(email: string): Promise<Business | null> {
  const { data: row, error } = await supabaseAdmin
    .from("businesses")
    .select()
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return row ? toBusiness(row) : null;
}

export async function getBusinessById(businessId: string): Promise<Business | null> {
  const { data: row, error } = await supabaseAdmin
    .from("businesses")
    .select()
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return row ? toBusiness(row) : null;
}

export async function listBusinesses(): Promise<Business[]> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select()
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toBusiness);
}

// ---- SESSIONS ----

export async function createSession(businessId: string, isAdmin = false): Promise<Session> {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const { data: row, error } = await supabaseAdmin
    .from("sessions")
    .insert({ business_id: businessId, is_admin: isAdmin, expires_at: expires.toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toSession(row);
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data: row, error } = await supabaseAdmin
    .from("sessions")
    .select()
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;
  const session = toSession(row);
  if (new Date(session.expiresAt) < new Date()) {
    // Lazily clean up expired sessions.
    await deleteSession(sessionId);
    return null;
  }
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabaseAdmin.from("sessions").delete().eq("session_id", sessionId);
}

// ---- DELIVERIES (shared Klutch `orders` table) ----

// Generate a unique KLUTCH-XXXXXX tracking id, matching the live site's format.
async function generateTrackingId(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 8; attempt++) {
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    const trackingId = "KLUTCH-" + suffix;
    const { data } = await ordersRead
      .from("orders")
      .select("tracking_id")
      .eq("tracking_id", trackingId)
      .maybeSingle();
    if (!data) return trackingId;
  }
  // Extremely unlikely fallback.
  return "KLUTCH-" + Date.now().toString(36).toUpperCase().slice(-6);
}

export async function createDelivery(
  data: Omit<Delivery, "trackingId" | "createdAt" | "updatedAt" | "statusHistory" | "status" | "source"> &
    Partial<Pick<Delivery, "source">>,
): Promise<Delivery> {
  const db = requireOrdersWrite();
  const trackingId = await generateTrackingId();
  const now = new Date().toISOString();
  const { data: row, error } = await db
    .from("orders")
    .insert({
      tracking_id: trackingId,
      customer_name: data.recipientName,
      phone: data.recipientPhone,
      product: data.itemDescription,
      delivery_address: data.deliveryAddress,
      eta: data.estimatedDelivery ?? null,
      status: "confirmed",
      confirmed_at: now,
      updated_at: now,
      // shared-tracking metadata columns (added for DropsEx)
      source: data.source ?? "dropsex",
      client_id: data.clientId || null,
      client_name: data.clientName || null,
      pickup_address: data.pickupAddress || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toDelivery(row);
}

export async function getDelivery(trackingId: string): Promise<Delivery | null> {
  const { data: row, error } = await ordersRead
    .from("orders")
    .select()
    .eq("tracking_id", trackingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return row ? toDelivery(row) : null;
}

export async function updateDeliveryStatus(
  trackingId: string,
  status: DeliveryStatus,
  note?: string,
): Promise<Delivery | null> {
  const db = requireOrdersWrite();
  const existing = await getDelivery(trackingId);
  if (!existing) return null;
  const now = new Date().toISOString();

  const update: Record<string, any> = {
    status: TO_ORDER_STATUS[status],
    updated_at: now,
  };
  // Stamp the matching per-status timestamp (note is implicit in this schema).
  const tsCol = STATUS_TS_COLUMN[status];
  if (tsCol) update[tsCol] = now;

  const { data: row, error } = await db
    .from("orders")
    .update(update)
    .eq("tracking_id", trackingId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toDelivery(row);
}

export async function listDeliveries(clientId?: string): Promise<Delivery[]> {
  let query = ordersRead.from("orders").select().order("created_at", { ascending: false });
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toDelivery);
}
