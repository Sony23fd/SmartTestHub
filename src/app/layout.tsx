import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Test Hub | Хүүхэд, эцэг эхчүүдэд зориулсан сорил ба зөвлөгөө',
  description: 'Шинжлэх ухааны үндэслэлтэй сэтгэл зүйн тестүүд болон эцэг эхчүүдэд зориулсан видео сургалт, зөвлөгөө.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Playful Ambient Floating Pastel Bubbles & Glows */}
        <div className="ambient-background" aria-hidden="true">
          <div className="pastel-orb orb-1" />
          <div className="pastel-orb orb-2" />
          <div className="pastel-orb orb-3" />
          <div className="pastel-orb orb-4" />
        </div>
        
        {/* Page content sits above background */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
