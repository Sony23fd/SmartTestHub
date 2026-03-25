"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Loader2, QrCode, Copy } from "lucide-react";

interface QPayData {
  invoice_id: string;
  qr_image: string;
  urls: { name: string; logo: string; link: string }[];
}

export default function PaymentClient({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [qpayData, setQpayData] = useState<QPayData | null>(null);
  const [manualInfo, setManualInfo] = useState<{ price: number; name: string; account: string; accountName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`/api/results/${submissionId}`);
      const data = await res.json();
      if (data.success) {
        router.push(`/submission/${submissionId}/result`);
      } else {
        setTimeout(() => setIsChecking(false), 1500);
      }
    } catch {
      setIsChecking(false);
    }
  };

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
        } else if (data.qpayDisabled) {
          setManualInfo(data.bankInfo);
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
    if (!qpayData && !manualInfo) return;
    
    let timeoutId: NodeJS.Timeout;
    let delay = 3500; // Start at 3.5s
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/results/${submissionId}`);
        const data = await res.json();
        if (data.success) {
          router.push(`/submission/${submissionId}/result`);
          return; // Stop polling
        }
      } catch (e) {
        console.error("Polling error", e);
      }
      
      // Exponential backoff: increase delay gradually, cap at 15 seconds
      delay = Math.min(delay + 2000, 15000);
      timeoutId = setTimeout(poll, delay);
    };

    timeoutId = setTimeout(poll, delay);
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [qpayData, manualInfo, submissionId, router]);

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

        <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#fde047', fontSize: '0.8rem', lineHeight: 1.5 }}>
            <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>⚠️</span> 
            <span>Та гар утаснаасаа банкны апп руу шилжих эсвэл хөтчөө хаавал доорх линкийг заавал хуулж аваарай!</span>
          </div>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '10px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
            {isCopied ? <CheckCircle2 size={16} color="#86efac" /> : <Copy size={16} />}
            {isCopied ? 'Хуулагдлаа!' : 'Миний хариуны линкийг хуулах'}
          </button>
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
            {qpayData.urls && qpayData.urls.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>Эсвэл банкны апп-аараа шууд нэвтэрч төлөх:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '16px 8px' }}>
                  {qpayData.urls.map((app, i) => (
                    <a key={i} href={app.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={app.logo} alt={app.name} style={{ width: 44, height: 44, borderRadius: '12px', background: '#fff', padding: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                      <span style={{ color: '#cbd5e1', fontSize: '0.65rem', textAlign: 'center', width: '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>{app.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {manualInfo && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', marginBottom:'24px', textAlign:'left' }}>
            <h3 style={{ color: "#fde68a", fontSize: "1rem", fontWeight: 700, marginBottom: "16px", textAlign: "center" }}>Дансаар шилжүүлэх</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Банк:</span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>{manualInfo.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Данс:</span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>{manualInfo.account}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Нэр:</span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>{manualInfo.accountName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Дүн:</span>
              <span style={{ color: "#86efac", fontWeight: 700 }}>{manualInfo.price.toLocaleString('en-US')} ₮</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, textAlign: "center" }}>
              Гүйлгээний утга дээр <strong style={{ color: "#fff" }}>утасны дугаараа</strong> бичнэ үү. Төлбөр баталгаажмагц энэ хуудас автоматаар шинэчлэгдэх болно.
            </p>
          </div>
        )}

        <button 
          onClick={handleManualCheck}
          disabled={isChecking}
          style={{ width: '100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background: isChecking ? 'rgba(22, 163, 74, 0.5)' : '#16a34a', border: 'none', borderRadius:'14px', padding:'16px', marginBottom:'16px', color:'#fff', fontSize:'0.95rem', fontWeight:600, cursor: isChecking ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(22, 163, 74, 0.3)' }}
        >
          {isChecking ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
          {isChecking ? 'Шалгаж байна...' : 'Би төлбөрөө төлсөн (Шалгах)'}
        </button>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', color:'#475569', fontSize:'0.75rem' }}>
          <ShieldCheck size={12} />
          Төлбөр амжилттай болмогц автоматаар шилжинэ.
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
