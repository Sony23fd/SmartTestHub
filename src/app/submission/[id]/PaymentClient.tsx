"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Loader2, QrCode, Copy } from "lucide-react";

interface QPayData {
  invoice_id: string;
  qr_image: string;
  shortId?: string;
  urls: { name: string; logo: string; link: string }[];
}

export default function PaymentClient({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [qpayData, setQpayData] = useState<QPayData | null>(null);
  const [manualInfo, setManualInfo] = useState<{ price: number; name: string; account: string; accountName: string; shortId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Verification states
  const [verifyPhone, setVerifyPhone] = useState("");
  const [verifySession, setVerifySession] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"IDLE" | "PENDING" | "VERIFIED" | "EXPIRED">("IDLE");

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
          setManualInfo({ ...data.bankInfo, shortId: data.shortId });
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
    let delay = 3500;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/results/${submissionId}`);
        const data = await res.json();
        if (data.success) {
          router.push(`/submission/${submissionId}/result`);
          return;
        }
      } catch (e) {
        console.error("Polling error", e);
      }
      
      delay = Math.min(delay + 2000, 15000);
      timeoutId = setTimeout(poll, delay);
    };

    timeoutId = setTimeout(poll, delay);
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [qpayData, manualInfo, submissionId, router]);

  useEffect(() => {
    if (verifyStatus !== "PENDING" || !verifySession) return;
    
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const pollVerify = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/verify/status?sessionId=${verifySession.sessionId}`);
        const data = await res.json();
        if (data.success) {
          if (data.data.sessionStatus === "VERIFIED") {
            setVerifyStatus("VERIFIED");
            return;
          } else if (data.data.sessionStatus === "EXPIRED") {
            setVerifyStatus("EXPIRED");
            return;
          }
        }
      } catch (e) {
        console.error("Verification poll error", e);
      }
      
      timeoutId = setTimeout(pollVerify, 3000);
    };

    timeoutId = setTimeout(pollVerify, 3000);
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [verifyStatus, verifySession]);

  const handleStartVerify = async () => {
    if (verifyPhone.length < 8) return;
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/verify/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, phone: verifyPhone })
      });
      const data = await res.json();
      if (data.success) {
        setVerifySession(data.data);
        setVerifyStatus("PENDING");
      } else {
        alert(data.error || "Алдаа гарлаа");
      }
    } catch {
      alert("Сүлжээний алдаа");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', color:'#64748b' }}>
        <Loader2 size={24} color="#0284c7" style={{ animation:'spin 1s linear infinite' }} />
        <span>Нэхэмжлэх үүсгэж байна...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ background:'#ffffff', border:'1.5px solid #e2e8f0', borderRadius:'24px', padding:'40px', maxWidth:'400px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.06)' }}>
          <p style={{ color:'#e11d48', fontWeight:700, marginBottom:'16px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ color:'#0284c7', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontWeight:700 }}>
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width:'100%', maxWidth:'460px', background:'#ffffff', border:'1.5px solid rgba(226,232,240,0.9)', borderRadius:'28px', padding:'clamp(24px, 6vw, 40px) clamp(20px, 5vw, 40px)', boxShadow:'0 20px 60px -15px rgba(0,0,0,0.12)' }}
      >
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:56, height:56, borderRadius:'18px', background:'rgba(16,185,129,0.12)', border:'1.5px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckCircle2 size={30} color="#059669" />
          </div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0f172a', marginBottom:'6px', letterSpacing:'-0.02em' }}>Таны хариу бэлэн!</h1>
          <p style={{ color:'#64748b', fontSize:'0.9rem', lineHeight:1.6 }}>Үр дүнгээ нээхийн тулд QR кодыг уншуулна уу.</p>
        </div>

        {/* Save Result via Phone Box */}
        <div style={{ background: 'rgba(240, 249, 255, 0.95)', border: '1.5px solid rgba(186, 230, 253, 0.9)', borderRadius: '18px', padding: '18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#0369a1', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>📱</span> 
            <div style={{ width: '100%' }}>
              <strong style={{ color: '#0c4a6e' }}>Хариугаа утсандаа хадгалах уу?</strong>
              {verifyStatus === "IDLE" && (
                <div style={{ marginTop: "8px" }}>
                  <p style={{ marginBottom: "8px", fontSize: "0.8rem", color: "#0369a1" }}>Та хариугаа устгахгүйгээр дараа хүссэн үедээ үзэхийн тулд утасны дугаараа оруулна уу.</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input 
                      type="tel" 
                      placeholder="Утасны дугаар" 
                      value={verifyPhone} 
                      onChange={e => setVerifyPhone(e.target.value)}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#fff", color: "#0f172a", outline: "none", minWidth: 0, fontWeight: 600 }}
                    />
                    <button 
                      onClick={handleStartVerify}
                      disabled={verifyLoading || verifyPhone.length < 8}
                      style={{ padding: "9px 16px", borderRadius: "10px", border: "none", background: "#0284c7", color: "#ffffff", fontWeight: 700, cursor: verifyLoading || verifyPhone.length < 8 ? "not-allowed" : "pointer", fontSize: "0.85rem" }}
                    >
                      {verifyLoading ? "..." : "Хадгалах"}
                    </button>
                  </div>
                </div>
              )}
              {verifyStatus === "PENDING" && verifySession && (
                <div style={{ marginTop: "8px", padding: "12px", background: "#fff", borderRadius: "10px", border: "1px solid #bae6fd" }}>
                  <p style={{ marginBottom: "10px", color: "#0f172a", fontSize: "0.82rem" }}>{verifySession.displayInstruction}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0284c7", fontSize: "0.8rem", fontWeight: 600 }}>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Мессэж хүлээж байна...
                  </div>
                </div>
              )}
              {verifyStatus === "VERIFIED" && (
                <div style={{ marginTop: "8px", padding: "8px 12px", background: "rgba(240, 253, 244, 0.9)", border: "1px solid #bbf7d0", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", color: "#15803d", fontWeight: 700, fontSize: "0.85rem" }}>
                  <CheckCircle2 size={16} /> Таны дугаар дээр амжилттай хадгалагдлаа!
                </div>
              )}
              {verifyStatus === "EXPIRED" && (
                <div style={{ marginTop: "8px", padding: "8px", background: "#fef2f2", borderRadius: "8px", color: "#b91c1c", fontSize: "0.8rem" }}>
                  Хугацаа дууссан байна. Хуудсаа refresh хийгээд дахин оролдоно уу.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning & Copy Link */}
        <div style={{ background: 'rgba(254, 243, 199, 0.85)', border: '1.5px solid rgba(251, 191, 36, 0.5)', borderRadius: '18px', padding: '16px', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#92400e', fontSize: '0.8rem', lineHeight: 1.5 }}>
            <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>⚠️</span> 
            <span>Банкны апп руу шилжих бол холбоосоо хуулж аваарай! Төлбөр төлмөгц хуудас автоматаар шинэчлэгдэнэ.</span>
          </div>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: '1px solid #fde68a', color: '#78350f', padding: '9px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
            {isCopied ? <CheckCircle2 size={16} color="#16a34a" /> : <Copy size={16} />}
            {isCopied ? 'Хуулагдлаа!' : 'Миний хариуны линкийг хуулах'}
          </button>
        </div>

        {/* QPay Section */}
        {qpayData && (
          <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'20px', padding:'24px', marginBottom:'22px', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', color:'#64748b', fontSize:'0.75rem', fontWeight:800, marginBottom:'18px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              <QrCode size={15} /> QPay QR код
            </div>
            <img
              src={`data:image/png;base64,${qpayData.qr_image}`}
              alt="QPay QR"
              style={{ width:180, height:180, borderRadius:'14px', background:'#ffffff', padding:'8px', margin:'0 auto', display:'block', border:'1px solid #cbd5e1' }}
            />
            {qpayData.urls && qpayData.urls.length > 0 && (
              <div style={{ marginTop: '22px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '14px' }}>Банкны апп-аараа шууд нэвтэрч төлөх:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(66px, 1fr))', gap: '14px 8px' }}>
                  {qpayData.urls.map((app, i) => (
                    <a key={i} href={app.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={app.logo} alt={app.name} style={{ width: 44, height: 44, borderRadius: '12px', background: '#fff', padding: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      <span style={{ color: '#334155', fontSize: '0.64rem', fontWeight: 600, textAlign: 'center', width: '100%', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>{app.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Info */}
        {manualInfo && (
          <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'20px', padding:'22px', marginBottom:'22px', textAlign:'left' }}>
            <h3 style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 800, marginBottom: "14px", textAlign: "center" }}>Дансаар шилжүүлэх</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Банк:</span>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>{manualInfo.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Данс:</span>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>{manualInfo.account}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Нэр:</span>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>{manualInfo.accountName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px dashed #cbd5e1", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Дүн:</span>
              <span style={{ color: "#16a34a", fontWeight: 800 }}>{manualInfo.price.toLocaleString('en-US')} ₮</span>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.5, textAlign: "center", margin: 0 }}>
              Гүйлгээний утга дээр <strong style={{ color: "#0f172a" }}>утасны дугаараа</strong> бичнэ үү.
            </p>
          </div>
        )}

        {/* Check Button */}
        <button 
          onClick={handleManualCheck}
          disabled={isChecking}
          style={{ width: '100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background: isChecking ? 'rgba(22, 163, 74, 0.6)' : '#16a34a', border: 'none', borderRadius:'14px', padding:'16px', marginBottom:'16px', color:'#fff', fontSize:'0.95rem', fontWeight:800, cursor: isChecking ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 18px rgba(22, 163, 74, 0.3)' }}
        >
          {isChecking ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
          {isChecking ? 'Шалгаж байна...' : 'Би төлбөрөө төлсөн (Шалгах)'}
        </button>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', color:'#64748b', fontSize:'0.75rem', fontWeight:600 }}>
          <ShieldCheck size={14} color="#16a34a" />
          Төлбөр амжилттай болмогц автоматаар шилжинэ.
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
