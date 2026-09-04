"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const CYCLE: ThemePref[] = ["light", "dark", "system"];

const META: Record<ThemePref, { label: string; next: string; icon: typeof Sun }> = {
  light: { label: "浅色", next: "深色", icon: Sun },
  dark: { label: "深色", next: "跟随系统", icon: Moon },
  system: { label: "跟随系统", next: "浅色", icon: Monitor },
};

export default function ThemeToggle({ className }: { className?: string }) {
  const { pref, setPref } = useTheme();
  const current = META[pref];
  const Icon = current.icon;

  function cycle(e: MouseEvent<HTMLButtonElement>) {
    const i = CYCLE.indexOf(pref);
    const rect = e.currentTarget.getBoundingClientRect();
    setPref(CYCLE[(i + 1) % CYCLE.length], {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`当前${current.label}，点击切换为${current.next}`}
      aria-label={`外观：${current.label}，点击切换为${current.next}`}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:bg-fill",
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
