"use client";

// 登录/注册共用外壳:极光背景 + 居中卡片 + 像素眉标
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import PillHeader from "@/components/PillHeader";
import { SITE } from "@/lib/site";

export const authFieldCls =
  "h-12 w-full rounded-xl border border-hairline bg-surface px-4 text-[16px] outline-none transition-shadow placeholder:text-faint focus:border-hairline-strong focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)] sm:text-[14px]";

export const authLabelCls = "mb-1.5 block text-[13px] font-medium text-subtle";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate flex min-h-screen flex-col">
        <AuroraBackdrop className="h-[480px]" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-24 sm:px-6 sm:py-28">
          <div className="text-center">
            <a href="/" className="text-sm font-semibold tracking-tight">
              {SITE.name}
            </a>
            <p className="font-pixel mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          <div className="mt-8 rounded-3xl bg-surface p-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)] sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
