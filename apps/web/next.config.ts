import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jobportal/shared'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:3001/health',
      },
    ];
  },
};

export default nextConfig;
