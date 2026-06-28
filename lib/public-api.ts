import { NextRequest, NextResponse } from "next/server";

// Shared helpers for the public cross-app tracking API consumed by the
// external Klutch Konnect site (GitHub Pages) and any other allowed origin.

// Origins are compared without a trailing slash, since a browser `Origin`
// header never includes one (e.g. "https://klutchkonnect.github.io").
const stripSlash = (o: string) => o.replace(/\/+$/, "");

// Comma-separated list of allowed origins, e.g.
// "https://klutchkonnect.github.io,https://klutchkonnect.com"
const ALLOWED_ORIGINS = (process.env.KLUTCH_ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => stripSlash(o.trim()))
  .filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  // No allow-list configured: permit any origin (open public tracking API).
  if (ALLOWED_ORIGINS.length === 0) {
    headers["Access-Control-Allow-Origin"] = origin ? stripSlash(origin) : "*";
    return headers;
  }

  // Allow-list configured: only echo the origin back if it matches.
  // For disallowed origins we omit the header entirely so the browser blocks it.
  if (origin && ALLOWED_ORIGINS.includes(stripSlash(origin))) {
    headers["Access-Control-Allow-Origin"] = stripSlash(origin);
  }
  return headers;
}

export function jsonWithCors(req: NextRequest, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(req.headers.get("origin")) });
}

export function preflight(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

// Writes (creating a delivery from the Klutch site) require a shared API key.
// Reads (public tracking lookups) do not.
export function hasValidApiKey(req: NextRequest): boolean {
  const expected = process.env.KLUTCH_API_KEY;
  if (!expected) return false;
  return req.headers.get("x-api-key") === expected;
}
