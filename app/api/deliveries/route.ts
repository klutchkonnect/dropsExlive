import { NextRequest, NextResponse } from "next/server";
import { createDelivery, listDeliveries, getSession, getBusinessById } from "@/lib/dynamodb";

async function getAuth(req: NextRequest) {
  const sessionId = req.cookies.get("dropsex_session")?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuth(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const clientId = session.isAdmin ? undefined : session.businessId;
    const deliveries = await listDeliveries(clientId);
    return NextResponse.json({ deliveries });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuth(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipientName, recipientPhone, pickupAddress, deliveryAddress, itemDescription, estimatedDelivery } = body;
    if (!recipientName || !recipientPhone || !pickupAddress || !deliveryAddress || !itemDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let clientId = session.businessId;
    let clientName = "DropsEx Admin";
    if (!session.isAdmin) {
      const business = await getBusinessById(session.businessId);
      clientName = business?.businessName || "Business";
    }

    const delivery = await createDelivery({ clientId, clientName, recipientName, recipientPhone, pickupAddress, deliveryAddress, itemDescription, estimatedDelivery });
    return NextResponse.json({ delivery }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
