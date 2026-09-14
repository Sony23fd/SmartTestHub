"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import VideoPaymentModal from "./VideoPaymentModal";
import { useRouter } from "next/navigation";

interface FeaturedVideoProps {
  video: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
    duration?: string;
    authorName?: string;
    authorTitle?: string;
    validDays?: number;
  };
}

export default function FeaturedVideoSpotlight({ video }: FeaturedVideoProps) {
  const router = useRouter();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handlePaymentSuccess = (accessToken: string) => {
    setIsPaymentOpen(false);
    router.push(`/videos/${video.slug}?token=${accessToken}`);
  };

  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto 48px", position: "relative" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 199, 0.4) 50%, rgba(240, 249, 255, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "2px solid rgba(254, 215, 170, 0.6)",
          borderRadius: "32px",
          padding: "clamp(24px, 4vw, 44px)",
          boxShadow: "0 20px 50px -10px rgba(245, 158, 11, 0.15), 0 8px 24px -4px rgba(0, 0, 0, 0.04)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "36px",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative corner glow */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Left Side: Content & Highlights */}
        <div>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c2410c",
                background: "rgba(255, 237, 213, 0.9)",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                padding: "6px 14px",
                borderRadius: "100px",
                boxShadow: "0 2px 8px rgba(251, 146, 60, 0.15)",
              }}
            >
              <Sparkles size={14} color="#f97316" />
              <span>ЭЦЭГ ЭХЧҮҮДЭД ЗОРИУЛСАН ОНЦЛОХ СУРГАЛТ</span>
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.25,
              marginBottom: "14px",
              letterSpacing: "-0.02em",
            }}
          >
            {video.title}
          </h2>

          <p
            style={{
              color: "#475569",
              fontSize: "0.95rem",
              lineHeight: 1.65,
              marginBottom: "22px",
            }}
          >
            {video.description || "Хүүхдийнхээ зан төлөв, онцлогийг ойлгож, зөв чиглүүлэхэд туслах практик зөвлөгөө, зааварчилгаа."}
          </p>

          {/* Key Advantages List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "26px" }}>
            {[
              "Хүүхдийн зан төлөвийн шалтгааныг зөв таних",
              "Өдөр тутмын харилцаанд хэрэгжих бодит зөвлөмжүүд",
              `${video.validDays || 30} хоногийн турш хүссэн үедээ давтан үзэх эрх`,
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={15} color="#10b981" />
                </div>
                <span style={{ color: "#334155", fontSize: "0.88rem", fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Price & Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Нэг удаагийн төлбөр
              </span>
              <span style={{ fontSize: "1.7rem", fontWeight: 900, color: "#0284c7" }}>
                {video.price.toLocaleString("en-US")} ₮
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsPaymentOpen(true)}
              style={{
                padding: "14px 28px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                border: "none",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 10px 25px rgba(2, 132, 199, 0.35)",
              }}
            >
              <Sparkles size={18} />
              <span>Үзэх эрх авах</span>
              <ArrowRight size={16} />
            </motion.button>

            <Link href={`/videos/${video.slug}`} style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "14px 20px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.8)",
                  border: "1px solid rgba(203, 213, 225, 0.8)",
                  color: "#334155",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Дэлгэрэнгүй</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Card with Play Pulse */}
        <div style={{ position: "relative" }}>
          <Link href={`/videos/${video.slug}`} style={{ textDecoration: "none", display: "block" }}>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.18)",
                border: "3px solid #ffffff",
                aspectRatio: "16/10",
                backgroundColor: "#0f172a",
                cursor: "pointer",
              }}
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              )}

              {/* Pulsing Play Button */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(15, 23, 42, 0.25)",
                }}
              >
                <div
                  className="pulse-play"
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  <Play size={28} fill="#0284c7" color="#0284c7" style={{ marginLeft: "4px" }} />
                </div>
              </div>

              {/* Duration badge */}
              {video.duration && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    right: "14px",
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(6px)",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Clock size={12} /> {video.duration}
                </div>
              )}

              {video.authorName && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "14px",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(6px)",
                    color: "#0f172a",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <User size={12} color="#0284c7" /> {video.authorName}
                </div>
              )}
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <VideoPaymentModal
        videoId={video.id}
        videoTitle={video.title}
        price={video.price}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
