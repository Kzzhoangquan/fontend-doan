import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình compiler mới
  reactCompiler: true,

  // Thêm cấu hình rewrites để giải quyết vấn đề CORS trong môi trường dev
  async rewrites() {
    return [
      {
        // Issues API
        source: '/api/issues/:path*',
        destination: 'http://localhost:3000/issues/:path*', 
      },
      {
        // Epics API
        source: '/api/epics/:path*',
        destination: 'http://localhost:3000/epics/:path*', 
      },
      {
        // Projects API (nếu cần)
        source: '/api/projects/:path*',
        destination: 'http://localhost:3000/projects/:path*', 
      },
      {
        // Catch-all cho các API khác
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', 
      },
    ];
  },
};

export default nextConfig;