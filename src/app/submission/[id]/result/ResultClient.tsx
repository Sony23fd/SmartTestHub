"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Sparkles, Video, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { iconMap } from "@/app/TestGrid";

interface ResultData {
  submissionId: string;
  test: { title: string; slug: string; icon?: string };
  totalScore: number;
  resultText: string;
  resultStatus: string;
}

export default function ResultClient({ submissionId }: { submissionId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [featuredVideo, setFeaturedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const [res, vidRes] = await Promise.all([
          fetch(`/api/results/${submissionId}`),
          fetch(`/api/videos`),
        ]);
        const json = await res.json();
        const vidJson = await vidRes.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Үр дүнг харахад төлбөр шаардлагатай.");
        }

        if (vidJson.success && vidJson.data && vidJson.data.length > 0) {
          setFeaturedVideo(vidJson.data[0]);
        }
      } catch {
        setError("Алдаа гарлаа. Дахин шалгана уу.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#64748b" }}>
        <Loader2 size={26} color="#0284c7" style={{ animation: "spin 1s linear infinite" }} />
        <span>Үр дүнг бэлтгэж байна...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(226, 232, 240, 0.8)",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "440px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ color: "#e11d48", fontWeight: 700, marginBottom: "16px" }}>{error}</p>
          <Link href={`/submission/${submissionId}`} style={{ color: "#0284c7", textDecoration: "none", fontWeight: 700 }}>
            ← Төлбөр хийх хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isGood = data.resultStatus === "GOOD";
  const isAverage = data.resultStatus === "AVERAGE";

  // Friendly status colors
  const statusColor = isGood ? "#16a34a" : isAverage ? "#d97706" : "#e11d48";
  const statusBg = isGood ? "rgba(240, 253, 244, 0.9)" : isAverage ? "rgba(254, 243, 199, 0.9)" : "rgba(254, 242, 242, 0.9)";
  const statusBorder = isGood ? "rgba(187, 247, 208, 0.9)" : isAverage ? "rgba(253, 230, 138, 0.9)" : "rgba(254, 205, 211, 0.9)";

  const IconComp = iconMap[data.test.icon || "Brain"] || iconMap["Brain"];

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px 80px" }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "2px solid rgba(255, 255, 255, 0.9)",
          borderRadius: "32px",
          padding: "clamp(28px, 6vw, 44px) clamp(20px, 5vw, 40px)",
          boxShadow: "0 25px 60px -15px rgba(99, 102, 241, 0.12), 0 0 40px rgba(0,0,0,0.03)",
        }}
      >
        {/* Header with Icon */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
            style={{
              width: 76,
              height: 76,
              borderRadius: "24px",
              background: statusBg,
              border: `1.5px solid ${statusBorder}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
            }}
          >
            <IconComp size={38} color={statusColor} />
          </motion.div>

          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>
            {data.test.title}
          </div>

          <h1 style={{ fontSize: "2.1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "12px" }}>
            Сорилын үр дүн
          </h1>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "100px", padding: "6px 18px" }}>
            <Sparkles size={14} color="#f59e0b" />
            <span style={{ color: "#475569", fontSize: "0.88rem", fontWeight: 600 }}>
              Нийт оноо: <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{data.totalScore}</strong>
            </span>
          </div>
        </div>

        {/* Result Text Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: "#f8fafc",
            border: `1.5px solid ${statusBorder}`,
            borderRadius: "20px",
            padding: "clamp(20px, 4vw, 26px)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: 4, height: 18, borderRadius: "10px", background: statusColor }} />
            <span style={{ color: statusColor, fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Мэргэжлийн дүгнэлт
            </span>
          </div>
          <p style={{ color: "#334155", fontSize: "1.02rem", lineHeight: 1.8, fontWeight: 500, margin: 0 }}>
            {data.resultText}
          </p>
        </motion.div>

        {/* SMART CROSS-SELL: Recommending Video Course to Parents */}
        {featuredVideo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              background: "linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(240, 249, 255, 0.9) 100%)",
              border: "1.5px solid rgba(251, 191, 36, 0.4)",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontSize: "1.1rem" }}>💡</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Цаашид хүүхдэдээ хэрхэн туслах вэ?
              </span>
            </div>

            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px", lineHeight: 1.4 }}>
              {featuredVideo.title}
            </h4>

            <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "14px" }}>
              Эцэг эхчүүдэд зориулсан мэргэжлийн сэтгэл зүйчийн бодит заавар, практик зөвлөгөөг багтаасан видео хичээлийг үзээрэй.
            </p>

            <Link href={`/videos/${featuredVideo.slug}`} style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
                }}
              >
                <Video size={16} />
                <span>Видео сургалтыг үзэх ({featuredVideo.price.toLocaleString("en-US")}₮)</span>
                <ArrowRight size={15} />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>
            <ChevronLeft size={16} /> Нүүр хуудас руу буцах
          </Link>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
