import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Video } from "@/models/Video";
import HomeTabs from "./HomeTabs";
import Link from "next/link";
import { History, Sparkles, Heart } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  await connectToDatabase();

  const [tests, videos] = await Promise.all([
    Test.find().sort({ order: 1, createdAt: -1 }).lean(),
    Video.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  const serializedTests = tests.map((t: any) => ({
    id: t._id.toString(),
    slug: t.slug,
    title: t.title,
    price: t.price,
    icon: t.icon || "Brain",
    description: t.description || "",
  }));

  const serializedVideos = videos.map((v: any) => ({
    id: v._id.toString(),
    slug: v.slug,
    title: v.title,
    price: v.price,
    description: v.description || "",
    thumbnailUrl: v.thumbnailUrl || "",
    duration: v.duration || "",
    authorName: v.authorName || "",
    authorTitle: v.authorTitle || "",
    validDays: v.validDays || 30,
  }));

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 20px 80px",
      }}
    >
      {/* Top Header & Navigation */}
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
          padding: "12px 20px",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.9)",
          boxShadow: "0 10px 25px -5px rgba(100, 116, 139, 0.05)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/aulogo.png"
            alt="Аутизмыг танихуй"
            style={{ height: "46px", width: "auto", objectFit: "contain", display: "block" }}
          />
        </Link>

        <Link
          href="/history"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#0f172a",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: 700,
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            padding: "9px 18px",
            borderRadius: "100px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            transition: "all 0.2s",
          }}
        >
          <History size={16} color="#0284c7" />
          <span>Миний хариу & эрхүүд</span>
        </Link>
      </header>

      {/* Hero Intro with Playful Floating Decorative Stickers */}
      <div style={{ textAlign: "center", marginBottom: "44px", maxWidth: "680px", position: "relative" }}>
        {/* Floating stickers */}
        <span
          className="floating-sticker"
          style={{ position: "absolute", top: "-15px", left: "-20px", fontSize: "1.8rem" }}
        >
          🎈
        </span>
        <span
          className="floating-sticker-delayed"
          style={{ position: "absolute", top: "10px", right: "-25px", fontSize: "1.8rem" }}
        >
          ⭐
        </span>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(254, 243, 199, 0.8)", border: "1px solid rgba(251, 191, 36, 0.4)", padding: "5px 14px", borderRadius: "100px", marginBottom: "16px", color: "#b45309", fontSize: "0.82rem", fontWeight: 700 }}>
          <Sparkles size={14} color="#f59e0b" />
          <span>ХҮҮХЭД & ЭЦЭГ ЭХЧҮҮДЭД ЗОРИУЛСАН ПЛАТФОРМ</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.1rem, 5vw, 3.1rem)",
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1.2,
            marginBottom: "16px",
            letterSpacing: "-0.03em",
          }}
        >
          Хүүхдийнхээ ертөнцийг хамтдаа нээж, ойлгоцгооё 🌈
        </h1>

        <p style={{ color: "#475569", fontSize: "1.1rem", lineHeight: 1.65 }}>
          Шинжлэх ухааны үндэслэлтэй сэтгэл зүйн сорилууд болон эцэг эхчүүдэд зориулсан мэргэжлийн практик видео сургалтууд.
        </p>
      </div>

      {/* Tabs & Full Catalog */}
      <HomeTabs tests={serializedTests} videos={serializedVideos} />

      {/* Friendly Footer */}
      <footer
        style={{
          marginTop: 90,
          color: "#64748b",
          fontSize: "0.85rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Хүүхэд бүрийн инээмсэглэл, ирээдүйн төлөө</span>
          <Heart size={14} color="#f43f5e" fill="#f43f5e" />
        </div>
        <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
          © 2026 Smart Test Hub. Хөгжүүлсэн:{" "}
          <a
            href="https://www.facebook.com/engiineeer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}
          >
            Engiineer
          </a>
        </div>
      </footer>
    </main>
  );
}
