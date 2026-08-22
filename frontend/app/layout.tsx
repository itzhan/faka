import type { Metadata } from "next";
import { Doto } from "next/font/google";
import "./globals.css";

// 点阵像素字体:仅用于标题中的拉丁字符(如 "AI")
const doto = Doto({ subsets: ["latin"], weight: "900", variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "异次元店铺",
  description: "AI 订阅商品自助商店",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${doto.variable} min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
