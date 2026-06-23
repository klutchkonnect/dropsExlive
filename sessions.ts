/**
 * Sessions layer — uses Supabase for lightweight auth token storage.
 * Keeps DynamoDB focused on business data (deliveries, businesses).
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Session {
  session_id:  string;
  business_id: string;
  is_admin:    boolean;
  created_at:  string;
  expires_at:  string;
}

export async function createSession(business_id: string, is_admin = false): Promise<Session> {
  const { v4: uuid } = await import("uuid");
  const session: Session = {
    session_id:  uuid(),
    business_id,
    is_admin,
    created_at:  new Date().toISOString(),
    expires_at:  new Date(Date.now() + 7 * 86400000).toISOString(),
  };
  const { error } = await supabase.from("sessions").insert(session);
  if (error) throw new Error(error.message);
  return session;
}

export async function getSession(session_id: string): Promise<Session|null> {
  const { data } = await supabase
    .from("sessions")
    .select()
    .eq("session_id", session_id)
    .gt("expires_at", new Date().toISOString())
    .single();
  return data || null;
}

export async function deleteSession(session_id: string) {
  await supabase.from("sessions").delete().eq("session_id", session_id);
}

// Keepalive ping — called by cron
export async function pingSupabase(): Promise<{ ok: boolean; ms: number }> {
  const start = Date.now();
  const { error } = await supabase.from("sessions").select("session_id", { count:"exact", head:true });
  return { ok: !error, ms: Date.now() - start };
}
