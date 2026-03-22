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
}

const cardStyle = {
  background: "rgba(15,23,42,0.8)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "20px",
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

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

  const filtered = submissions.filter(s => 
    s.testTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.resultStatus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontSize: "0.875rem", marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Тест өгсөн хариунууд</h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "4px" }}>Нийт {submissions.length} хариу бүртгэгдсэн байна.</p>
          </div>

          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Тестээр хайх..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 14px 10px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#ffffff", fontSize: "0.9rem", outline: "none" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
            <Loader2 size={32} color="#7c9eff" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "60px", color: "#475569" }}>Хариу олдсонгүй.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((sub) => (
              <div key={sub._id} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
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
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #334155; }`}</style>
    </div>
  );
}
