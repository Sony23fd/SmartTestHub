"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Edit2, HelpCircle, LogOut, BarChart3, Loader2, ChevronRight, Brain, CheckCircle } from "lucide-react";

interface TestItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  submissionCount: number;
  paidCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/admin/tests");
      const data = await res.json();
      if (data.success) setTests(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" тестийг устгах уу? Бүх асуулт мөн устана.`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
    await fetchTests();
    setDeletingId(null);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const totalSubs = tests.reduce((s, t) => s + t.submissionCount, 0);
  const totalPaid = tests.reduce((s, t) => s + t.paidCount, 0);

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#475569" }}>SMART TEST HUB</span>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginTop: "4px", letterSpacing: "-0.02em" }}>Админ Самбар</h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                Нүүр хуудас
              </button>
            </Link>
            <Link href="/admin/submissions" style={{ textDecoration: "none" }}>
              <button style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(124,158,255,0.1)", border: "1px solid rgba(124,158,255,0.15)", color: "#7c9eff", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={14} /> Хариунууд
              </button>
            </Link>
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              <LogOut size={14} /> Гарах
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Нийт тест", value: tests.length, icon: <Brain size={20} color="#7c9eff" /> },
            { label: "Нийт оролдлого", value: totalSubs, icon: <BarChart3 size={20} color="#86efac" /> },
            { label: "Төлөгдсөн", value: totalPaid, icon: <BarChart3 size={20} color="#fde68a" /> },
          ].map((stat, i) => (
            <div key={i} style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(124,158,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tests List */}
        <div style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
          
          {/* List header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ color: "#ffffff", fontWeight: 700, fontSize: "1rem" }}>Тестүүд</h2>
            <Link href="/admin/tests/new" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "#ffffff", color: "#0a0d17", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                <PlusCircle size={15} /> Шинэ тест
              </button>
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#64748b" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : tests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#475569" }}>
              Тест байхгүй байна. "Шинэ тест" нэмнэ үү.
            </div>
          ) : (
            <div>
              {tests.map((test, i) => (
                <div
                  key={test._id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: i < tests.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.95rem" }}>{test.title}</span>
                      <span style={{ fontSize: "11px", color: "#7c9eff", background: "rgba(124,158,255,0.1)", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>
                        {test.price === 0 ? "ҮНЭГҮЙ" : `${test.price.toLocaleString()}₮`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#475569" }}>{test.submissionCount} оролдлого</span>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{test.paidCount} төлөгдсөн</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Link href={`/admin/tests/${test._id}/questions`} style={{ textDecoration: "none" }}>
                      <button style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(124,158,255,0.1)", border: "1px solid rgba(124,158,255,0.15)", color: "#7c9eff", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                        <HelpCircle size={13} /> Асуулт
                      </button>
                    </Link>
                    <Link href={`/admin/tests/${test._id}/edit`} style={{ textDecoration: "none" }}>
                      <button style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(253,230,138,0.08)", border: "1px solid rgba(253,230,138,0.15)", color: "#fde68a", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                        <Edit2 size={13} /> Засах
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(test._id, test.title)}
                      disabled={deletingId === test._id}
                      style={{ padding: "7px 12px", borderRadius: "8px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}
                    >
                      {deletingId === test._id ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
                      Устгах
                    </button>
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
