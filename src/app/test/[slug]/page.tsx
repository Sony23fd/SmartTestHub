import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import Link from "next/link";
import { ArrowLeft, Clock, FileQuestion, ArrowRight, Brain, Activity, Heart, Smile, Star, Target, Users, Compass, Book, Award, Shield, Zap, Flame, PieChart, Lightbulb, Code, Coffee, Briefcase } from "lucide-react";

const iconMap: Record<string, any> = { Brain, Activity, Heart, Smile, Star, Target, Users, Compass, Book, Award, Shield, Zap, Flame, PieChart, Lightbulb, Code, Coffee, Briefcase };

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TestPreviewPage({ params }: Props) {
  await connectToDatabase();
  const { slug } = await params;
  const test = await Test.findOne({ slug }).lean() as any;

  if (!test) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(15,23,42,0.75)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'40px', textAlign:'center', color:'#94a3b8' }}>
          Тест олдсонгүй. <Link href="/" style={{ color: '#7c9eff' }}>Буцах</Link>
        </div>
      </main>
    );
  }

  const IconComp = iconMap[test.icon || 'Brain'] || Brain;
  const questionCount = await Question.countDocuments({ testId: test._id });

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '32px', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} /> Нүүр хуудас
        </Link>

        {/* Main Card */}
        <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'40px', boxShadow: '0 0 60px rgba(124,158,255,0.05)' }}>
          {/* Badge – brand label */}
          <div style={{ marginBottom: '24px', textAlign:'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569' }}>
              SMART TEST HUB
            </span>
          </div>

          {/* Icon */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
            <div style={{ width:56, height:56, borderRadius:'16px', background:'rgba(124,158,255,0.12)', border:'1px solid rgba(124,158,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconComp size={28} color="#7c9eff" />
            </div>
          </div>

          {/* Price */}
          <div style={{ textAlign:'center', marginBottom:'12px' }}>
            <span style={{ fontSize:'11px', fontWeight:600, color:'#7c9eff', background:'rgba(124,158,255,0.12)', padding:'4px 12px', borderRadius:'100px' }}>
              {test.price === 0 ? 'ҮНЭГҮЙ' : `${test.price.toLocaleString('en-US')} ₮`}
            </span>
          </div>

          <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#ffffff', textAlign:'center', marginBottom:'12px', letterSpacing:'-0.02em', lineHeight:1.3 }}>
            {test.title}
          </h1>

          <p style={{ color:'#64748b', fontSize:'0.9rem', lineHeight:1.7, textAlign:'center', marginBottom:'32px' }}>
            {test.description}
          </p>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'32px' }}>
            {[
              { icon: <FileQuestion size={16} color="#7c9eff" />, label: 'Нийт асуулт', value: `${questionCount}` },
              { icon: <Clock size={16} color="#7c9eff" />, label: 'Хугацаа', value: `~${Math.max(1, Math.ceil(questionCount * 0.5))} мин` },
            ].map((stat, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', background:'rgba(124,158,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize:'0.7rem', color:'#475569', fontWeight:500, marginBottom:'2px' }}>{stat.label}</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#ffffff' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <style>{`.start-btn { width:100%; padding:16px; border-radius:14px; background:#ffffff; color:#0a0d17; font-weight:700; font-size:1rem; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s; text-decoration:none; } .start-btn:hover { background:#e2e8f0; }`}</style>
          <Link href={`/test/${test.slug}/take`} className="start-btn">
            Тест эхлэх <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}
