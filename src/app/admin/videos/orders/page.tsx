"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";

interface OrderItem {
  _id: string;
  shortId: string;
  amount: number;
  phoneNumber: string;
  paymentStatus: "PENDING" | "PAID";
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  videoId?: {
    title: string;
    slug: string;
    duration?: string;
  };
}

export default function AdminVideoOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, paidOrders: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchPhone) params.set("phone", searchPhone);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/videos/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Top Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            href="/admin/videos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            <ArrowLeft size={16} /> Видеоны жагсаалт руу буцах
          </Link>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff" }}>
            Видео худалдан авалтын тайлан
          </h1>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Нийт оролдлого</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
              {stats.totalOrders}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Төлбөр төлөгдсөн</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#86efac", marginTop: "4px" }}>
              {stats.paidOrders}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Нийт орлого (₮)</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#7c9eff", marginTop: "4px" }}>
              {stats.totalEarnings.toLocaleString("en-US")} ₮
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "360px" }}>
            <input
              type="text"
              placeholder="Утасны дугаараар хайх..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(124,158,255,0.15)",
                border: "1px solid rgba(124,158,255,0.25)",
                color: "#7c9eff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <Search size={14} /> Хайх
            </button>
          </form>

          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Бүгд", val: "" },
              { label: "Төлөгдсөн", val: "PAID" },
              { label: "Хүлээгдэж буй", val: "PENDING" },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setStatusFilter(f.val)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: statusFilter === f.val ? "#7c9eff" : "rgba(255,255,255,0.05)",
                  color: statusFilter === f.val ? "#0f172a" : "#94a3b8",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
              <div>Уншиж байна...</div>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              Захиалга олдсонгүй.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
                    <th style={{ padding: "14px 20px" }}>Код</th>
                    <th style={{ padding: "14px 20px" }}>Видео</th>
                    <th style={{ padding: "14px 20px" }}>Утас</th>
                    <th style={{ padding: "14px 20px" }}>Дүн</th>
                    <th style={{ padding: "14px 20px" }}>Төлөв</th>
                    <th style={{ padding: "14px 20px" }}>Огноо</th>
                    <th style={{ padding: "14px 20px" }}>Дуусах</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o._id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        color: "#cbd5e1",
                      }}
                    >
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "#7c9eff" }}>
                        {o.shortId}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: "#ffffff", maxWidth: "200px" }}>
                        {o.videoId?.title || "Тодорхойгүй видео"}
                      </td>
                      <td style={{ padding: "16px 20px", fontFamily: "monospace" }}>
                        {o.phoneNumber}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "#86efac" }}>
                        {o.amount.toLocaleString("en-US")} ₮
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "100px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: o.paymentStatus === "PAID" ? "rgba(134,239,172,0.1)" : "rgba(250,204,21,0.1)",
                            color: o.paymentStatus === "PAID" ? "#86efac" : "#facc15",
                          }}
                        >
                          {o.paymentStatus === "PAID" ? "ТӨЛӨГДСӨН" : "ХҮЛЭЭГДЭЖ БУЙ"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "0.78rem" }}>
                        {new Date(o.createdAt).toLocaleString("mn-MN")}
                      </td>
                      <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "0.78rem" }}>
                        {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString("mn-MN") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
