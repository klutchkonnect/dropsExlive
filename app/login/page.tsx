"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.isAdmin ? "/admin" : "/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--black)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24
    }}>
      {/* LOGO */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
        <div style={{
          width: 36, height: 36, background: "var(--orange)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 16 }}>DX</span>
        </div>
        <span style={{ fontFamily: "Bebas Neue", fontSize: 24, letterSpacing: "0.05em" }}>DropsEx</span>
      </Link>

      <div style={{
        background: "var(--gray)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "40px 36px", width: "100%", maxWidth: 420
      }}>
        <h1 style={{ fontFamily: "Bebas Neue", fontSize: 32, marginBottom: 6, letterSpacing: "0.03em" }}>
          Business Login
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32, fontFamily: "DM Mono" }}>
          Sign in to your DropsEx dashboard
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Email Address</div>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@yourbusiness.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Password</div>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div style={{
              background: "#ff174422", border: "1px solid #ff174444",
              color: "#ff1744", padding: "12px 16px", borderRadius: 8,
              fontFamily: "DM Mono", fontSize: 13
            }}>{error}</div>
          )}

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, marginTop: 8, width: "100%", padding: "16px" }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </div>

        <div style={{
          marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)",
          textAlign: "center"
        }}>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
            Don't have a business account?
          </p>
          <Link href="/register">
            <button className="btn-ghost" style={{ width: "100%" }}>
              Register Your Business →
            </button>
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 24, color: "var(--muted)", fontSize: 13, fontFamily: "DM Mono" }}>
        <Link href="/" style={{ color: "var(--orange)" }}>← Back to homepage</Link>
      </p>
    </div>
  );
}
