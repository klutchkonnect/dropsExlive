import { createHash } from "crypto";

export function hashPassword(password: string): string {
  const secret = process.env.AUTH_SECRET || "klutch-dropsex-secret";
  return createHash("sha256").update(password + secret).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const ADMIN_EMAIL         = process.env.ADMIN_EMAIL || "tunjiodus93@icloud.com";
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
