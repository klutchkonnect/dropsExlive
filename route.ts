import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { approveDelivery } from "@/lib/dynamo";

export async function POST(req: NextRequest) {
  const id = req.cookies.get("dropsex_session")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSession(id);
  if (!session?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { trackingId } = await req.json();
  const delivery = await approveDelivery(trackingId);
  if (!delivery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ delivery });
}
