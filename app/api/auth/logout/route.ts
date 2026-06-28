import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/dynamodb";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("dropsex_session")?.value;
  if (sessionId) await deleteSession(sessionId);
  const res = NextResponse.json({ success: true });
  res.cookies.delete("dropsex_session");
  return res;
}
