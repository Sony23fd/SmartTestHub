import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import TestGrid from "./TestGrid";

export const revalidate = 0;

export default async function HomePage() {
  await connectToDatabase();
  const tests = await Test.find().sort({ createdAt: -1 }).lean();

  const serialized = tests.map((t: any) => ({
    id: t._id.toString(),
    slug: t.slug,
    title: t.title,
    price: t.price,
    description: t.description || '',
  }));

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px', maxWidth: '520px' }}>
        <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569', marginBottom: '16px' }}>
          SMART TEST HUB
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.02em' }}>
          Тестээ сонгоод үргэлжлүүлээрэй.
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7 }}>
          Шинжлэх ухааны үндэслэлтэй тестүүд.
        </p>
      </div>

      {/* Test Cards Grid */}
      {serialized.length === 0 ? (
        <div style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', color: '#64748b' }}>
          Тест байхгүй байна. <a href="/api/seed" style={{ color: '#7c9eff' }}>/api/seed</a> ажиллуулна уу.
        </div>
      ) : (
        <TestGrid tests={serialized} />
      )}

      {/* Footer */}
      <div style={{ marginTop: 60, color: '#334155', fontSize: '0.8rem' }}>
        © 2026 Smart Test Hub
      </div>
    </main>
  );
}
