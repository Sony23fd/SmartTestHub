"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, CheckCircle, Clock, ExternalLink, Search, CheckCircle2 } from "lucide-react";

interface SubmissionItem {
  _id: string;
  testId: string;
  testTitle: string;
  totalScore: number;
  paymentStatus: "PENDING" | "PAID";
  resultStatus: string;
  createdAt: string;
  errorLog?: string;
}

const cardStyle = {
  background: "rgba(15,23,42,0.8)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "20px",
};

// Custom Hook for Debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: debouncedSearch,
        status,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalDocs(data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSubmissions(); 
  }, [page, debouncedSearch, status, startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ хариуг устгах уу?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
    await fetchSubmissions();
    setDeletingId(null);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Төлбөр шилжсэн гэж үзэж үр дүнг хэрэглэгчид илгээх үү?")) return;
    setApprovingId(id);
    await fetch(`/api/admin/submissions/${id}/approve`, { method: "POST" });
    await fetchSubmissions();
    setApprovingId(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontSize: "0.875rem", marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Тест өгсөн хариунууд</h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "4px" }}>Нийт {totalDocs} хариу бүртгэгдсэн байна.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", padding: "10px", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
            >
              <option value="ALL">Бүх төлөв</option>
              <option value="PAID">Төлөгдсөн</option>
              <option value="PENDING">Хүлээгдэж буй</option>
            </select>
            
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", padding: "8px", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
              title="Эхлэх огноо"
            />
            <span style={{ color: "#64748b" }}>-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", padding: "8px", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
              title="Дуусах огноо"
            />

            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Тестээр хайх..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: "100%", padding: "10px 14px 10px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.9rem", outline: "none" }}
              />
            </div>
            
            {(search || status !== "ALL" || startDate || endDate) && (
              <button onClick={clearFilters} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>Цэвэрлэх</button>
            )}
          </div>
        </div>

        {loading && submissions.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
            <Loader2 size={32} color="#7c9eff" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "60px", color: "#475569" }}>Хариу олдсонгүй.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {submissions.map((sub) => (
              <div key={sub._id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem" }}>{sub.testTitle}</h3>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "100px", background: sub.paymentStatus === "PAID" ? "rgba(134,239,172,0.1)" : "rgba(248,113,113,0.1)", color: sub.paymentStatus === "PAID" ? "#86efac" : "#f87171", fontWeight: 700 }}>
                      {sub.paymentStatus === "PAID" ? "ТӨЛӨГДСӨН" : "ХҮЛЭЭГДЭЖ БУЙ"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Оноо: <strong style={{ color: "#e2e8f0" }}>{sub.totalScore}</strong></span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Дүгнэлт: <strong style={{ color: "#e2e8f0" }}>{sub.resultStatus}</strong></span>
                    <span style={{ fontSize: "0.8rem", color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> <span suppressHydrationWarning>{new Date(sub.createdAt).toLocaleString("mn-MN")}</span>
                    </span>
                  </div>
                  {sub.errorLog && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(248,113,113,0.08)", borderLeft: "3px solid #ef4444", borderRadius: "0 8px 8px 0", fontSize: "0.85rem", color: "#fca5a5", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ fontSize: "1rem", lineHeight: 1 }}>⚠️</span> 
                      <span style={{ wordBreak: 'break-word', lineHeight: 1.4 }}><strong>Системийн алдаа:</strong> {sub.errorLog}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/submission/${sub._id}/result`} target="_blank" style={{ textDecoration: "none" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(124,158,255,0.1)", border: "1px solid rgba(124,158,255,0.15)", color: "#7c9eff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                      <ExternalLink size={14} /> Үзэх
                    </button>
                  </Link>
                  {sub.paymentStatus === "PENDING" && (
                    <button 
                      onClick={() => handleApprove(sub._id)}
                      disabled={approvingId === sub._id}
                      style={{ padding: "8px", borderRadius: "10px", background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.15)", color: "#86efac", cursor: "pointer" }}
                      title="Төлбөр батлах"
                    >
                      {approvingId === sub._id ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={16} />}
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(sub._id)}
                    disabled={deletingId === sub._id}
                    style={{ padding: "8px", borderRadius: "10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171", cursor: "pointer" }}
                  >
                    {deletingId === sub._id ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "32px" }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              style={{ padding: "8px 16px", borderRadius: "10px", background: page === 1 ? "rgba(255,255,255,0.05)" : "rgba(124,158,255,0.1)", color: page === 1 ? "#475569" : "#7c9eff", border: "none", cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              Өмнөх
            </button>
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Хуудас {page} / {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              style={{ padding: "8px 16px", borderRadius: "10px", background: page === totalPages ? "rgba(255,255,255,0.05)" : "rgba(124,158,255,0.1)", color: page === totalPages ? "#475569" : "#7c9eff", border: "none", cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              Дараах
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #334155; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }`}</style>
    </div>
  );
}
