"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface HistoryItem {
  _id: string;
  testId: { title: string; slug: string; price: number };
  totalScore: number;
  resultStatus: string;
  paymentStatus: "PENDING" | "PAID";
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HistoryItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 6) {
      setError("Утасны дугаараа зөв оруулна уу.");
      return;
    }
    
    setError("");
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/results/history?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || "Алдаа гарлаа.");
      }
    } catch (err) {
      setError("Холболтын алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontSize: "0.875rem", marginBottom: "32px", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
          <ArrowLeft size={16} /> Нүүр хуудас руу буцах
        </Link>

        <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px", boxShadow: "0 0 80px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em" }}>Миний түүх</h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>SMS илгээж баталгаажуулсан утасны дугаараа оруулан өмнөх үр дүнгүүдээ шалгах боломжтой.</p>
          </div>

          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 600 }}>+976</span>
              <input 
                type="tel" 
                placeholder="Утасны дугаар..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={8}
                style={{ width: "100%", padding: "16px 16px 16px 64px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#ffffff", fontSize: "1.1rem", outline: "none", transition: "all 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "#7c9eff"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            
            {error && <div style={{ color: "#f87171", fontSize: "0.85rem", textAlign: "center" }}>{error}</div>}

            <button 
              type="submit" 
              disabled={loading || phone.length < 6}
              style={{ width: "100%", padding: "16px", background: loading || phone.length < 6 ? "rgba(124,158,255,0.5)" : "#7c9eff", color: "#0f172a", border: "none", borderRadius: "16px", fontSize: "1rem", fontWeight: 700, cursor: loading || phone.length < 6 ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
            >
              {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={20} />}
              Шалгах
            </button>
          </form>

          {hasSearched && !loading && results.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
              <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "50%", marginBottom: "16px" }}>
                <Search size={32} opacity={0.5} />
              </div>
              <p>Таны оруулсан дугаар дээр бүртгэлтэй түүх олдсонгүй.</p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: 700, paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Олдсон үр дүнгүүд ({results.length})</h3>
              
              {results.map((sub) => (
                <div key={sub._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h4 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>{sub.testId?.title || "Тодорхойгүй тест"}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#64748b" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> <span suppressHydrationWarning>{new Date(sub.createdAt).toLocaleDateString("mn-MN")}</span>
                        </span>
                        <span>Оноо: <strong style={{ color: "#cbd5e1" }}>{sub.totalScore}</strong></span>
                      </div>
                    </div>
                    
                    <span style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, background: sub.paymentStatus === "PAID" ? "rgba(134,239,172,0.1)" : "rgba(250,204,21,0.1)", color: sub.paymentStatus === "PAID" ? "#86efac" : "#facc15" }}>
                      {sub.paymentStatus === "PAID" ? "ТӨЛБӨР ТӨЛӨГДСӨН" : "ТӨЛБӨР ХҮЛЭЭГДЭЖ БУЙ"}
                    </span>
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    {sub.paymentStatus === "PAID" ? (
                      <button 
                        onClick={() => router.push(`/submission/${sub._id}/result`)}
                        style={{ width: "100%", padding: "12px", background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.2)", color: "#86efac", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(134,239,172,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(134,239,172,0.1)"}
                      >
                        <CheckCircle2 size={16} /> Үр дүн дэлгэрэнгүй үзэх
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/submission/${sub._id}`)}
                        style={{ width: "100%", padding: "12px", background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.2)", color: "#facc15", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(250,204,21,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(250,204,21,0.1)"}
                      >
                        <AlertCircle size={16} /> Төлбөр гүйцээж үр дүн харах
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
