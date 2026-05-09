"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
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
  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);
  const IconComp = iconMap[test.icon || 'Brain'] || iconMap['Brain'];

  const handleNext = async () => {
    if (selectedOption === null) return;
    const newResponses = [...responses];
    newResponses[currentIndex] = { questionId: currentQuestion._id, selectedOptionIndex: selectedOption };
    setResponses(newResponses);

    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
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
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(responses[currentIndex - 1]?.selectedOptionIndex ?? null);
    } else {
      router.back();
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 400 : -400, opacity: 0 }),
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>

        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <button onClick={handleBack} disabled={isSubmitting} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.875rem', padding:0 }}>
            <ArrowLeft size={16} /> Буцах
          </button>
          <span style={{ color:'#475569', fontSize:'0.8rem', fontWeight:500 }}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'10px', marginBottom:'28px', overflow:'hidden' }}>
          <motion.div
            style={{ height:'100%', background:'#7c9eff', borderRadius:'10px' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Question Card */}
        <div style={{ position: 'relative', width: '100%' }}>
          <AnimatePresence custom={direction} mode="wait">
            {!isSubmitting ? (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 280, damping: 28, opacity: { duration: 0.2 } }}
                style={{ width: '100%' }}
              >
                <div style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'clamp(20px, 5vw, 36px)', boxShadow:'0 0 60px rgba(124,158,255,0.05)' }}>
                  {/* Icon */}
                  <div style={{ width:40, height:40, borderRadius:'10px', background:'rgba(124,158,255,0.1)', border:'1px solid rgba(124,158,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}>
                    <IconComp size={18} color="#7c9eff" />
                  </div>

                  <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#ffffff', lineHeight:1.5, marginBottom:'28px' }}>
                    {currentQuestion.text}
                  </h2>

                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedOption(idx)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: isSelected ? '1px solid rgba(124,158,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(124,158,255,0.12)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#ffffff' : '#94a3b8',
                            fontSize: '0.95rem',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'28px' }}>
                    <button
                      onClick={handleNext}
                      disabled={selectedOption === null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 28px',
                        borderRadius: '12px',
                        background: selectedOption !== null ? '#ffffff' : 'rgba(255,255,255,0.06)',
                        color: selectedOption !== null ? '#0a0d17' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      {currentIndex === questions.length - 1 ? 'Дуусгах' : 'Дараагийн'}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width:'100%', background:'rgba(15,23,42,0.85)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'clamp(40px, 8vw, 60px) 20px', textAlign:'center' }}
              >
                <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(124,158,255,0.3)', borderTopColor:'#7c9eff', animation:'spin 1s linear infinite', margin:'0 auto 20px' }} />
                <h2 style={{ color:'#ffffff', fontSize:'1.2rem', fontWeight:700, marginBottom:'8px' }}>Боловсруулж байна...</h2>
                <p style={{ color:'#64748b', fontSize:'0.9rem' }}>Түр хүлээнэ үү</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
