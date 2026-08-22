"use client";

// 二创自 Aceternity UI 的 Aurora Background:
// 改为纯装饰背景层,换用本店蓝紫色系,浅色低透明度,底部渐隐融入页面。
import { cn } from "@/lib/utils";

export default function AuroraBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)]",
        className
      )}
    >
      <div
        className={cn(
          "animate-aurora absolute -inset-[10px]",
          "[--aurora:repeating-linear-gradient(100deg,#0d74ce_10%,#c4b5fd_15%,#93c5fd_20%,#e9d5ff_25%,#8b5cf6_30%)]",
          "[--stripes:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)]",
          "[background-image:var(--stripes),var(--aurora)]",
          "[background-size:300%,200%]",
          "[background-position:50%_50%,50%_50%]",
          "opacity-35 blur-[12px] will-change-transform",
          "[mask-image:radial-gradient(ellipse_at_50%_0%,black_15%,transparent_75%)]"
        )}
      />
    </div>
  );
}
