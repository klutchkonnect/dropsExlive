import { NextRequest, NextResponse } from "next/server";
import { getSession, getBusinessById } from "@/lib/dynamodb";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("dropsex_session")?.value;
  if (!sessionId) return NextResponse.json({ authenticated: false });
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ authenticated: false });
  if (session.isAdmin) return NextResponse.json({ authenticated: true, isAdmin: true, businessId: "admin" });
  const business = await getBusinessById(session.businessId);
  if (!business) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, isAdmin: false, businessId: business.businessId, businessName: business.businessName });
}
