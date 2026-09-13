"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Trash2,
  Edit2,
  ArrowLeft,
  Video,
  Eye,
  EyeOff,
  DollarSign,
  Loader2,
  Calendar,
  Clock,
  User,
  ShoppingBag,
} from "lucide-react";

interface VideoItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  duration?: string;
  authorName?: string;
  validDays?: number;
  isPublished: boolean;
  thumbnailUrl?: string;
  orderCount: number;
  paidCount: number;
  totalEarnings: number;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/admin/videos");
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" видеог устгах уу?`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    await fetchVideos();
    setDeletingId(null);
  };

  const handleTogglePublish = async (video: VideoItem) => {
    await fetch(`/api/admin/videos/${video._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !video.isPublished }),
    });
    await fetchVideos();
  };

  const totalEarnings = videos.reduce((acc, v) => acc + (v.totalEarnings || 0), 0);
  const totalPaidOrders = videos.reduce((acc, v) => acc + (v.paidCount || 0), 0);

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <Link
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.85rem",
                marginBottom: "8px",
              }}
            >
              <ArrowLeft size={14} /> Админ самбар руу буцах
            </Link>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff" }}>
              Видео контентын удирдлага
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link href="/admin/videos/orders" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "9px 16px",
                  borderRadius: "10px",
                  background: "rgba(134,239,172,0.1)",
                  border: "1px solid rgba(134,239,172,0.2)",
                  color: "#86efac",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ShoppingBag size={15} /> Захиалгууд ({totalPaidOrders})
              </button>
            </Link>

            <Link href="/admin/videos/new" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #7c9eff 0%, #4361ee 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 15px rgba(67, 97, 238, 0.3)",
                }}
              >
                <PlusCircle size={16} /> Шинэ видео нэмэх
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Нийт видео</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
              {videos.length}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Худалдан авсан тоо</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#86efac", marginTop: "4px" }}>
              {totalPaidOrders}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Видеоны нийт орлого</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#7c9eff", marginTop: "4px" }}>
              {totalEarnings.toLocaleString("en-US")} ₮
            </div>
          </div>
        </div>

        {/* Videos List Card */}
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <div>Ачааллаж байна...</div>
            </div>
          ) : videos.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
              <Video size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <p>Одоогоор бүртгэлтэй видео байхгүй байна.</p>
              <Link href="/admin/videos/new" style={{ color: "#7c9eff", fontWeight: 600 }}>
                Анхны видеогоо нэмэх
              </Link>
            </div>
          ) : (
            videos.map((v) => (
              <div
                key={v._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                {/* Left: Thumbnail & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "48px",
                      borderRadius: "8px",
                      backgroundColor: "#000",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e1b4b" }}>
                        <Video size={18} color="#7c9eff" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#ffffff", fontSize: "1rem" }}>
                        {v.title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#86efac",
                          background: "rgba(34,197,94,0.1)",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          fontWeight: 700,
                        }}
                      >
                        {v.price.toLocaleString("en-US")} ₮
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "14px", fontSize: "0.78rem", color: "#64748b" }}>
                      {v.duration && <span>Хугацаа: {v.duration}</span>}
                      {v.validDays && <span>Эрх: {v.validDays} хоног</span>}
                      <span style={{ color: "#86efac" }}>{v.paidCount} худалдан авсан</span>
                      <span style={{ color: "#7c9eff" }}>Орлого: {v.totalEarnings.toLocaleString("en-US")}₮</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => handleTogglePublish(v)}
                    title={v.isPublished ? "Нийтлэл цуцлах" : "Нийтлэх"}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: v.isPublished ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: v.isPublished ? "#86efac" : "#64748b",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {v.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{v.isPublished ? "Идэвхтэй" : "Нуугдмал"}</span>
                  </button>

                  <Link href={`/admin/videos/${v._id}/edit`} style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(253,230,138,0.08)",
                        border: "1px solid rgba(253,230,138,0.15)",
                        color: "#fde68a",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600,
                      }}
                    >
                      <Edit2 size={13} /> Засах
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDelete(v._id, v.title)}
                    disabled={deletingId === v._id}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.15)",
                      color: "#f87171",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {deletingId === v._id ? (
                      <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Устгах
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
