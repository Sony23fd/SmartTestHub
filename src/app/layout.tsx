import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Test Hub',
  description: 'Мэргэжлийн сэтгэл зүйн тест болон оношилгооны систем',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Animated Background Layers */}
        <div className="stars" aria-hidden="true" />
        <div className="nebula" aria-hidden="true" />
        <div className="shooting-star-container" aria-hidden="true">
          <div className="shooting-star star-1" />
          <div className="shooting-star star-2" />
          <div className="shooting-star star-3" />
        </div>
        
        {/* Page content sits above background */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
