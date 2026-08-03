"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, CheckCircle, Clock, ExternalLink, Search, CheckCircle2, Phone, Download, List, X } from "lucide-react";

interface SubmissionItem {
  _id: string;
  testId: string;
  testTitle: string;
  totalScore: number;
  paymentStatus: "PENDING" | "PAID";
  resultStatus: string;
  createdAt: string;
  errorLog?: string;
  phoneNumber?: string;
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
  const [testId, setTestId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tests, setTests] = useState<{_id: string, title: string}[]>([]);
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  
  // Modal states
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: debouncedSearch,
        status,
        testId,
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
  }, [page, debouncedSearch, status, testId, startDate, endDate]);

  useEffect(() => {
    fetch("/api/admin/tests").then(res => res.json()).then(data => {
      if (data.success) setTests(data.data);
    });
  }, []);

  const handleExport = () => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      status,
      testId,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    window.location.href = `/api/admin/submissions/export?${params.toString()}`;
  };

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

  const handleViewDetails = async (id: string) => {
    setSelectedSubmissionId(id);
    setDetailsLoading(true);
    setSubmissionDetails(null);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`);
      const data = await res.json();
      if (data.success) {
        setSubmissionDetails(data.data);
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setTestId("ALL");
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
          
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.2)", color: "#86efac", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "0.2s" }}>
            <Download size={16} /> Тайлан татах (CSV)
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "32px" }}>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", padding: "10px", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
            >
              <option value="ALL">Бүх төлөв</option>
              <option value="PAID">Төлөгдсөн</option>
              <option value="PENDING">Хүлээгдэж буй</option>
            </select>
            
            <select 
              value={testId} 
              onChange={(e) => { setTestId(e.target.value); setPage(1); }} 
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", padding: "10px", fontSize: "0.85rem", outline: "none", cursor: "pointer", maxWidth: "200px" }}
            >
              <option value="ALL">Бүх тест</option>
              {tests.map(t => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
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

            <div style={{ position: "relative", minWidth: "250px" }}>
              <Search size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Утасны дугаар, тестээр хайх..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: "100%", padding: "10px 14px 10px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.9rem", outline: "none" }}
              />
            </div>
            
            {(search || status !== "ALL" || testId !== "ALL" || startDate || endDate) && (
              <button onClick={clearFilters} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>Цэвэрлэх</button>
            )}
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
                  {sub.phoneNumber && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Phone size={14} color="#94a3b8" />
                      <span style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 500 }}>{sub.phoneNumber}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
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
                  <button onClick={() => handleViewDetails(sub._id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(124,158,255,0.1)", border: "1px solid rgba(124,158,255,0.15)", color: "#7c9eff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                    <List size={14} /> Дэлгэрэнгүй
                  </button>
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

      {/* Details Modal */}
      {selectedSubmissionId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", width: "100%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.1rem", fontWeight: 700 }}>Тестийн дэлгэрэнгүй</h2>
              <button onClick={() => setSelectedSubmissionId(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {detailsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                  <Loader2 size={24} color="#7c9eff" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : submissionDetails ? (
                <div>
                  <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Тест:</span>
                      <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{submissionDetails.testTitle}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Утасны дугаар:</span>
                      <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{submissionDetails.phoneNumber || "-"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Оноо:</span>
                      <strong style={{ color: "#86efac", fontSize: "0.9rem" }}>{submissionDetails.totalScore}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Дүгнэлт:</span>
                      <strong style={{ color: "#7c9eff", fontSize: "0.9rem" }}>{submissionDetails.resultStatus}</strong>
                    </div>
                  </div>
                  
                  <h3 style={{ color: "#e2e8f0", fontSize: "0.95rem", fontWeight: 600, marginBottom: "16px" }}>Асуулт ба хариултууд</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {submissionDetails.responses.map((resp: any, i: number) => (
                      <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 500, marginBottom: "6px" }}>{i + 1}. {resp.questionText}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Хариулт: <strong style={{ color: "#ffffff" }}>{resp.selectedOptionText}</strong></span>
                          <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>+{resp.score} оноо</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#ef4444" }}>Мэдээлэл олдсонгүй</div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #334155; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }`}</style>
    </div>
  );
}
