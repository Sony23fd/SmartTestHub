"use client";

import Link from "next/link";
import { ArrowRight, Brain, Activity, Heart, Smile, Star, Target, Users, Compass, Book, Award, Shield, Zap, Flame, PieChart, Lightbulb, Code, Coffee, Briefcase } from "lucide-react";

export const iconMap: Record<string, any> = {
  Brain, Activity, Heart, Smile, Star, Target, Users, Compass, Book, Award, Shield, Zap, Flame, PieChart, Lightbulb, Code, Coffee, Briefcase
};
import { useState } from "react";

interface TestCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  icon?: string;
  description?: string;
}

function TestCard({ id, slug, title, price, icon, description }: TestCardProps) {
  const [hovered, setHovered] = useState(false);
  const IconComp = iconMap[icon || 'Brain'] || Brain;

  return (
    <Link href={`/test/${slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(22,32,55,0.9)' : 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '20px',
          padding: '28px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          height: '100%',
          boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(124,158,255,0.12)',
            border: '1px solid rgba(124,158,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '18px',
          }}
        >
          <IconComp size={20} color="#7c9eff" />
        </div>

        {/* Price badge */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#7c9eff',
            background: 'rgba(124,158,255,0.12)',
            padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.05em',
          }}>
            {price === 0 ? 'ҮНЭГҮЙ' : `${price.toLocaleString('en-US')} ₮`}
          </span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.4 }}>
          {title}
        </h3>

        <p style={{
          fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6,
          marginBottom: '20px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {description || 'Энэхүү тест нь таны онцлогийг тодорхойлоход тусална.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#7c9eff' }}>
          Эхлэх <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export default function TestGrid({ tests }: { tests: TestCardProps[] }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '32px',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {tests.map(test => (
        <div key={test.id} style={{ width: '100%', maxWidth: '340px' }}>
          <TestCard {...test} />
        </div>
      ))}
    </div>
  );
}
