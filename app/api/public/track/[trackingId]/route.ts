import { NextRequest } from "next/server";
import { getDelivery } from "@/lib/dynamodb";
import { jsonWithCors, preflight } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Public, CORS-enabled tracking lookup. Safe for the external Klutch site to
// call directly from the browser. Returns only customer-facing fields.
export async function GET(req: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    const delivery = await getDelivery(params.trackingId.toUpperCase());
    if (!delivery) return jsonWithCors(req, { error: "Tracking ID not found" }, 404);

    // Expose only what a recipient needs to see — no internal client identifiers.
    return jsonWithCors(req, {
      delivery: {
        trackingId: delivery.trackingId,
        status: delivery.status,
        source: delivery.source,
        recipientName: delivery.recipientName,
        deliveryAddress: delivery.deliveryAddress,
        itemDescription: delivery.itemDescription,
        statusHistory: delivery.statusHistory,
        estimatedDelivery: delivery.estimatedDelivery ?? null,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      },
    });
  } catch (e: any) {
    return jsonWithCors(req, { error: e.message }, 500);
  }
}
