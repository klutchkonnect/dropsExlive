#!/usr/bin/env node
// Generate your admin password hash (salted scrypt).
// Run: AUTH_SECRET=your_secret node scripts/gen-password-hash.js yourpassword
// Then paste the output as ADMIN_PASSWORD_HASH in Vercel env vars.
// IMPORTANT: use the SAME AUTH_SECRET here and in your deployment.

const { scryptSync, randomBytes } = require("crypto");

const password = process.argv[2];
const pepper = process.env.AUTH_SECRET || "dropsex-secret";

if (!password) {
  console.log("Usage: AUTH_SECRET=your_secret node scripts/gen-password-hash.js yourpassword");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const derived = scryptSync(password + pepper, salt, 64).toString("hex");
const hash = `${salt}:${derived}`;

console.log("\nYour ADMIN_PASSWORD_HASH:");
console.log(hash);
console.log("\nAdd this to Vercel environment variables as ADMIN_PASSWORD_HASH");
console.log("(Make sure AUTH_SECRET matches the one used here.)");
