import { NextRequest, NextResponse } from "next/server";
import { getBusinessByEmail, createSession } from "@/lib/dynamodb";
import { verifyPassword, ADMIN_EMAIL, ADMIN_PASSWORD_HASH } from "@/lib/auth";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    // Check admin
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (!ADMIN_PASSWORD_HASH || !verifyPassword(password, ADMIN_PASSWORD_HASH)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const session = await createSession("admin", true);
      const res = NextResponse.json({ success: true, isAdmin: true });
      res.cookies.set("dropsex_session", session.sessionId, {
        httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // Check business
    const business = await getBusinessByEmail(email);
    if (!business) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!verifyPassword(password, business.passwordHash)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!business.isActive) return NextResponse.json({ error: "Account suspended. Contact DropsEx support." }, { status: 403 });

    const session = await createSession(business.businessId, false);
    const res = NextResponse.json({ success: true, isAdmin: false, businessName: business.businessName });
    res.cookies.set("dropsex_session", session.sessionId, {
      httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
