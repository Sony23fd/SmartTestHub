"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Play,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface HistoryItem {
  _id: string;
  testId: { title: string; slug: string; price: number };
  totalScore: number;
  resultStatus: string;
  paymentStatus: "PENDING" | "PAID";
  createdAt: string;
}

interface PurchasedVideoItem {
  orderId: string;
  shortId: string;
  video: {
    title: string;
    slug: string;
    thumbnailUrl?: string;
    duration?: string;
    authorName?: string;
    validDays?: number;
  };
  paidAt: string;
  expiresAt?: string;
  accessToken: string;
  isExpired: boolean;
}

export default function HistoryPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<HistoryItem[]>([]);
  const [videoResults, setVideoResults] = useState<PurchasedVideoItem[]>([]);
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
        setTestResults(data.data || []);
        setVideoResults(data.videos || []);
      } else {
        setError(data.error || "Алдаа гарлаа.");
      }
    } catch {
      setError("Холболтын алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  const totalFound = testResults.length + videoResults.length;

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px 80px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#475569",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: 700,
            marginBottom: "28px",
            background: "rgba(255, 255, 255, 0.8)",
            padding: "8px 16px",
            borderRadius: "100px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <ArrowLeft size={16} color="#0284c7" /> Нүүр хуудас руу буцах
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "2px solid rgba(255, 255, 255, 0.9)",
            borderRadius: "32px",
            padding: "clamp(28px, 6vw, 44px) clamp(20px, 5vw, 40px)",
            boxShadow: "0 20px 60px -10px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(240, 249, 255, 0.9)",
                border: "1px solid rgba(186, 230, 253, 0.8)",
                padding: "4px 12px",
                borderRadius: "100px",
                marginBottom: "12px",
                color: "#0369a1",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <Sparkles size={13} color="#0284c7" />
              <span>ЭРХ & ХАРИУ ШАЛГАХ</span>
            </div>

            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 900,
                color: "#0f172a",
                marginBottom: "8px",
                letterSpacing: "-0.03em",
              }}
            >
              Миний худалдан авалтууд
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Төлбөр төлөхдөө оруулсан утасны дугаараараа хайж, видео хичээлүүд болон сорилын үр дүнгээ хүссэн үедээ шалгана уу.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                +976
              </span>
              <input
                type="tel"
                placeholder="Утасны дугаар..."
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={8}
                style={{
                  width: "100%",
                  padding: "15px 16px 15px 64px",
                  background: "#f8fafc",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "16px",
                  color: "#0f172a",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
              />
            </div>

            {error && (
              <div style={{ color: "#dc2626", fontSize: "0.85rem", textAlign: "center", fontWeight: 600 }}>
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || phone.length < 6}
              style={{
                width: "100%",
                padding: "15px",
                background:
                  loading || phone.length < 6
                    ? "rgba(2, 132, 199, 0.5)"
                    : "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "16px",
                fontSize: "1rem",
                fontWeight: 800,
                cursor: loading || phone.length < 6 ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(2, 132, 199, 0.3)",
              }}
            >
              {loading ? (
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Search size={20} />
              )}
              Шалгах
            </motion.button>
          </form>

          {hasSearched && !loading && totalFound === 0 && !error && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
              <div
                style={{
                  display: "inline-flex",
                  background: "#f1f5f9",
                  padding: "16px",
                  borderRadius: "50%",
                  marginBottom: "14px",
                }}
              >
                <Search size={28} color="#94a3b8" />
              </div>
              <p style={{ margin: 0, fontWeight: 600 }}>Таны оруулсан дугаар дээр худалдан авалт олдсонгүй.</p>
            </div>
          )}

          {/* Section 1: Purchased Videos */}
          {videoResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              <h3
                style={{
                  color: "#0f172a",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  paddingBottom: "10px",
                  borderBottom: "1.5px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Video size={18} color="#0284c7" />
                <span>Худалдан авсан видеонууд ({videoResults.length})</span>
              </h3>

              {videoResults.map((item) => (
                <div
                  key={item.orderId}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          color: "#0f172a",
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          marginBottom: "4px",
                        }}
                      >
                        {item.video?.title || "Видео сургалт"}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "0.82rem",
                          color: "#64748b",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} color="#0284c7" />
                          <span>{new Date(item.paidAt).toLocaleDateString("mn-MN")}</span>
                        </span>
                        {item.expiresAt && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={13} color="#d97706" />
                            <span>Дуусах: {new Date(item.expiresAt).toLocaleDateString("mn-MN")}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        background: item.isExpired
                          ? "rgba(254, 226, 226, 0.9)"
                          : "rgba(240, 253, 244, 0.9)",
                        color: item.isExpired ? "#dc2626" : "#16a34a",
                        border: item.isExpired
                          ? "1px solid #fca5a5"
                          : "1px solid #bbf7d0",
                      }}
                    >
                      {item.isExpired ? "ХУГАЦАА ДУУССАН" : "ИДЭВХТЭЙ"}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        router.push(
                          `/videos/${item.video.slug}?token=${item.accessToken}`
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: item.isExpired
                          ? "#e2e8f0"
                          : "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                        border: "none",
                        color: item.isExpired ? "#64748b" : "#ffffff",
                        borderRadius: "12px",
                        fontSize: "0.92rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: item.isExpired ? "none" : "0 4px 14px rgba(2, 132, 199, 0.3)",
                      }}
                    >
                      <Play size={16} fill="currentColor" />
                      <span>{item.isExpired ? "Дахин эрх авах" : "Шууд үзэх"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 2: Test Submissions */}
          {testResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3
                style={{
                  color: "#0f172a",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  paddingBottom: "10px",
                  borderBottom: "1.5px solid #e2e8f0",
                }}
              >
                Сэтгэл зүйн тестүүдийн үр дүн ({testResults.length})
              </h3>

              {testResults.map((sub) => (
                <div
                  key={sub._id}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          color: "#0f172a",
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          marginBottom: "4px",
                        }}
                      >
                        {sub.testId?.title || "Тодорхойгүй тест"}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "0.82rem",
                          color: "#64748b",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} color="#0284c7" />
                          <span suppressHydrationWarning>
                            {new Date(sub.createdAt).toLocaleDateString("mn-MN")}
                          </span>
                        </span>
                        <span>
                          Оноо: <strong style={{ color: "#0f172a" }}>{sub.totalScore}</strong>
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        background:
                          sub.paymentStatus === "PAID"
                            ? "rgba(240, 253, 244, 0.9)"
                            : "rgba(254, 243, 199, 0.9)",
                        color:
                          sub.paymentStatus === "PAID" ? "#16a34a" : "#d97706",
                        border:
                          sub.paymentStatus === "PAID"
                            ? "1px solid #bbf7d0"
                            : "1px solid #fde68a",
                      }}
                    >
                      {sub.paymentStatus === "PAID"
                        ? "ТӨЛБӨР ТӨЛӨГДСӨН"
                        : "ТӨЛБӨР ХҮЛЭЭГДЭЖ БУЙ"}
                    </span>
                  </div>

                  <div>
                    {sub.paymentStatus === "PAID" ? (
                      <button
                        onClick={() => router.push(`/submission/${sub._id}/result`)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "12px",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                        }}
                      >
                        <CheckCircle2 size={16} /> Үр дүн дэлгэрэнгүй үзэх
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/submission/${sub._id}`)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#fef3c7",
                          border: "1px solid #fde68a",
                          color: "#b45309",
                          borderRadius: "12px",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <AlertCircle size={16} /> Төлбөр гүйцээж үр дүн харах
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
