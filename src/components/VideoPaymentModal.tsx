"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  QrCode,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
  AlertCircle,
  Copy,
  Sparkles,
  MessageSquare,
  KeyRound,
  RotateCcw,
  Check,
  Smartphone,
} from "lucide-react";

interface VideoPaymentModalProps {
  videoId: string;
  videoTitle: string;
  price: number;
  isOpen: boolean;
  initialMode?: "PAY" | "RESTORE";
  onClose: () => void;
  onSuccess: (accessToken: string, phone: string) => void;
}

interface VerifyData {
  sessionId: string;
  smsUri: string;
  displayInstruction?: string;
  shortcode?: string;
  text?: string;
  expiresAt?: string;
}

export default function VideoPaymentModal({
  videoId,
  videoTitle,
  price,
  isOpen,
  initialMode = "PAY",
  onClose,
  onSuccess,
}: VideoPaymentModalProps) {
  const [mode, setMode] = useState<"PAY" | "RESTORE">("PAY");
  const [step, setStep] = useState<"PHONE" | "PROCESS">("PHONE");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [shortId, setShortId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [bankUrls, setBankUrls] = useState<{ name: string; logo: string; link: string }[]>([]);
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [manualBank, setManualBank] = useState<any>(null);

  // Status flags from polling
  const [isPaid, setIsPaid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep("PHONE");
      setError("");
      setLoading(false);
      setOrderId(null);
      setShortId(null);
      setQrImage(null);
      setBankUrls([]);
      setVerifyData(null);
      setIsPaid(false);
      setIsVerified(false);
    }
  }, [isOpen, initialMode]);

  // Handle starting a new payment
  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setError("Утасны дугаараа бүрэн оруулна уу (8 орон)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/video-payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.alreadyPaid) {
          // If already paid, switch to restore flow to verify phone via SMS and grant access
          setMode("RESTORE");
          handleStartRestore(e, cleanPhone);
          return;
        }

        setOrderId(data.data.orderId);
        setShortId(data.data.shortId);
        setQrImage(data.data.qr_image || null);
        setBankUrls(data.data.urls || []);
        if (data.data.verify) {
          setVerifyData(data.data.verify);
        }
        setStep("PROCESS");
      } else if (data.qpayDisabled) {
        setOrderId(data.orderId);
        setShortId(data.shortId);
        setManualBank(data.bankInfo);
        if (data.verify) {
          setVerifyData(data.verify);
        }
        setStep("PROCESS");
      } else {
        setError(data.error || "Нэхэмжлэх үүсгэхэд алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  // Handle restoring access with existing phone
  const handleStartRestore = async (e?: React.FormEvent, overridePhone?: string) => {
    if (e) e.preventDefault();
    const cleanPhone = (overridePhone || phone).replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setError("Утасны дугаараа бүрэн оруулна уу (8 орон)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/videos/restore-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderId(data.orderId);
        setVerifyData(data.verify);
        setIsPaid(true); // Since it was already paid
        setStep("PROCESS");
      } else {
        setError(data.error || "Эрх сэргээхэд алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  // Live polling for payment and verification status
  useEffect(() => {
    if (step !== "PROCESS" || !orderId) return;

    let isActive = true;
    let timeoutId: NodeJS.Timeout;
    const interval = 2500;

    const checkStatus = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/video-payments/status?orderId=${orderId}`);
        const data = await res.json();

        if (data.success) {
          if (data.isPaid) setIsPaid(true);
          if (data.isVerified) setIsVerified(true);

          // Both paid and phone verified: grant immediate access!
          if (data.canAccess && data.accessToken) {
            onSuccess(data.accessToken, phone);
            return;
          }
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }

      timeoutId = setTimeout(checkStatus, interval);
    };

    timeoutId = setTimeout(checkStatus, interval);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [step, orderId, phone, onSuccess]);

  const handleManualCheck = async () => {
    if (!orderId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/video-payments/status?orderId=${orderId}`);
      const data = await res.json();
      if (data.success) {
        if (data.isPaid) setIsPaid(true);
        if (data.isVerified) setIsVerified(true);
        if (data.canAccess && data.accessToken) {
          onSuccess(data.accessToken, phone);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyCurrentPage = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 100,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "480px",
            backgroundColor: "#ffffff",
            border: "1.5px solid rgba(226, 232, 240, 0.95)",
            borderRadius: "30px",
            padding: "30px 24px",
            boxShadow: "0 25px 65px -10px rgba(0,0,0,0.2), 0 0 45px rgba(2,132,199,0.1)",
            maxHeight: "92vh",
            overflowY: "auto",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "18px",
              right: "18px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>

          {/* Mode Switch Tabs (Шинээр авах vs Сэргээх) */}
          {step === "PHONE" && (
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: "16px",
                padding: "4px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("PAY");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: mode === "PAY" ? "#ffffff" : "transparent",
                  color: mode === "PAY" ? "#0284c7" : "#64748b",
                  boxShadow: mode === "PAY" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Үзэх эрх авах
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("RESTORE");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: mode === "RESTORE" ? "#ffffff" : "transparent",
                  color: mode === "RESTORE" ? "#0284c7" : "#64748b",
                  boxShadow: mode === "RESTORE" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Эрх сэргээх
              </button>
            </div>
          )}

          {/* Title Header */}
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: mode === "PAY" ? "#c2410c" : "#0369a1",
                background: mode === "PAY" ? "rgba(255, 237, 213, 0.9)" : "rgba(224, 242, 254, 0.9)",
                border: mode === "PAY" ? "1px solid rgba(251, 146, 60, 0.3)" : "1px solid rgba(186, 230, 253, 0.8)",
                padding: "4px 12px",
                borderRadius: "100px",
              }}
            >
              {mode === "PAY" ? "ШИНЭ ҮЗЭХ ЭРХ АВАХ" : "ӨМНӨ АВСАН ЭРХЭЭ СЭРГЭЭХ"}
            </span>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: "10px",
                lineHeight: 1.4,
              }}
            >
              {videoTitle}
            </h3>
            {mode === "PAY" && (
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: "#0284c7",
                  marginTop: "4px",
                }}
              >
                {price.toLocaleString("en-US")} ₮
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "rgba(254, 226, 226, 0.9)",
                border: "1px solid rgba(252, 165, 165, 0.9)",
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 600,
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone input */}
          {step === "PHONE" && (
            <form onSubmit={mode === "PAY" ? handleStartPayment : (e) => handleStartRestore(e)}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#334155",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Утасны дугаар (Баталгаажуулах & эрх хадгалах)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    placeholder="Жишээ: 99112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={12}
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 44px",
                      borderRadius: "14px",
                      backgroundColor: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      color: "#0f172a",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      outline: "none",
                      letterSpacing: "1px",
                    }}
                  />
                  <Phone
                    size={18}
                    color="#0284c7"
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.78rem",
                    marginTop: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  {mode === "PAY"
                    ? "💡 Таны эрх 30 хоног энэ дугаар дээр хадгалагдах бөгөөд өөр утас, төхөөрөмжөөс ч хэзээ ч сэргээн үзэх боломжтой."
                    : "💡 Та өмнө нь төлбөр төлсөн дугаараа оруулна уу. 1 удаагийн SMS-ээр баталгаажин шууд нээгдэнэ."}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "14px",
                  background: loading
                    ? "rgba(2, 132, 199, 0.5)"
                    : "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 25px rgba(2, 132, 199, 0.35)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Бэлтгэж байна...</span>
                  </>
                ) : mode === "PAY" ? (
                  <>
                    <Sparkles size={18} />
                    <span>Үргэлжлүүлэх ({price.toLocaleString("en-US")}₮)</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} />
                    <span>Эрх сэргээх шалгах</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* STEP 2: Dual Verification Process (Payment + SMS) */}
          {step === "PROCESS" && (
            <div>
              {/* Dual Step Indicators */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: mode === "PAY" ? "1fr 1fr" : "1fr",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                {mode === "PAY" && (
                  <div
                    style={{
                      background: isPaid ? "rgba(240, 253, 244, 0.95)" : "rgba(254, 243, 199, 0.9)",
                      border: isPaid ? "1px solid #86efac" : "1px solid #fde68a",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isPaid ? (
                      <CheckCircle2 size={18} color="#16a34a" />
                    ) : (
                      <Loader2 size={18} color="#d97706" style={{ animation: "spin 1.5s linear infinite" }} />
                    )}
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>1-Р АЛХАМ</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 800, color: isPaid ? "#16a34a" : "#92400e" }}>
                        {isPaid ? "Төлбөр төлөгдсөн" : "QPay төлөх"}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: isVerified ? "rgba(240, 253, 244, 0.95)" : "rgba(238, 242, 255, 0.9)",
                    border: isVerified ? "1px solid #86efac" : "1px solid #c7d2fe",
                    borderRadius: "14px",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {isVerified ? (
                    <CheckCircle2 size={18} color="#16a34a" />
                  ) : (
                    <Loader2 size={18} color="#4f46e5" style={{ animation: "spin 1.5s linear infinite" }} />
                  )}
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                      {mode === "PAY" ? "2-Р АЛХАМ" : "БАТАЛГААЖУУЛАЛТ"}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800, color: isVerified ? "#16a34a" : "#3730a3" }}>
                      {isVerified ? "Утас баталгаажсан" : "SMS илгээх"}
                    </div>
                  </div>
                </div>
              </div>

              {/* SMS Verification Card */}
              <div
                style={{
                  background: isVerified ? "#f0fdf4" : "#f8fafc",
                  border: isVerified ? "1.5px solid #86efac" : "1.5px solid #cbd5e1",
                  borderRadius: "18px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Smartphone size={18} color={isVerified ? "#16a34a" : "#0284c7"} />
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>
                    Утасны дугаар: {phone}
                  </span>
                </div>

                {isVerified ? (
                  <div style={{ color: "#15803d", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Таны утасны дугаар амжилттай баталгаажлаа!</span>
                  </div>
                ) : verifyData?.smsUri ? (
                  <div>
                    <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "12px", lineHeight: 1.5 }}>
                      Доорх товчийг дарж өөрийн гар утаснаас 1 товшилтоор SMS илгээн эрхээ баталгаажуулна уу:
                    </p>

                    <a
                      href={verifyData.smsUri}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
                        marginBottom: "10px",
                      }}
                    >
                      <MessageSquare size={16} />
                      <span>Нэг товшилтоор SMS илгээх</span>
                    </a>

                    {verifyData.shortcode && verifyData.text && (
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px dashed #cbd5e1",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        <span>
                          Эсвэл <strong>{verifyData.shortcode}</strong> руу <strong>{verifyData.text}</strong> гэж илгээнэ үү
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(verifyData.text || "")}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 700,
                          }}
                        >
                          {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedCode ? "Хуулагдлаа" : "Хуулах"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>
                    SMS баталгаажуулалтын сесс хүлээгдэж байна...
                  </p>
                )}
              </div>

              {/* QPay Section (Only if in PAY mode and not yet paid) */}
              {mode === "PAY" && !isPaid && (
                <div style={{ marginBottom: "18px" }}>
                  {qrImage && (
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "16px",
                        textAlign: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          color: "#64748b",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          marginBottom: "10px",
                          textTransform: "uppercase",
                        }}
                      >
                        <QrCode size={14} /> QPay QR код (19,000 ₮)
                      </div>

                      <img
                        src={`data:image/png;base64,${qrImage}`}
                        alt="QPay QR"
                        style={{
                          width: 160,
                          height: 160,
                          borderRadius: "14px",
                          background: "#ffffff",
                          padding: "6px",
                          margin: "0 auto",
                          display: "block",
                          border: "1px solid #cbd5e1",
                        }}
                      />

                      {bankUrls && bankUrls.length > 0 && (
                        <div style={{ marginTop: "14px" }}>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              fontWeight: 600,
                              marginBottom: "10px",
                            }}
                          >
                            Эсвэл банкны апп-аараа шууд төлөх:
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                              gap: "10px 4px",
                            }}
                          >
                            {bankUrls.map((app, i) => (
                              <a
                                key={i}
                                href={app.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "4px",
                                  textDecoration: "none",
                                  transition: "transform 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                              >
                                <img
                                  src={app.logo}
                                  alt={app.name}
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "10px",
                                    background: "#fff",
                                    padding: "2px",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                  }}
                                />
                                <span
                                  style={{
                                    color: "#334155",
                                    fontSize: "0.62rem",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    lineHeight: 1.1,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {app.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {manualBank && (
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "16px",
                        marginBottom: "14px",
                      }}
                    >
                      <h4 style={{ color: "#0f172a", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
                        Дансаар шилжүүлэх
                      </h4>
                      <div style={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.7 }}>
                        <div><strong>Банк:</strong> {manualBank.name}</div>
                        <div><strong>Данс:</strong> {manualBank.account}</div>
                        <div><strong>Хүлээн авагч:</strong> {manualBank.accountName}</div>
                        <div><strong>Дүн:</strong> {price.toLocaleString("en-US")} ₮</div>
                        <div><strong>Гүйлгээний утга:</strong> {phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Check Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualCheck}
                disabled={isChecking}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "14px",
                  background: isChecking ? "rgba(22, 163, 74, 0.6)" : "#16a34a",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  cursor: isChecking ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  boxShadow: "0 4px 15px rgba(22, 163, 74, 0.25)",
                }}
              >
                {isChecking ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Шалгаж байна...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Төлбөр & Баталгаажуулалт шалгах</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={copyCurrentPage}
                style={{
                  width: "100%",
                  padding: "9px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  color: "#475569",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Copy size={13} />
                <span>{copiedPage ? "Холбоос хуулагдлаа!" : "Хуудасны холбоосыг хуулах"}</span>
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              color: "#64748b",
              fontSize: "0.75rem",
              marginTop: "16px",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} color="#16a34a" />
            <span>QPay & verify.mn баталгаажсан найдвартай систем</span>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AnimatePresence>
  );
}
