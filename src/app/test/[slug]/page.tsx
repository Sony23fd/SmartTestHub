import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileQuestion,
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
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, any> = {
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

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TestPreviewPage({ params }: Props) {
  await connectToDatabase();
  const { slug } = await params;
  const test = (await Test.findOne({ slug }).lean()) as any;

  if (!test) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #e2e8f0",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
            color: "#64748b",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          Тест олдсонгүй. <Link href="/" style={{ color: "#0284c7", fontWeight: 700 }}>Буцах</Link>
        </div>
      </main>
    );
  }

  const IconComp = iconMap[test.icon || "Brain"] || Brain;
  const questionCount = await Question.countDocuments({ testId: test._id });

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }}>
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
          <ArrowLeft size={16} color="#0284c7" /> Нүүр хуудас
        </Link>

        {/* Main Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "2px solid rgba(255, 255, 255, 0.9)",
            borderRadius: "32px",
            padding: "40px",
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.08)",
          }}
        >
          {/* Badge */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#0284c7",
                background: "rgba(240, 249, 255, 0.9)",
                border: "1px solid rgba(186, 230, 253, 0.8)",
                padding: "4px 12px",
                borderRadius: "100px",
              }}
            >
              СЭТГЭЛ ЗҮЙН ОНОШИЛГОО
            </span>
          </div>

          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "22px",
                background: "rgba(14, 165, 233, 0.12)",
                border: "1.5px solid rgba(14, 165, 233, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconComp size={34} color="#0284c7" />
            </div>
          </div>

          {/* Price */}
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: "100px",
                background: test.price === 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(2, 132, 199, 0.1)",
                color: test.price === 0 ? "#059669" : "#0284c7",
                border: test.price === 0 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(2, 132, 199, 0.25)",
              }}
            >
              {test.price === 0 ? "ҮНЭГҮЙ" : `${test.price.toLocaleString("en-US")} ₮`}
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.7rem",
              fontWeight: 900,
              color: "#0f172a",
              textAlign: "center",
              marginBottom: "12px",
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
            }}
          >
            {test.title}
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            {test.description}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            {[
              {
                icon: <FileQuestion size={18} color="#0284c7" />,
                label: "Нийт асуулт",
                value: `${questionCount}`,
              },
              {
                icon: <Clock size={18} color="#0284c7" />,
                label: "Хугацаа",
                value: `~${Math.max(1, Math.ceil(questionCount * 0.5))} мин`,
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "12px",
                    background: "rgba(2, 132, 199, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginBottom: "2px" }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <Link
            href={`/test/${test.slug}/take`}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.35)",
              transition: "transform 0.2s",
            }}
          >
            <span>Тест эхлэх</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}
