"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Clock, Video, User } from "lucide-react";

export interface VideoCardItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  authorName?: string;
  validDays?: number;
}

function VideoCard({ video }: { video: VideoCardItem }) {
  return (
    <Link href={`/videos/${video.slug}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ y: -7, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1.5px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "24px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 10px 30px -5px rgba(100, 116, 139, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.02)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Thumbnail banner with Play icon overlay */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            backgroundColor: "#0f172a",
            overflow: "hidden",
          }}
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)",
              }}
            >
              <Video size={40} color="#ffffff" style={{ opacity: 0.8 }} />
            </div>
          )}

          {/* Centered Play Button Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              }}
            >
              <Play size={20} fill="#0284c7" color="#0284c7" style={{ marginLeft: "3px" }} />
            </div>
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                padding: "3px 8px",
                borderRadius: "6px",
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(4px)",
                color: "#ffffff",
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Clock size={12} /> {video.duration}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: "22px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#b45309",
                background: "rgba(254, 243, 199, 0.9)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                padding: "4px 10px",
                borderRadius: "100px",
                letterSpacing: "0.02em",
              }}
            >
              {video.price === 0 ? "ҮНЭГҮЙ" : `${video.price.toLocaleString("en-US")} ₮`}
            </span>

            {video.validDays ? (
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                {video.validDays} хоног хүчинтэй
              </span>
            ) : null}
          </div>

          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "8px",
              lineHeight: 1.4,
            }}
          >
            {video.title}
          </h3>

          <p
            style={{
              fontSize: "0.88rem",
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: "18px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {video.description || "Мэргэжлийн түвшний зөвлөгөө, зааварчилгаа бүхий видео хичээл."}
          </p>

          {video.authorName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#475569",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <User size={14} color="#0284c7" />
              <span>{video.authorName}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#0284c7",
              marginTop: "auto",
            }}
          >
            <span>Үзэх эрх авах</span>
            <ArrowRight size={15} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function VideoGrid({ videos }: { videos: VideoCardItem[] }) {
  if (videos.length === 0) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "24px",
          padding: "48px 40px",
          textAlign: "center",
          color: "#64748b",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        Одоогоор нийтлэгдсэн видео сургалт байхгүй байна.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "24px",
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
