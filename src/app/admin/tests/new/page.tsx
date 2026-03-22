"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Trash2, Save, Loader2, CheckCircle } from "lucide-react";
import { iconMap } from "@/app/TestGrid";

interface ScoringRule {
  min: number;
  max: number;
  resultText: string;
  status: "GOOD" | "AVERAGE" | "BAD";
}

const card = {
  background: "rgba(15,23,42,0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "20px",
  padding: "28px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600 as const,
  color: "#94a3b8",
  marginBottom: "6px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

export default function NewTestPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [order, setOrder] = useState(0);
  const [icon, setIcon] = useState("Brain");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<ScoringRule[]>([
    { min: 0, max: 7, resultText: "", status: "GOOD" },
    { min: 8, max: 14, resultText: "", status: "AVERAGE" },
    { min: 15, max: 21, resultText: "", status: "BAD" },
  ]);

  const autoSlug = (v: string) => {
    setTitle(v);
    if (!slug) setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const updateRule = (i: number, field: keyof ScoringRule, value: any) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    setRules(updated);
  };

  const addRule = () => setRules([...rules, { min: 0, max: 0, resultText: "", status: "GOOD" }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, price: Number(price), order: Number(order), icon, description, scoringRules: rules }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontSize: "0.875rem", marginBottom: "28px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>

        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginBottom: "28px", letterSpacing: "-0.02em" }}>Шинэ тест үүсгэх</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Basic Info */}
          <div style={card}>
            <h2 style={{ color: "#ffffff", fontWeight: 700, marginBottom: "20px", fontSize: "0.95rem" }}>Үндсэн мэдээлэл</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Гарчиг *</label>
                <input style={inputStyle} value={title} onChange={e => autoSlug(e.target.value)} placeholder="Аутизмын оношилгоо" required />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL) *</label>
                <input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="autism-test" required />
              </div>
              <div>
                <label style={labelStyle}>Үнэ (₮)</label>
                <input style={inputStyle} type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Дараалал (Эрэмбэ)</label>
                  <input style={inputStyle} type="number" value={order} onChange={e => setOrder(Number(e.target.value))} placeholder="Бага тоотой нь эхэнд харагдана" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Icon (Зураг Сонгох)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {Object.keys(iconMap).map(key => {
                      const Icon = iconMap[key];
                      const isSelected = icon === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setIcon(key)}
                          style={{
                            padding: "8px", borderRadius: "8px",
                            border: isSelected ? "2px solid #7c9eff" : "1px solid transparent",
                            background: isSelected ? "rgba(124,158,255,0.15)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s"
                          }}
                          title={key}
                        >
                          <Icon size={20} color={isSelected ? "#ffffff" : "#64748b"} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Тайлбар</label>
                <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Тестийн товч тайлбар..." />
              </div>
            </div>
          </div>

          {/* Scoring Rules */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem" }}>Оноотой дүрмүүд (Scoring Rules)</h2>
              <button type="button" onClick={addRule} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "rgba(124,158,255,0.1)", border: "1px solid rgba(124,158,255,0.2)", borderRadius: "8px", color: "#7c9eff", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                <PlusCircle size={13} /> Дүрэм нэмэх
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {rules.map((rule, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Мин оноо</label>
                      <input style={inputStyle} type="number" value={rule.min} onChange={e => updateRule(i, "min", Number(e.target.value))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Макс оноо</label>
                      <input style={inputStyle} type="number" value={rule.max} onChange={e => updateRule(i, "max", Number(e.target.value))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Статус</label>
                      <select style={inputStyle} value={rule.status} onChange={e => updateRule(i, "status", e.target.value)}>
                        <option value="GOOD">GOOD ✅</option>
                        <option value="AVERAGE">AVERAGE ⚠️</option>
                        <option value="BAD">BAD ❌</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Дүгнэлт текст</label>
                      <textarea style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} value={rule.resultText} onChange={e => updateRule(i, "resultText", e.target.value)} placeholder="Энэ оноонд хүрсэн хэрэглэгчийн дүгнэлт..." />
                    </div>
                    {rules.length > 1 && (
                      <button type="button" onClick={() => removeRule(i)} style={{ marginTop: "22px", padding: "8px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", color: "#f87171", cursor: "pointer", flexShrink: 0 }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "12px 16px", color: "#f87171", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={saving} style={{ padding: "15px", borderRadius: "12px", background: saving ? "rgba(255,255,255,0.1)" : "#ffffff", color: saving ? "#475569" : "#0a0d17", fontWeight: 700, fontSize: "1rem", border: "none", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Хадгалж байна...</> : "Тест хадгалах"}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } select option { background: #0f172a; } textarea::placeholder, input::placeholder { color: #334155; }`}</style>
    </div>
  );
}
