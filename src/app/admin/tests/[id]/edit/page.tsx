"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Trash2, Loader2 } from "lucide-react";

interface ScoringRule {
  min: number;
  max: number;
  resultText: string;
  status: "GOOD" | "AVERAGE" | "BAD";
}

const card = { background:"rgba(15,23,42,0.85)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"28px" };
const inputStyle = { width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#ffffff", fontSize:"0.9rem", outline:"none", boxSizing:"border-box" as const };
const labelStyle = { display:"block", fontSize:"0.75rem", fontWeight:600 as const, color:"#94a3b8", marginBottom:"6px", textTransform:"uppercase" as const, letterSpacing:"0.05em" };

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<ScoringRule[]>([]);

  useEffect(() => {
    fetch(`/api/admin/tests/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const t = data.data;
          setTitle(t.title);
          setSlug(t.slug);
          setPrice(t.price || 0);
          setDescription(t.description || "");
          setRules(t.scoringRules || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateRule = (i: number, field: keyof ScoringRule, value: any) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    setRules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, price: Number(price), description, scoringRules: rules }),
      });
      const data = await res.json();
      if (data.success) router.push("/admin");
      else setError(data.error);
    } catch {
      setError("Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 size={26} color="#7c9eff" style={{ animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", padding:"32px 20px" }}>
      <div style={{ maxWidth:"720px", margin:"0 auto" }}>
        <Link href="/admin" style={{ display:"inline-flex", alignItems:"center", gap:"8px", color:"#64748b", textDecoration:"none", fontSize:"0.875rem", marginBottom:"28px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>
        <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:"#ffffff", marginBottom:"28px", letterSpacing:"-0.02em" }}>Тест засах</h1>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          <div style={card}>
            <h2 style={{ color:"#ffffff", fontWeight:700, marginBottom:"20px", fontSize:"0.95rem" }}>Үндсэн мэдээлэл</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div><label style={labelStyle}>Гарчиг *</label><input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div><label style={labelStyle}>Slug (URL) *</label><input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} required /></div>
              <div><label style={labelStyle}>Үнэ (₮)</label><input style={inputStyle} type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} /></div>
              <div><label style={labelStyle}>Тайлбар</label><textarea style={{ ...inputStyle, minHeight:"80px", resize:"vertical" }} value={description} onChange={e => setDescription(e.target.value)} /></div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
              <h2 style={{ color:"#ffffff", fontWeight:700, fontSize:"0.95rem" }}>Scoring Rules</h2>
              <button type="button" onClick={() => setRules([...rules, { min:0, max:0, resultText:"", status:"GOOD" }])} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"6px 12px", background:"rgba(124,158,255,0.1)", border:"1px solid rgba(124,158,255,0.2)", borderRadius:"8px", color:"#7c9eff", fontSize:"0.8rem", cursor:"pointer", fontWeight:600 }}>
                <PlusCircle size={13} /> Нэмэх
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {rules.map((rule, i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"16px" }}>
                  <div style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
                    <div style={{ flex:1 }}><label style={labelStyle}>Мин</label><input style={inputStyle} type="number" value={rule.min} onChange={e => updateRule(i,"min",Number(e.target.value))} /></div>
                    <div style={{ flex:1 }}><label style={labelStyle}>Макс</label><input style={inputStyle} type="number" value={rule.max} onChange={e => updateRule(i,"max",Number(e.target.value))} /></div>
                    <div style={{ flex:1 }}><label style={labelStyle}>Статус</label>
                      <select style={inputStyle} value={rule.status} onChange={e => updateRule(i,"status",e.target.value)}>
                        <option value="GOOD">GOOD ✅</option><option value="AVERAGE">AVERAGE ⚠️</option><option value="BAD">BAD ❌</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"10px" }}>
                    <div style={{ flex:1 }}><label style={labelStyle}>Дүгнэлт текст</label><textarea style={{ ...inputStyle, minHeight:"72px", resize:"vertical" }} value={rule.resultText} onChange={e => updateRule(i,"resultText",e.target.value)} /></div>
                    {rules.length > 1 && <button type="button" onClick={() => setRules(rules.filter((_,idx) => idx !== i))} style={{ marginTop:"22px", padding:"8px", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:"8px", color:"#f87171", cursor:"pointer", flexShrink:0 }}><Trash2 size={15} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:"10px", padding:"12px 16px", color:"#f87171", fontSize:"0.875rem" }}>{error}</div>}
          <button type="submit" disabled={saving} style={{ padding:"15px", borderRadius:"12px", background:saving ? "rgba(255,255,255,0.1)" : "#ffffff", color:saving ? "#475569" : "#0a0d17", fontWeight:700, fontSize:"1rem", border:"none", cursor:saving ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            {saving ? <><Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} /> Хадгалж байна...</> : "Хадгалах"}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } select option { background: #0f172a; } textarea::placeholder, input::placeholder { color: #334155; }`}</style>
    </div>
  );
}
