"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface ResultData {
  submissionId: string;
  test: { title: string; slug: string };
  totalScore: number;
  resultText: string;
  resultStatus: string;
}

export default function ResultClient({ submissionId }: { submissionId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/results/${submissionId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Үр дүнг харахад төлбөр шаардлагатай.");
        }
      } catch {
        setError("Алдаа гарлаа. Дахин шалгана уу.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Loader2 size={28} color="#7c9eff" style={{ animation:'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'40px', textAlign:'center', maxWidth:'400px' }}>
          <p style={{ color:'#f87171', fontWeight:600, marginBottom:'16px' }}>{error}</p>
          <Link href={`/submission/${submissionId}`} style={{ color:'#7c9eff', textDecoration:'none', fontWeight:600 }}>← Буцах</Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isGood = data.resultStatus === "GOOD";
  const isAverage = data.resultStatus === "AVERAGE";
  
  // Accent color by result
  const accentColor = isGood ? '#86efac' : isAverage ? '#fde68a' : '#fca5a5';
  const accentBg = isGood ? 'rgba(134,239,172,0.1)' : isAverage ? 'rgba(253,230,138,0.1)' : 'rgba(252,165,165,0.1)';
  const accentBorder = isGood ? 'rgba(134,239,172,0.2)' : isAverage ? 'rgba(253,230,138,0.2)' : 'rgba(252,165,165,0.2)';
  const accentGlow = isGood ? 'rgba(134,239,172,0.08)' : isAverage ? 'rgba(253,230,138,0.08)' : 'rgba(252,165,165,0.08)';

  return (
    <main style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.35 }}
        style={{ width:'100%', maxWidth:'540px', background:'rgba(15,23,42,0.88)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'44px 40px', boxShadow:`0 0 100px ${accentGlow}` }}
      >
        {/* Icon */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type:'spring', stiffness:200 }}
            style={{ width:72, height:72, borderRadius:'20px', background:accentBg, border:`1px solid ${accentBorder}`, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}
          >
            <Award size={36} color={accentColor} />
          </motion.div>

          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#475569', marginBottom:'8px' }}>
            {data.test.title}
          </div>

          <h1 style={{ fontSize:'2rem', fontWeight:800, color:'#ffffff', letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:'12px' }}>
            Таны Үр дүн
          </h1>

          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'100px', padding:'6px 16px' }}>
            <Sparkles size={13} color={accentColor} />
            <span style={{ color:'#94a3b8', fontSize:'0.85rem', fontWeight:500 }}>Нийт оноо: <strong style={{ color:'#ffffff' }}>{data.totalScore}</strong></span>
          </div>
        </div>

        {/* Result Text Box */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.45 }}
          style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${accentBorder}`, borderRadius:'16px', padding:'24px', marginBottom:'32px' }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <div style={{ width:4, height:18, borderRadius:'10px', background:accentColor }} />
            <span style={{ color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>Мэргэжлийн дүгнэлт</span>
          </div>
          <p style={{ color:'#e2e8f0', fontSize:'1rem', lineHeight:1.8, fontWeight:400 }}>
            {data.resultText}
          </p>
        </motion.div>

        {/* Back link */}
        <div style={{ textAlign:'center' }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#475569', textDecoration:'none', fontSize:'0.875rem', fontWeight:500, transition:'color 0.2s' }}>
            <ChevronLeft size={16} /> Нүүр хуудас руу буцах
          </Link>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
