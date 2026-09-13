"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { iconMap } from "@/app/TestGrid";

interface Option {
  text: string;
  score: number;
}

interface Question {
  _id: string;
  text: string;
  options: Option[];
}

interface TestData {
  _id: string;
  title: string;
  icon?: string;
}

export default function QuizClient({ test, questions }: { test: TestData; questions: Question[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [responses, setResponses] = useState<{ questionId: string; selectedOptionIndex: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const IconComp = iconMap[test.icon || "Brain"] || iconMap["Brain"];

  const handleNext = async () => {
    if (selectedOption === null) return;
    const newResponses = [...responses];
    newResponses[currentIndex] = { questionId: currentQuestion._id, selectedOptionIndex: selectedOption };
    setResponses(newResponses);

    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(newResponses[currentIndex + 1]?.selectedOptionIndex ?? null);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId: test._id, responses: newResponses }),
        });
        const data = await res.json();
        if (data.success && data.data?.submissionId) {
          router.push(`/submission/${data.data.submissionId}`);
        } else {
          alert("Алдаа: " + data.error);
          setIsSubmitting(false);
        }
      } catch (err: any) {
        alert("Алдаа: " + err.message);
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setSelectedOption(responses[currentIndex - 1]?.selectedOptionIndex ?? null);
    } else {
      router.back();
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              borderRadius: "100px",
              padding: "6px 14px",
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} color="#0284c7" /> Буцах
          </button>
          <span
            style={{
              color: "#0284c7",
              fontSize: "0.85rem",
              fontWeight: 800,
              background: "rgba(240, 249, 255, 0.9)",
              border: "1px solid rgba(186, 230, 253, 0.8)",
              padding: "4px 12px",
              borderRadius: "100px",
            }}
          >
            {currentIndex + 1} / {questions.length} ({progressPercent}%)
          </span>
        </div>

        {/* Cheerful Progress bar */}
        <div
          style={{
            height: "8px",
            background: "rgba(226, 232, 240, 0.8)",
            borderRadius: "10px",
            marginBottom: "28px",
            overflow: "hidden",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #10b981 100%)",
              borderRadius: "10px",
            }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Question Card */}
        <div style={{ position: "relative", width: "100%" }}>
          <AnimatePresence custom={direction} mode="wait">
            {!isSubmitting ? (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "2px solid rgba(255, 255, 255, 0.9)",
                    borderRadius: "32px",
                    padding: "clamp(24px, 5vw, 40px)",
                    boxShadow: "0 20px 50px -10px rgba(100, 116, 139, 0.1)",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "16px",
                      background: "rgba(14, 165, 233, 0.12)",
                      border: "1.5px solid rgba(14, 165, 233, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <IconComp size={24} color="#0284c7" />
                  </div>

                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.5,
                      marginBottom: "28px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {currentQuestion.text}
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedOption(idx)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "16px 20px",
                            borderRadius: "16px",
                            border: isSelected
                              ? "2px solid #0284c7"
                              : "1.5px solid #e2e8f0",
                            background: isSelected
                              ? "rgba(240, 249, 255, 0.95)"
                              : "#f8fafc",
                            color: isSelected ? "#0c4a6e" : "#334155",
                            fontSize: "0.98rem",
                            fontWeight: isSelected ? 700 : 500,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            boxShadow: isSelected
                              ? "0 4px 14px rgba(2, 132, 199, 0.12)"
                              : "none",
                          }}
                        >
                          <span>{option.text}</span>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: isSelected ? "6px solid #0284c7" : "2px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              flexShrink: 0,
                              transition: "all 0.15s",
                            }}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
                    <motion.button
                      whileHover={{ scale: selectedOption !== null ? 1.03 : 1 }}
                      whileTap={{ scale: selectedOption !== null ? 0.97 : 1 }}
                      onClick={handleNext}
                      disabled={selectedOption === null}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "14px 32px",
                        borderRadius: "16px",
                        background:
                          selectedOption !== null
                            ? "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)"
                            : "#e2e8f0",
                        color: selectedOption !== null ? "#ffffff" : "#94a3b8",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        border: "none",
                        cursor: selectedOption !== null ? "pointer" : "not-allowed",
                        boxShadow:
                          selectedOption !== null
                            ? "0 8px 20px rgba(2, 132, 199, 0.3)"
                            : "none",
                      }}
                    >
                      <span>{currentIndex === questions.length - 1 ? "Дуусгах" : "Дараагийн"}</span>
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(24px)",
                  border: "2px solid rgba(255, 255, 255, 0.9)",
                  borderRadius: "32px",
                  padding: "clamp(40px, 8vw, 60px) 20px",
                  textAlign: "center",
                  boxShadow: "0 20px 50px -10px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: "4px solid rgba(2, 132, 199, 0.2)",
                    borderTopColor: "#0284c7",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                  }}
                />
                <h2 style={{ color: "#0f172a", fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>
                  Хариуг боловсруулж байна...
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.92rem" }}>Түр хүлээнэ үү</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
