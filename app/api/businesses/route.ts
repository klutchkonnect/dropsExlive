import { NextRequest, NextResponse } from "next/server";
import { createBusiness, getBusinessByEmail } from "@/lib/dynamodb";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { businessName, email, phone, address, password } = await req.json();
    if (!businessName || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const existing = await getBusinessByEmail(email);
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    const business = await createBusiness({
      businessName,
      email: email.toLowerCase(),
      phone,
      address: address || "",
      passwordHash: hashPassword(password),
    });
    return NextResponse.json({ success: true, businessId: business.businessId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
