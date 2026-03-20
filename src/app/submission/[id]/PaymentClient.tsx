"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Loader2, QrCode } from "lucide-react";

interface QPayData {
  invoice_id: string;
  qr_image: string;
  urls: { name: string; logo: string; link: string }[];
}

export default function PaymentClient({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [qpayData, setQpayData] = useState<QPayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId }),
        });
        const data = await res.json();
        if (data.success) {
          setQpayData(data.data);
        } else {
          if (data.error?.includes("already completed") || data.error?.includes("free")) {
            router.push(`/submission/${submissionId}/result`);
          } else {
            setError(data.error);
          }
        }
      } catch {
        setError("Төлбөрийн мэдээлэл авахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [submissionId, router]);

  useEffect(() => {
    if (!qpayData) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/results/${submissionId}`);
        const data = await res.json();
        if (data.success) {
          clearInterval(interval);
          router.push(`/submission/${submissionId}/result`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [qpayData, submissionId, router]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', color:'#64748b' }}>
        <Loader2 size={24} style={{ animation:'spin 1s linear infinite' }} />
        <span>Нэхэмжлэх үүсгэж байна...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ background:'rgba(15,23,42,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'40px', maxWidth:'400px', textAlign:'center' }}>
          <p style={{ color:'#f87171', fontWeight:600, marginBottom:'16px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ color:'#7c9eff', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width:'100%', maxWidth:'440px', background:'rgba(15,23,42,0.88)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'40px', boxShadow:'0 0 80px rgba(124,158,255,0.07)' }}
      >
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:56, height:56, borderRadius:'16px', background:'rgba(134,239,172,0.1)', border:'1px solid rgba(134,239,172,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckCircle2 size={28} color="#86efac" />
          </div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#ffffff', marginBottom:'8px' }}>Таны хариу бэлэн!</h1>
          <p style={{ color:'#64748b', fontSize:'0.875rem', lineHeight:1.6 }}>Үр дүнгээ харахын тулд QR кодыг уншуулна уу.</p>
        </div>

        {qpayData && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'24px', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', color:'#64748b', fontSize:'0.8rem', fontWeight:600, marginBottom:'20px', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              <QrCode size={14} /> QPay QR код
            </div>
            <img
              src={`data:image/png;base64,${qpayData.qr_image}`}
              alt="QPay QR"
              style={{ width:180, height:180, borderRadius:'12px', background:'#ffffff', padding:'8px', margin:'0 auto', display:'block' }}
            />
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(124,158,255,0.08)', border:'1px solid rgba(124,158,255,0.15)', borderRadius:'100px', padding:'10px 20px', marginBottom:'20px' }}>
          <Loader2 size={14} color="#7c9eff" style={{ animation:'spin 1s linear infinite' }} />
          <span style={{ color:'#7c9eff', fontSize:'0.8rem', fontWeight:600 }}>Төлбөр хүлээгдэж байна...</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', color:'#475569', fontSize:'0.75rem' }}>
          <ShieldCheck size={12} />
          Төлбөр амжилттай болмогц автоматаар шилжинэ.
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
