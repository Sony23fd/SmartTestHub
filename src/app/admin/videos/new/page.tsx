"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Video, Image, CheckCircle, Sparkles } from "lucide-react";

export default function NewVideoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(19000);
  const [validDays, setValidDays] = useState(30);
  const [duration, setDuration] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Files
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoFilePath, setVideoFilePath] = useState("");
  const [previewVideoPath, setPreviewVideoPath] = useState("");

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug) {
      const genSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9а-яөүё\- ]/gi, "")
        .replace(/\s+/g, "-");
      setSlug(genSlug);
    }
  };

  const [videoProgress, setVideoProgress] = useState(0);
  const [previewProgress, setPreviewProgress] = useState(0);

  const handleFileUpload = (
    file: File,
    type: "thumbnail" | "video" | "preview"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    if (type === "thumbnail") setUploadingThumb(true);
    if (type === "video") {
      setUploadingVideo(true);
      setVideoProgress(0);
    }
    if (type === "preview") {
      setUploadingPreview(true);
      setPreviewProgress(0);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/videos/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (type === "video") setVideoProgress(percent);
        if (type === "preview") setPreviewProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && data.success) {
          if (type === "thumbnail") setThumbnailUrl(data.path);
          if (type === "video") setVideoFilePath(data.path);
          if (type === "preview") setPreviewVideoPath(data.path);
        } else {
          alert(data.error || "Файл хуулахад алдаа гарлаа");
        }
      } catch {
        alert("Хариу боловсруулахад алдаа гарлаа");
      }
      if (type === "thumbnail") setUploadingThumb(false);
      if (type === "video") setUploadingVideo(false);
      if (type === "preview") setUploadingPreview(false);
    };

    xhr.onerror = () => {
      alert("Сүлжээний алдаа гарлаа. Хэрэв Vercel дээр байгаа бол файлын дээд хэмжээ 4.5MB хязгаартай тул видеог шахах хэрэгтэй.");
      if (type === "thumbnail") setUploadingThumb(false);
      if (type === "video") setUploadingVideo(false);
      if (type === "preview") setUploadingPreview(false);
    };

    xhr.send(formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoFilePath) {
      setError("Видеоны гарчиг болон үндсэн видео файл заавал шаардлагатай");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          price: Number(price),
          validDays: Number(validDays),
          duration,
          authorName,
          authorTitle,
          thumbnailUrl,
          videoFilePath,
          previewVideoPath,
          isPublished,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/videos");
      } else {
        setError(data.error || "Хадгалахад алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний холболтын алдаа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <Link
          href="/admin/videos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.85rem",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={16} /> Видеоны жагсаалт руу буцах
        </Link>

        <div
          style={{
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 0 60px rgba(0,0,0,0.5)",
          }}
        >
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
            Шинэ видео контент оруулах
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "28px" }}>
            19,000₮-ийн үнэтэй видео хичээл, зөвлөгөөг системд байршуулах.
          </p>

          {error && (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Title */}
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                Видеоны гарчиг *
              </label>
              <input
                type="text"
                placeholder="Жишээ: Хүүхдийн зан төлөвийг засах цогц зөвлөгөө"
                value={title}
                onChange={handleTitleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                URL Slug * (латин үсгээр)
              </label>
              <input
                type="text"
                placeholder="child-behavior-course"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* Price & Valid Days */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Үнэ (төгрөгөөр) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Үзэх хүчинтэй хугацаа (хоног)
                </label>
                <input
                  type="number"
                  placeholder="30 (0 бол хугацаагүй)"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Duration & Author */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Үргэлжлэх хугацаа
                </label>
                <input
                  type="text"
                  placeholder="45 мин"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Багш / Мэргэжилтэн
                </label>
                <input
                  type="text"
                  placeholder="Б.Энхмаа"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Цол / Албан тушаал
                </label>
                <input
                  type="text"
                  placeholder="Сэтгэл зүйч"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                Дэлгэрэнгүй тайлбар, агуулга
              </label>
              <textarea
                rows={4}
                placeholder="Энэхүү бичлэгээр та юу суралцах, ямар ач холбогдолтой талаар дэлгэрэнгүй бичнэ үү..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* FILE UPLOADS */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <h4 style={{ color: "#7c9eff", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                📁 Медиа файлууд байршуулах
              </h4>

              {/* 1. Thumbnail Image */}
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Ковер зураг (Thumbnail)
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnail")}
                    style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                  />
                  <input
                    type="text"
                    placeholder="эсвэл зургийн URL / зам (жишээ: /thumbnails/autism_cover.jpg)"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: "rgba(15,23,42,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "0.82rem",
                      flex: 1,
                      minWidth: "200px",
                    }}
                  />
                  {uploadingThumb && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {thumbnailUrl && <span style={{ color: "#86efac", fontSize: "0.8rem" }}>✓ Зураг холбогдсон</span>}
                </div>
              </div>

              {/* 2. Main Full Protected Video */}
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Үндсэн бүтэн видео файл (.mp4, .webm, .mov) * (Хамгаалалттай хадгалагдана)
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "video")}
                    style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                  />
                  <input
                    type="text"
                    placeholder="эсвэл видеоны URL / файлын нэр (жишээ: aucontent_main.mp4)"
                    value={videoFilePath}
                    onChange={(e) => setVideoFilePath(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: "rgba(15,23,42,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "0.82rem",
                      flex: 1,
                      minWidth: "200px",
                    }}
                  />
                  {uploadingVideo && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#7c9eff", fontSize: "0.8rem", fontWeight: 700 }}>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        <span>Сервер рүү хуулж байна... {videoProgress}%</span>
                      </div>
                      <div style={{ width: "160px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{ width: `${videoProgress}%`, height: "100%", background: "#7c9eff", transition: "width 0.2s ease" }} />
                      </div>
                    </div>
                  )}
                  {videoFilePath && <span style={{ color: "#86efac", fontSize: "0.8rem" }}>✓ Видео файл бэлэн</span>}
                </div>
              </div>

              {/* 3. Preview Video (optional) */}
              <div>
                <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Үнэгүй танилцуулга бичлэг (Сонголтоор - богино трейлер)
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "preview")}
                    style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                  />
                  {uploadingPreview && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                  {previewVideoPath && <span style={{ color: "#86efac", fontSize: "0.8rem" }}>✓ Трейлер бэлэн</span>}
                </div>
              </div>
            </div>

            {/* Published Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#7c9eff", cursor: "pointer" }}
              />
              <label htmlFor="isPublished" style={{ color: "#cbd5e1", fontSize: "0.9rem", cursor: "pointer" }}>
                Сайт дээр шууд нийтлэх
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploadingVideo}
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: submitting || uploadingVideo ? "rgba(124,158,255,0.4)" : "linear-gradient(135deg, #7c9eff 0%, #4361ee 100%)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: submitting || uploadingVideo ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 25px rgba(67, 97, 238, 0.35)",
                marginTop: "10px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Хадгалж байна...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Видео контентыг нийтлэх</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
