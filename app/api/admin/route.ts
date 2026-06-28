import { NextRequest, NextResponse } from "next/server";
import { getSession, listBusinesses, listDeliveries } from "@/lib/dynamodb";
import { sanitizeBusiness } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("dropsex_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSession(sessionId);
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [businesses, deliveries] = await Promise.all([listBusinesses(), listDeliveries()]);
  // Never expose password hashes to the client.
  return NextResponse.json({ businesses: businesses.map(sanitizeBusiness), deliveries });
}
