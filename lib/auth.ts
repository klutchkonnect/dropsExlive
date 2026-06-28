import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSession, Business } from "./dynamodb";

// Salted scrypt password hashing. Format: "<saltHex>:<hashHex>".
// A global pepper (AUTH_SECRET) is mixed in if provided.
const PEPPER = process.env.AUTH_SECRET || "dropsex-secret";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password + PEPPER, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const derived = scryptSync(password + PEPPER, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

// Strip the password hash before sending a Business object to any client.
export function sanitizeBusiness(business: Business): Omit<Business, "passwordHash"> {
  const { passwordHash, ...safe } = business;
  return safe;
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("dropsex_session")?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tunji@dropsex.com";
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
