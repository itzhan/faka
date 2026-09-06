import type { Metadata, Viewport } from "next";
import { Doto } from "next/font/google";
import FromCookie from "@/components/FromCookie";
import { THEME_BOOT_SCRIPT, ThemeProvider } from "@/lib/theme";
import "./globals.css";

// 点阵像素字体:仅用于标题中的拉丁字符(如 "AI")
const doto = Doto({ subsets: ["latin"], weight: "900", variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "TabCode小铺",
  description: "AI 订阅商品自助商店",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${doto.variable} min-h-screen overflow-x-hidden bg-page font-sans text-ink antialiased`}
      >
        <ThemeProvider>
          <FromCookie />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
