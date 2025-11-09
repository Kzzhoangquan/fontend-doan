import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình compiler mới
  reactCompiler: true,

  // Thêm cấu hình rewrites để giải quyết vấn đề CORS trong môi trường dev
  async rewrites() {
    return [
      {
        // Khi frontend gọi /api/issue/workflow/1/statuses
        source: '/api/issues/:path*',
        
        // Next.js sẽ proxy yêu cầu đó tới http://localhost:3000/issue/workflow/1/statuses
        destination: 'http://localhost:3000/issues/:path*', 
      },
    ];
  },
};

export default nextConfig;