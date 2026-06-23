#!/usr/bin/env node
// Generate your admin password hash.
// Run: AUTH_SECRET=your_secret node scripts/gen-password-hash.js yourpassword
// Then paste the output as ADMIN_PASSWORD_HASH in Vercel env vars.

const { createHash } = require("crypto");

const password = process.argv[2];
const secret = process.env.AUTH_SECRET || "dropsex-secret";

if (!password) {
  console.log("Usage: AUTH_SECRET=your_secret node scripts/gen-password-hash.js yourpassword");
  process.exit(1);
}

const hash = createHash("sha256").update(password + secret).digest("hex");
console.log("\nYour ADMIN_PASSWORD_HASH:");
console.log(hash);
console.log("\nAdd this to Vercel environment variables as ADMIN_PASSWORD_HASH");
