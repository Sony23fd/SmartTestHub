"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Trash2, Loader2, GripVertical } from "lucide-react";

interface QuestionOption { text: string; score: number; }
interface Question { _id: string; text: string; options: QuestionOption[]; order: number; }

const card = { background:"rgba(15,23,42,0.85)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"24px" };
const inputStyle = { width:"100%", padding:"10px 13px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#ffffff", fontSize:"0.875rem", outline:"none", boxSizing:"border-box" as const };
const labelStyle = { display:"block", fontSize:"0.7rem", fontWeight:600 as const, color:"#64748b", marginBottom:"5px", textTransform:"uppercase" as const, letterSpacing:"0.05em" };

export default function QuestionsPage() {
  const params = useParams();
  const testId = params.id as string;

  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);

  // New question form state
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState<QuestionOption[]>([
    { text: "Тийм, ихэвчлэн", score: 1 },
    { text: "Үгүй, огт үгүй", score: 0 },
  ]);

  const fetchData = async () => {
    const [testRes, qRes] = await Promise.all([
      fetch(`/api/admin/tests/${testId}`),
      fetch(`/api/admin/questions?testId=${testId}`),
    ]);
    const testData = await testRes.json();
    const qData = await qRes.json();
    if (testData.success) setTestTitle(testData.data.title);
    if (qData.success) setQuestions(qData.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [testId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Асуултыг устгах уу?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    await fetchData();
    setDeletingId(null);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAddingQuestion(true);

    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId,
        text: newText,
        order: questions.length + 1,
        options: newOptions,
      }),
    });

    setNewText("");
    setNewOptions([{ text: "Тийм, ихэвчлэн", score: 1 }, { text: "Үгүй, огт үгүй", score: 0 }]);
    setAddingQuestion(false);
    await fetchData();
  };

  const updateOption = (i: number, field: "text" | "score", value: any) => {
    const updated = [...newOptions];
    updated[i] = { ...updated[i], [field]: value };
    setNewOptions(updated);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 size={26} color="#7c9eff" style={{ animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", padding:"32px 20px" }}>
      <div style={{ maxWidth:"760px", margin:"0 auto" }}>
        <Link href="/admin" style={{ display:"inline-flex", alignItems:"center", gap:"8px", color:"#64748b", textDecoration:"none", fontSize:"0.875rem", marginBottom:"24px" }}>
          <ArrowLeft size={16} /> Буцах
        </Link>
        <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:"#ffffff", marginBottom:"6px", letterSpacing:"-0.02em" }}>Асуулт удирдах</h1>
        <p style={{ color:"#64748b", fontSize:"0.875rem", marginBottom:"28px" }}>{testTitle}</p>

        {/* Existing questions */}
        <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"24px" }}>
          {questions.length === 0 && (
            <div style={{ ...card, textAlign:"center", color:"#475569", padding:"32px" }}>Асуулт байхгүй байна. Доороос нэмнэ үү.</div>
          )}
          {questions.map((q, i) => (
            <div key={q._id} style={{ ...card, display:"flex", gap:"14px", padding:"18px 20px" }}>
              <div style={{ color:"#334155", paddingTop:2, flexShrink:0 }}>
                <GripVertical size={16} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                  <div>
                    <span style={{ fontSize:"0.75rem", color:"#475569", fontWeight:600, marginBottom:"6px", display:"block" }}>
                      #{i + 1}
                    </span>
                    <p style={{ color:"#e2e8f0", fontSize:"0.9rem", lineHeight:1.5, marginBottom:"10px" }}>{q.text}</p>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {q.options.map((opt, oi) => (
                        <span key={oi} style={{ fontSize:"0.78rem", padding:"3px 10px", borderRadius:"100px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                          {opt.text} <strong style={{ color:"#7c9eff" }}>({opt.score})</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(q._id)} disabled={deletingId === q._id} style={{ padding:"7px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:"8px", color:"#f87171", cursor:"pointer", flexShrink:0 }}>
                    {deletingId === q._id ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add new question form */}
        <div style={card}>
          <h2 style={{ color:"#ffffff", fontWeight:700, fontSize:"0.95rem", marginBottom:"20px", display:"flex", alignItems:"center", gap:"8px" }}>
            <PlusCircle size={18} color="#7c9eff" /> Шинэ асуулт нэмэх
          </h2>
          <form onSubmit={handleAddQuestion} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div>
              <label style={labelStyle}>Асуулт</label>
              <textarea style={{ ...inputStyle, minHeight:"80px", resize:"vertical" }} value={newText} onChange={e => setNewText(e.target.value)} placeholder="Асуултаа энд бичнэ үү..." required />
            </div>

            <div>
              <label style={labelStyle}>Хариулт сонголтууд</label>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {newOptions.map((opt, i) => (
                  <div key={i} style={{ display:"flex", gap:"8px" }}>
                    <input style={{ ...inputStyle, flex:3 }} value={opt.text} onChange={e => updateOption(i, "text", e.target.value)} placeholder={`Сонголт ${i + 1}`} />
                    <div style={{ display:"flex", alignItems:"center", gap:"6px", flex:1 }}>
                      <span style={{ color:"#475569", fontSize:"0.8rem", whiteSpace:"nowrap" }}>Оноо:</span>
                      <input style={{ ...inputStyle }} type="number" value={opt.score} onChange={e => updateOption(i, "score", Number(e.target.value))} step="0.5" />
                    </div>
                    {newOptions.length > 2 && (
                      <button type="button" onClick={() => setNewOptions(newOptions.filter((_,idx) => idx !== i))} style={{ padding:"8px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)", borderRadius:"8px", color:"#f87171", cursor:"pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setNewOptions([...newOptions, { text:"", score:0 }])} style={{ alignSelf:"flex-start", display:"flex", alignItems:"center", gap:"5px", padding:"6px 12px", background:"rgba(124,158,255,0.08)", border:"1px solid rgba(124,158,255,0.15)", borderRadius:"8px", color:"#7c9eff", fontSize:"0.8rem", cursor:"pointer", fontWeight:600 }}>
                  <PlusCircle size={13} /> Сонголт нэмэх
                </button>
              </div>
            </div>

            <button type="submit" disabled={addingQuestion} style={{ padding:"13px", borderRadius:"12px", background:addingQuestion ? "rgba(255,255,255,0.1)" : "#ffffff", color:addingQuestion ? "#475569" : "#0a0d17", fontWeight:700, fontSize:"0.95rem", border:"none", cursor:addingQuestion ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              {addingQuestion ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Нэмж байна...</> : "Асуулт нэмэх"}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder, input::placeholder { color: #334155; }`}</style>
    </div>
  );
}
