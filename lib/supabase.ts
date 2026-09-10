import { createClient } from "@supabase/supabase-js";

// ============================================================================
//  TWO SUPABASE PROJECTS
//  ----------------------------------------------------------------------------
//  1) DropsEx project  -> business accounts + sessions (this app's own auth).
//     Uses the v0-injected SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
//  2) Klutch Konnect project -> the SHARED `orders` table that is the single
//     source of truth for delivery tracking across BOTH the DropsEx app and the
//     live klutchkonnect.com site (track.html / admin.html).
//       - READS go through the public anon key (already public in the Klutch
//         GitHub repo) so tracking works with zero extra configuration.
//       - WRITES (create / update order) require the Klutch project's
//         service-role key, set as KLUTCH_SUPABASE_SERVICE_ROLE_KEY.
//
//  These are server-only clients and must never be imported into client
//  components.
// ============================================================================

// ---- 1) DropsEx project (auth: businesses + sessions) ----
const dropsexUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUB_SUPABASE_URL ||
  process.env.NEXT_SUPABASE_URL ||
  process.env._SUPABASE_URL;
const dropsexServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dropsexUrl || !dropsexServiceKey) {
  throw new Error(
    "DropsEx Supabase is not configured: provide a Supabase URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

export const supabaseAdmin = createClient(dropsexUrl, dropsexServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---- 2) Klutch Konnect project (shared `orders` table) ----
// URL + anon key are public information (they ship in the Klutch site's repo),
// so we default to them and allow env overrides.
const KLUTCH_URL = process.env.KLUTCH_SUPABASE_URL || "https://nxenzogwsqiihdxkqric.supabase.co";
const KLUTCH_ANON_KEY =
  process.env.KLUTCH_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZW56b2d3c3FpaWhkeGtxcmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzI2NjIsImV4cCI6MjA5NDYwODY2Mn0.c_ZcTTv29ha8Db_wJoEeM9Ekm3Z9nNvaiIang14e6pU";
const KLUTCH_SERVICE_KEY = process.env.KLUTCH_SUPABASE_SERVICE_ROLE_KEY;

// Read-only client for public tracking lookups (anon key, RLS-restricted to SELECT).
export const ordersRead = createClient(KLUTCH_URL, KLUTCH_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Privileged client for creating / updating orders. Null until the service-role
// key is configured; callers must handle that and surface a clear error.
export const ordersWrite = KLUTCH_SERVICE_KEY
  ? createClient(KLUTCH_URL, KLUTCH_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export function requireOrdersWrite() {
  if (!ordersWrite) {
    throw new Error(
      "Order writes are not configured: set KLUTCH_SUPABASE_SERVICE_ROLE_KEY (the Klutch project's service-role key) to create or update deliveries.",
    );
  }
  return ordersWrite;
}
