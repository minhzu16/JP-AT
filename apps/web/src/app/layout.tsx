import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

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
        <div className="ambient-glow" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
