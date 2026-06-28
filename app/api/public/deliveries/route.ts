import { NextRequest } from "next/server";
import { createDelivery } from "@/lib/dynamodb";
import { jsonWithCors, preflight, hasValidApiKey } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Lets the external Klutch Konnect site create a delivery in the shared system.
// Requires the shared API key (x-api-key header). The resulting tracking record
// is tagged source="klutch" and is immediately visible in the DropsEx dashboard,
// admin panel, and via the public tracking endpoint.
export async function POST(req: NextRequest) {
  try {
    if (!hasValidApiKey(req)) {
      return jsonWithCors(req, { error: "Invalid or missing API key" }, 401);
    }

    const body = await req.json();
    const {
      recipientName,
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      itemDescription,
      clientName,
      clientId,
      estimatedDelivery,
    } = body || {};

    if (!recipientName || !recipientPhone || !pickupAddress || !deliveryAddress || !itemDescription) {
      return jsonWithCors(req, { error: "Missing required fields" }, 400);
    }

    const delivery = await createDelivery({
      clientId: clientId || "klutch-web",
      clientName: clientName || "Klutch Konnect",
      recipientName,
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      itemDescription,
      estimatedDelivery,
      source: "klutch",
    });

    return jsonWithCors(
      req,
      { trackingId: delivery.trackingId, status: delivery.status, source: delivery.source },
      201,
    );
  } catch (e: any) {
    return jsonWithCors(req, { error: e.message }, 500);
  }
}
