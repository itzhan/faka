import type { NextConfig } from "next";

// PHP 后端地址：开发指向本地 docker，部署时改环境变量即可
const API_BASE = process.env.API_BASE ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // JSON API 与图片资源都代理到 PHP 后端，同源转发，天然绕开 CORS 与跨域 cookie
      { source: "/user/api/:path*", destination: `${API_BASE}/user/api/:path*` },
      { source: "/assets/:path*", destination: `${API_BASE}/assets/:path*` },
      { source: "/favicon.ico", destination: `${API_BASE}/favicon.ico` },
    ];
  },
  images: {
    // 商品图经由上面的 rewrite 走同源路径，直接用 <img>/unoptimized 即可
    unoptimized: true,
  },
};

export default nextConfig;
