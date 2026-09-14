"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Video } from "lucide-react";
import TestGrid from "./TestGrid";
import VideoGrid, { VideoCardItem } from "@/components/VideoGrid";

interface HomeTabsProps {
  tests: any[];
  videos: VideoCardItem[];
}

export default function HomeTabs({ tests, videos }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<"TESTS" | "VIDEOS">("TESTS");

  const tabs = [
    { id: "TESTS", label: "Сэтгэл зүйн сорилууд", icon: Brain, count: tests.length },
    { id: "VIDEOS", label: "Видео сургалтууд", icon: Video, count: videos.length },
  ];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Sliding Pill Tab Bar */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "100px",
          padding: "6px",
          marginBottom: "44px",
          gap: "6px",
          boxShadow: "0 10px 25px -5px rgba(100, 116, 139, 0.08)",
          position: "relative",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "TESTS" | "VIDEOS")}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "100px",
                border: "none",
                background: "transparent",
                color: isActive ? "#ffffff" : "#475569",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                zIndex: 1,
                transition: "color 0.2s ease",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "100px",
                    background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                    boxShadow: "0 6px 16px rgba(2, 132, 199, 0.3)",
                    zIndex: -1,
                  }}
                />
              )}
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "100px",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.25)" : "rgba(241, 245, 249, 0.9)",
                  color: isActive ? "#ffffff" : "#64748b",
                  border: isActive ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(226, 232, 240, 0.8)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents with Animated Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {activeTab === "TESTS" && (
            <div style={{ width: "100%" }}>
              <TestGrid tests={tests} />
            </div>
          )}

          {activeTab === "VIDEOS" && (
            <div style={{ width: "100%" }}>
              <VideoGrid videos={videos} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
