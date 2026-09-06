import ThemeToggle from "@/components/ThemeToggle";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "自助会员充值",
  description: "输入卡密，识别套餐并完成 ChatGPT / Grok 官方充值",
};

export default function RedeemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hero-wash relative isolate min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-sm font-semibold tracking-tight text-ink">
            {SITE.name}
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              回商城
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
