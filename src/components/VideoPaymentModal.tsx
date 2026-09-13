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
} from "lucide-react";

interface VideoPaymentModalProps {
  videoId: string;
  videoTitle: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accessToken: string, phone: string) => void;
}

export default function VideoPaymentModal({
  videoId,
  videoTitle,
  price,
  isOpen,
  onClose,
  onSuccess,
}: VideoPaymentModalProps) {
  const [step, setStep] = useState<"PHONE" | "PAYMENT">("PHONE");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orderData, setOrderData] = useState<{
    orderId: string;
    shortId: string;
    qr_image?: string;
    urls?: { name: string; logo: string; link: string }[];
    price: number;
  } | null>(null);

  const [manualBank, setManualBank] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("PHONE");
      setError("");
      setLoading(false);
      setOrderData(null);
    }
  }, [isOpen]);

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
        if (data.alreadyPaid && data.accessToken) {
          onSuccess(data.accessToken, cleanPhone);
          return;
        }

        setOrderData(data.data);
        setStep("PAYMENT");
      } else if (data.qpayDisabled) {
        setManualBank(data.bankInfo);
        setStep("PAYMENT");
      } else {
        setError(data.error || "Нэхэмжлэх үүсгэхэд алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== "PAYMENT" || !orderData?.orderId) return;

    let isActive = true;
    let timeoutId: NodeJS.Timeout;
    let interval = 3000;

    const checkStatus = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/video-payments/status?orderId=${orderData.orderId}`);
        const data = await res.json();

        if (data.success && data.isPaid && data.accessToken) {
          onSuccess(data.accessToken, phone);
          return;
        }
      } catch (err) {
        console.error("Payment status poll error:", err);
      }

      timeoutId = setTimeout(checkStatus, interval);
    };

    timeoutId = setTimeout(checkStatus, interval);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [step, orderData, phone, onSuccess]);

  const handleManualCheck = async () => {
    if (!orderData?.orderId) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/video-payments/status?orderId=${orderData.orderId}`);
      const data = await res.json();
      if (data.success && data.isPaid && data.accessToken) {
        onSuccess(data.accessToken, phone);
      } else {
        setTimeout(() => setIsChecking(false), 1200);
      }
    } catch {
      setIsChecking(false);
    }
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 100,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#ffffff",
            border: "1.5px solid rgba(226, 232, 240, 0.9)",
            borderRadius: "28px",
            padding: "32px 28px",
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.18), 0 0 40px rgba(2,132,199,0.08)",
            maxHeight: "92vh",
            overflowY: "auto",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(241, 245, 249, 0.9)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
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

          {/* Title Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#c2410c",
                background: "rgba(255, 237, 213, 0.9)",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                padding: "4px 12px",
                borderRadius: "100px",
              }}
            >
              ҮЗЭХ ЭРХ АВАХ
            </span>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: "10px",
                lineHeight: 1.4,
              }}
            >
              {videoTitle}
            </h3>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#0284c7",
                marginTop: "6px",
              }}
            >
              {price.toLocaleString("en-US")} ₮
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                background: "rgba(254, 226, 226, 0.9)",
                border: "1px solid rgba(252, 165, 165, 0.9)",
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "20px",
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

          {/* STEP 1: Enter Phone Number */}
          {step === "PHONE" && (
            <form onSubmit={handleStartPayment}>
              <div style={{ marginBottom: "22px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#334155",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Утасны дугаар (Эрх хадгалах, сэргээхэд ашиглана)
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
                  💡 Таны эрх энэ дугаар дээр бүртгэгдэх тул хэзээ ч хаанаас ч дахин үзэх боломжтой.
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
                    <span>Нэхэмжлэх бэлтгэж байна...</span>
                  </>
                ) : (
                  <>
                    <span>QPay-ээр төлөх</span>
                    <span style={{ opacity: 0.9 }}>({price.toLocaleString("en-US")}₮)</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* STEP 2: QPay QR & Bank deep links */}
          {step === "PAYMENT" && orderData && (
            <div>
              <div
                style={{
                  background: "rgba(254, 243, 199, 0.9)",
                  border: "1px solid rgba(251, 191, 36, 0.5)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  marginBottom: "18px",
                  fontSize: "0.8rem",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>Банкны апп руу шилжих бол холбоосоо хуулж аваарай. Төлбөр төлмөгц видео автоматаар нээгдэнэ.</span>
              </div>

              {orderData.qr_image && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "20px",
                    padding: "20px",
                    textAlign: "center",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      color: "#64748b",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      marginBottom: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    <QrCode size={14} /> QPay QR код
                  </div>

                  <img
                    src={`data:image/png;base64,${orderData.qr_image}`}
                    alt="QPay QR"
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: "14px",
                      background: "#ffffff",
                      padding: "8px",
                      margin: "0 auto",
                      display: "block",
                      border: "1px solid #cbd5e1",
                    }}
                  />

                  {orderData.urls && orderData.urls.length > 0 && (
                    <div style={{ marginTop: "18px" }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontWeight: 600,
                          marginBottom: "12px",
                        }}
                      >
                        Эсвэл банкны апп-аараа шууд төлөх:
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
                          gap: "12px 6px",
                        }}
                      >
                        {orderData.urls.map((app, i) => (
                          <a
                            key={i}
                            href={app.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "6px",
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
                                width: 42,
                                height: 42,
                                borderRadius: "12px",
                                background: "#fff",
                                padding: "2px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            />
                            <span
                              style={{
                                color: "#334155",
                                fontSize: "0.64rem",
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
                    padding: "20px",
                    marginBottom: "18px",
                  }}
                >
                  <h4 style={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px" }}>
                    Дансаар шилжүүлэх
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.8 }}>
                    <div><strong>Банк:</strong> {manualBank.name}</div>
                    <div><strong>Данс:</strong> {manualBank.account}</div>
                    <div><strong>Хүлээн авагч:</strong> {manualBank.accountName}</div>
                    <div><strong>Дүн:</strong> {price.toLocaleString("en-US")} ₮</div>
                    <div><strong>Гүйлгээний утга:</strong> {phone}</div>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualCheck}
                disabled={isChecking}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  background: isChecking ? "rgba(22, 163, 74, 0.6)" : "#16a34a",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  cursor: isChecking ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "10px",
                  boxShadow: "0 4px 15px rgba(22, 163, 74, 0.3)",
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
                    <span>Би төлсөн (Шалгах)</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={copyCurrentUrl}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  color: "#475569",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Copy size={14} />
                <span>{copiedLink ? "Холбоос хуулагдлаа!" : "Хуудасны холбоосыг хуулах"}</span>
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
            <span>QPay найдвартай төлбөрийн систем</span>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AnimatePresence>
  );
}
