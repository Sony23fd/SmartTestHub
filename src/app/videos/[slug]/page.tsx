"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Play,
  Lock,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  Heart,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import VideoPaymentModal from "@/components/VideoPaymentModal";

interface VideoData {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  hasPreview: boolean;
  duration: string;
  authorName: string;
  authorTitle?: string;
  validDays: number;
  hasAccess: boolean;
  order?: {
    orderId: string;
    phoneNumber: string;
    paidAt: string;
    expiresAt?: string;
    accessToken: string;
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function VideoDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"PAY" | "RESTORE">("PAY");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const openPaymentModal = (mode: "PAY" | "RESTORE" = "PAY") => {
    setPaymentMode(mode);
    setIsPaymentOpen(true);
  };

  const fetchVideo = async () => {
    try {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const res = await fetch(`/api/videos/${slug}${search}`);
      const data = await res.json();
      if (data.success) {
        setVideo(data.data);
        // Clean URL to prevent users from forwarding the token in the address bar
        if (typeof window !== "undefined" && window.location.search.includes("token=")) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else {
        setError(data.error || "Видео олдсонгүй");
      }
    } catch {
      setError("Холболтын алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [slug]);

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    fetchVideo();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          gap: "10px",
        }}
      >
        <Loader2 size={24} color="#0284c7" style={{ animation: "spin 1s linear infinite" }} />
        <span>Уншиж байна...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            borderRadius: "24px",
            padding: "40px",
            maxWidth: "440px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ color: "#e11d48", fontWeight: 700, marginBottom: "20px" }}>
            {error || "Видео олдсонгүй"}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#0284c7",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "28px 20px 80px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#475569",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
              padding: "8px 16px",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "100px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <ArrowLeft size={16} color="#0284c7" /> Нүүр хуудас руу буцах
          </Link>

          <Link
            href="/history"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#0284c7",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              background: "rgba(255, 255, 255, 0.9)",
              padding: "8px 16px",
              borderRadius: "100px",
              border: "1px solid rgba(186, 230, 253, 0.8)",
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.08)",
            }}
          >
            Миний худалдан авалтууд
          </Link>
        </div>

        {/* Video Player or Locked Hero Section */}
        <div style={{ marginBottom: "32px" }}>
          {video.hasAccess ? (
            <div>
              {/* Access Active Header Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(240, 253, 244, 0.95)",
                  border: "1.5px solid rgba(187, 247, 208, 0.9)",
                  borderRadius: "20px",
                  padding: "14px 22px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  boxShadow: "0 4px 15px rgba(34, 197, 94, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#15803d", fontSize: "0.9rem", fontWeight: 700 }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span>Таны үзэх эрх баталгаажсан байна ({video.order?.phoneNumber})</span>
                </div>
                {video.order?.expiresAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#15803d", fontSize: "0.84rem", fontWeight: 700 }}>
                    <Calendar size={14} color="#16a34a" />
                    <span>
                      Үлдсэн: {Math.max(0, Math.ceil((new Date(video.order.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} хоног ({new Date(video.order.expiresAt).toLocaleDateString("mn-MN")} хүртэл)
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Full Video Player */}
              <CustomVideoPlayer
                src={`/api/videos/stream?videoId=${video.id}&token=${video.order?.accessToken || ""}`}
                title={video.title}
                watermarkText={video.order?.phoneNumber ? `${video.order.phoneNumber.slice(0, 4)}****` : "SMART TEST HUB"}
              />
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                borderRadius: "28px",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                aspectRatio: "16/9",
                background: "#0f172a",
                boxShadow: "0 25px 60px -15px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPlayingPreview && video.hasPreview ? (
                <CustomVideoPlayer
                  src={`/api/videos/stream?videoId=${video.id}&type=preview`}
                  title={`${video.title} (Танилцуулга)`}
                />
              ) : (
                <>
                  {/* Thumbnail */}
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.4) blur(2px)",
                      }}
                    />
                  )}

                  {/* Lock Callout Overlay */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 10,
                      textAlign: "center",
                      padding: "32px 24px",
                      maxWidth: "520px",
                    }}
                  >
                    <div
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1.5px solid rgba(255, 255, 255, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                      }}
                    >
                      <Lock size={30} color="#ffffff" />
                    </div>

                    <h2
                      style={{
                        fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                        fontWeight: 900,
                        color: "#ffffff",
                        marginBottom: "10px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Эцэг эхчүүдэд зориулсан тусгай видео хичээл
                    </h2>

                    <p
                      style={{
                        color: "#e2e8f0",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                      }}
                    >
                      Та <strong>{video.price.toLocaleString("en-US")} ₮</strong> төлөөд{" "}
                      {video.validDays ? `${video.validDays} хоногийн турш` : "хугацаагүй"}{" "}
                      хүссэн үедээ утасны дугаараараа давтан үзэх эрхтэй болно.
                    </p>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openPaymentModal("PAY")}
                        style={{
                          padding: "14px 28px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                          border: "none",
                          color: "#ffffff",
                          fontSize: "1rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 10px 25px rgba(2, 132, 199, 0.4)",
                        }}
                      >
                        <Sparkles size={18} />
                        <span>Үзэх эрх авах ({video.price.toLocaleString("en-US")}₮)</span>
                      </motion.button>

                      {video.hasPreview && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setIsPlayingPreview(true)}
                          style={{
                            padding: "14px 22px",
                            borderRadius: "16px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            color: "#ffffff",
                            fontSize: "0.92rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Play size={16} fill="#ffffff" />
                          <span>Танилцуулга үзэх</span>
                        </motion.button>
                      )}
                    </div>

                    {/* Restore link */}
                    <div style={{ marginTop: "16px" }}>
                      <button
                        type="button"
                        onClick={() => openPaymentModal("RESTORE")}
                        style={{
                          background: "rgba(255, 255, 255, 0.15)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "100px",
                          padding: "8px 18px",
                          color: "#ffffff",
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backdropFilter: "blur(6px)",
                          transition: "all 0.2s",
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Өмнө нь эрх авсан уу? Утасны дугаараар сэргээх</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Video Info Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(226, 232, 240, 0.9)",
            borderRadius: "28px",
            padding: "clamp(24px, 4vw, 40px)",
            boxShadow: "0 10px 30px -5px rgba(100, 116, 139, 0.08)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
            {video.duration && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0284c7",
                  background: "rgba(240, 249, 255, 0.9)",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: "1px solid rgba(186, 230, 253, 0.8)",
                }}
              >
                <Clock size={14} color="#0284c7" /> {video.duration}
              </span>
            )}

            {video.validDays > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#d97706",
                  background: "rgba(254, 243, 199, 0.9)",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: "1px solid rgba(251, 191, 36, 0.4)",
                }}
              >
                <Calendar size={14} color="#d97706" /> {video.validDays} хоног хүчинтэй
              </span>
            )}

            {video.authorName && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#059669",
                  background: "rgba(236, 253, 245, 0.9)",
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: "1px solid rgba(167, 243, 208, 0.8)",
                }}
              >
                <User size={14} color="#059669" /> {video.authorName} {video.authorTitle ? `(${video.authorTitle})` : ""}
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: "16px",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {video.title}
          </h1>

          <div
            style={{
              color: "#475569",
              fontSize: "1rem",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {video.description || "Энэхүү видео нь танд мэргэжлийн заавар, зөвлөгөөг олгоно."}
          </div>

          {/* Bottom Callout if not paid yet */}
          {!video.hasAccess && (
            <div
              style={{
                marginTop: "36px",
                padding: "26px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(254, 243, 199, 0.5) 100%)",
                border: "1.5px solid rgba(186, 230, 253, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h4 style={{ color: "#0f172a", fontSize: "1.15rem", fontWeight: 800, marginBottom: "4px" }}>
                  Хүүхдэдээ туслах практик мэдлэг авах уу?
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
                  QPay ашиглан 19,000 төгрөгөөр шууд эрхээ аваарай.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openPaymentModal("PAY")}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  Үзэх эрх авах ({video.price.toLocaleString("en-US")}₮)
                </motion.button>

                <button
                  type="button"
                  onClick={() => openPaymentModal("RESTORE")}
                  style={{
                    padding: "13px 20px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    border: "1.5px solid #cbd5e1",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RotateCcw size={15} color="#0284c7" />
                  <span>Эрх сэргээх</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment & Verification Modal */}
      <VideoPaymentModal
        videoId={video.id}
        videoTitle={video.title}
        price={video.price}
        isOpen={isPaymentOpen}
        initialMode={paymentMode}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
