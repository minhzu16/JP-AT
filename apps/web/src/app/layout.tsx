import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { SkipToContent } from '../components/SkipToContent';

export const metadata: Metadata = {
  title: 'CareerVanguard — Modern ATS & AI-Powered Job Portal',
  description:
    'Hệ thống Cổng thông tin Tuyển dụng & Application Tracker chuẩn Enterprise với PostgreSQL, NestJS, Next.js 15, RBAC và AI Skill Matching không thiên lệch.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans relative overflow-x-hidden antialiased">
        <SkipToContent />
        <div className="ambient-glow" />
        <AuthProvider>
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
