"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", email: "", phone: "", address: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!form.businessName || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields"); return;
    }
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/login?registered=1");
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
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div style={{
          width: 36, height: 36, background: "var(--orange)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ color: "var(--black)", fontFamily: "Bebas Neue", fontSize: 16 }}>DX</span>
        </div>
        <span style={{ fontFamily: "Bebas Neue", fontSize: 24 }}>DropsEx</span>
      </Link>

      <div style={{
        background: "var(--gray)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "40px 36px", width: "100%", maxWidth: 460
      }}>
        <h1 style={{ fontFamily: "Bebas Neue", fontSize: 32, marginBottom: 6 }}>Register Your Business</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32, fontFamily: "DM Mono" }}>
          Join DropsEx and start tracking your deliveries
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "businessName", label: "Business Name *", placeholder: "e.g. Mama's Kitchen, PharmaPlus", type: "text" },
            { key: "email", label: "Business Email *", placeholder: "orders@yourbusiness.com", type: "email" },
            { key: "phone", label: "Phone Number *", placeholder: "+234 800 000 0000", type: "tel" },
            { key: "address", label: "Business Address", placeholder: "Street, area, Lagos", type: "text" },
            { key: "password", label: "Password *", placeholder: "Minimum 6 characters", type: "password" },
            { key: "confirm", label: "Confirm Password *", placeholder: "Repeat password", type: "password" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <div className="label" style={{ marginBottom: 8 }}>{label}</div>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}

          {error && (
            <div style={{
              background: "#ff174422", border: "1px solid #ff174444",
              color: "#ff1744", padding: "12px 16px", borderRadius: 8,
              fontFamily: "DM Mono", fontSize: 13
            }}>{error}</div>
          )}

          <button
            className="btn-primary"
            onClick={handleRegister}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, marginTop: 8, padding: 16 }}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--orange)" }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
