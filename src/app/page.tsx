import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import TestGrid from "./TestGrid";

export const revalidate = 0;

export default async function HomePage() {
  await connectToDatabase();
  const tests = await Test.find().sort({ order: 1, createdAt: -1 }).lean();

  const serialized = tests.map((t: any) => ({
    id: t._id.toString(),
    slug: t.slug,
    title: t.title,
    price: t.price,
    icon: t.icon || 'Brain',
    description: t.description || '',
  }));

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px', maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="Smart Test Hub" style={{ width: '100%', maxWidth: '176px', height: 'auto', objectFit: 'contain' }} />
        </div>
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
      <div style={{ marginTop: 60, color: '#9ba8b9ff', fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span>© 2026 Хөгжүүлсэн:</span>
        <a
          href="https://www.facebook.com/engiineeer"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7c9eff', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
        >
          Engiineer
        </a>
      </div>
    </main>
  );
}
