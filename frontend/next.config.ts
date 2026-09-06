import type { NextConfig } from "next";

// PHP 后端地址：开发指向本地 docker，部署时改环境变量即可
const API_BASE = process.env.API_BASE ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/user/authentication/login", destination: "/login", permanent: false },
      { source: "/user/authentication/register", destination: "/register", permanent: false },
      { source: "/user/index/query", destination: "/query", permanent: false },
      { source: "/user/index/index", destination: "/", permanent: false },
      { source: "/user/personal/purchaserecord", destination: "/me/orders", permanent: false },
      { source: "/user/dashboard", destination: "/me", permanent: false },
      { source: "/user/dashboard/:path*", destination: "/me", permanent: false },
      { source: "/user/recharge/index", destination: "/me/recharge", permanent: false },
      { source: "/cat/:id", destination: "/", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // JSON API 与图片资源都代理到 PHP 后端，同源转发，天然绕开 CORS 与跨域 cookie
      { source: "/user/api/:path*", destination: `${API_BASE}/user/api/:path*` },
      { source: "/user/captcha/:path*", destination: `${API_BASE}/user/captcha/:path*` },
      { source: "/user/authentication/logout", destination: `${API_BASE}/user/authentication/logout` },
      // 下单后收银台在 PHP：/user/pay/order.{tradeNo}.{type}，前台未代理就会落到 Next 404
      { source: "/user/pay/:path*", destination: `${API_BASE}/user/pay/:path*` },
      { source: "/user/recharge/:path*", destination: `${API_BASE}/user/recharge/:path*` },
      { source: "/user/personal/secretdownload", destination: `${API_BASE}/user/personal/secretdownload` },
      { source: "/app/Pay/:path*", destination: `${API_BASE}/app/Pay/:path*` },
      { source: "/admin/:path*", destination: `${API_BASE}/admin/:path*` },
      { source: "/assets/:path*", destination: `${API_BASE}/assets/:path*` },
      { source: "/favicon.ico", destination: `${API_BASE}/favicon.ico` },
      // 其余旧用户 HTML 路径交给 PHP，再由 STOREFRONT_URL 跳回 Next
      { source: "/user/:path*", destination: `${API_BASE}/user/:path*` },
    ];
  },
  images: {
    // 商品图经由上面的 rewrite 走同源路径，直接用 <img>/unoptimized 即可
    unoptimized: true,
  },
};

export default nextConfig;
