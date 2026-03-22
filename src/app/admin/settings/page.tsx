"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Save, Loader2 } from "lucide-react";

const inputStyle = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#ffffff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" as const };
const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase" as const, letterSpacing: "0.05em" };

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [qpayEnabled, setQpayEnabled] = useState(true);
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setQpayEnabled(data.data.qpayEnabled);
          setBankAccountName(data.data.bankAccountName || "");
          setBankAccountNumber(data.data.bankAccountNumber || "");
          setBankName(data.data.bankName || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qpayEnabled, bankAccountName, bankAccountNumber, bankName })
    });
    setSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} color="#7c9eff" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontSize: "0.875rem", marginBottom: "28px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginBottom: "28px", letterSpacing: "-0.02em" }}>Ерөнхий тохиргоо</h1>

        <form onSubmit={handleSave} style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>QPay төлбөр тооцоо</h2>
              <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Идэвхтэй үед хэрэглэгчид шууд QPay-р төлнө.</p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" checked={qpayEnabled} onChange={e => setQpayEnabled(e.target.checked)} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              <span style={{ marginLeft: "10px", color: qpayEnabled ? "#86efac" : "#fca5a5", fontWeight: 600 }}>{qpayEnabled ? "АСААЛТТАЙ" : "УНТРААЛТТАЙ"}</span>
            </label>
          </div>

          {!qpayEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
              <h2 style={{ color: "#fde68a", fontSize: "0.95rem", fontWeight: 600, marginBottom: "8px" }}>Дансаар шилжүүлэх үеийн мэдээлэл</h2>
              <div>
                <label style={labelStyle}>Банкны нэр</label>
                <input style={inputStyle} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Хаан банк" required={!qpayEnabled} />
              </div>
              <div>
                <label style={labelStyle}>Дансны дугаар</label>
                <input style={inputStyle} type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="5011..." required={!qpayEnabled} />
              </div>
              <div>
                <label style={labelStyle}>Хүлээн авагчийн нэр</label>
                <input style={inputStyle} value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Бат-Эрдэнэ" required={!qpayEnabled} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
            {savedMessage ? (
              <span style={{ color: "#86efac", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={16} /> Хадгалагдлаа</span>
            ) : <span />}
            <button type="submit" disabled={saving} style={{ padding: "12px 24px", borderRadius: "12px", background: saving ? "rgba(255,255,255,0.1)" : "#ffffff", color: saving ? "#475569" : "#0a0d17", fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              {saving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Хадгалж байна...</> : <><Save size={16} /> Хадгалах</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
