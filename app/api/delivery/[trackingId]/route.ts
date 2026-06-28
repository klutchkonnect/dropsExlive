import { NextRequest, NextResponse } from "next/server";
import { getDelivery, updateDeliveryStatus, getSession, DeliveryStatus } from "@/lib/dynamodb";

export async function GET(_req: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    const delivery = await getDelivery(params.trackingId);
    if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    return NextResponse.json({ delivery });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    // Require an authenticated session — only the owning business or an admin may update status.
    const sessionId = req.cookies.get("dropsex_session")?.value;
    if (!sessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await getSession(sessionId);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await getDelivery(params.trackingId);
    if (!existing) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    if (!session.isAdmin && existing.clientId !== session.businessId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, note } = await req.json();
    const validStatuses: DeliveryStatus[] = ["pending", "picked_up", "in_transit", "delivered", "failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const delivery = await updateDeliveryStatus(params.trackingId, status as DeliveryStatus, note);
    if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    return NextResponse.json({ delivery });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
