"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Activity,
  Heart,
  Smile,
  Star,
  Target,
  Users,
  Compass,
  Book,
  Award,
  Shield,
  Zap,
  Flame,
  PieChart,
  Lightbulb,
  Code,
  Coffee,
  Briefcase,
} from "lucide-react";

export const iconMap: Record<string, any> = {
  Brain,
  Activity,
  Heart,
  Smile,
  Star,
  Target,
  Users,
  Compass,
  Book,
  Award,
  Shield,
  Zap,
  Flame,
  PieChart,
  Lightbulb,
  Code,
  Coffee,
  Briefcase,
};

// Fun kid & parent friendly icon color accents
const colorPalettes = [
  { bg: "rgba(14, 165, 233, 0.12)", border: "rgba(14, 165, 233, 0.25)", color: "#0284c7" }, // Sky Blue
  { bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.25)", color: "#e11d48" },  // Coral Rose
  { bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.28)", color: "#d97706" }, // Amber Sun
  { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", color: "#059669" }, // Mint Green
  { bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.25)", color: "#7c3aed" }, // Violet Lilac
];

interface TestCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  icon?: string;
  description?: string;
  index?: number;
}

function TestCard({ id, slug, title, price, icon, description, index = 0 }: TestCardProps) {
  const IconComp = iconMap[icon || "Brain"] || Brain;
  const theme = colorPalettes[index % colorPalettes.length];

  return (
    <Link href={`/test/${slug}`} style={{ textDecoration: "none" }}>
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
          padding: "26px",
          cursor: "pointer",
          boxShadow: "0 10px 30px -5px rgba(100, 116, 139, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.02)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Header: Icon & Price Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.5 }}
            style={{
              width: 52,
              height: 52,
              borderRadius: "18px",
              background: theme.bg,
              border: `1.5px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <IconComp size={26} color={theme.color} />
          </motion.div>

          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: "100px",
              letterSpacing: "0.02em",
              background: price === 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(2, 132, 199, 0.1)",
              border: price === 0 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(2, 132, 199, 0.25)",
              color: price === 0 ? "#059669" : "#0284c7",
            }}
          >
            {price === 0 ? "ҮНЭГҮЙ" : `${price.toLocaleString("en-US")} ₮`}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.88rem",
            color: "#64748b",
            lineHeight: 1.6,
            marginBottom: "22px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {description || "Энэхүү сорил нь хүүхдийн онцлог, хэрэгцээг нарийвчлан тодорхойлоход тусална."}
        </p>

        {/* Action Link with Spring Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: theme.color,
            marginTop: "auto",
          }}
        >
          <span>Сорил эхлэх</span>
          <ArrowRight size={16} />
        </div>
      </motion.div>
    </Link>
  );
}

export default function TestGrid({ tests }: { tests: any[] }) {
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
      {tests.map((test, index) => (
        <TestCard key={test.id} {...test} index={index} />
      ))}
    </div>
  );
}
