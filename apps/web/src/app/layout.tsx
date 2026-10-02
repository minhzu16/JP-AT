import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'Job Portal & ATS — Nền tảng Tuyển dụng & Theo dõi Ứng viên',
  description:
    'Hệ thống Cổng thông tin Tuyển dụng & Application Tracker với PostgreSQL, NestJS, Next.js, RBAC và AI Skill Matching không thiên lệch.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
