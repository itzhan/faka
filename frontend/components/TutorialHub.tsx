"use client";

import { useMemo, useState } from "react";
import { TUTORIAL_CATEGORIES, TUTORIALS, type TutorialCategory } from "@/lib/tutorials";
import { cn } from "@/lib/utils";

const CAT_TONE: Record<TutorialCategory, string> = {
  购买教程: "bg-accent-fill text-accent",
  支付与订单: "bg-ok-fill text-ok",
  售后指南: "bg-danger-fill text-danger",
  产品对比: "bg-purple-fill text-purple",
  使用指南: "bg-warn-fill text-warn",
  模型动态: "bg-ink/10 text-ink",
  账号安全: "bg-accent-fill text-accent",
  网络环境: "bg-ok-fill text-ok",
};

export default function TutorialHub() {
  const [cat, setCat] = useState<TutorialCategory | "全部">("全部");
  const [q, setQ] = useState("");

  const featured = TUTORIALS.filter((t) => t.featured);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TUTORIALS.filter((t) => {
      if (cat !== "全部" && t.category !== cat) return false;
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.excerpt.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [cat, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <section className="rounded-[28px] bg-surface p-6 sm:p-10">
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          Guides
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-[40px]">
          从下单到查收，每一步都有答案
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          购买、支付、查单、账号安全和模型使用，按真实流程写成可执行步骤。价格与库存以商品页为准。
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full bg-page px-3 py-1.5">{TUTORIALS.length} 篇教程</span>
          <span className="rounded-full bg-page px-3 py-1.5">{TUTORIAL_CATEGORIES.length} 个主题</span>
          <span className="rounded-full bg-page px-3 py-1.5">约 5–10 分钟 / 篇</span>
        </div>
      </section>

      {cat === "全部" && !q && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">先从这些开始</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {featured.map((t, i) => (
              <a
                key={t.slug}
                href={`/tutorials/${t.slug}`}
                className="group rounded-3xl bg-surface p-5 transition-transform hover:-translate-y-0.5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", CAT_TONE[t.category])}>
                    {t.category}
                  </span>
                  <span className="font-pixel text-[11px] text-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight group-hover:text-accent">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.excerpt}</p>
                <p className="mt-3 text-xs text-faint">{t.minutes} 分钟阅读</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索教程、标签或关键词"
          className="h-11 w-full rounded-full border border-hairline bg-surface px-5 text-[16px] outline-none placeholder:text-faint focus:border-hairline-strong focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)] lg:max-w-sm sm:text-[14px]"
        />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["全部", ...TUTORIAL_CATEGORIES] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCat(item)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium",
                cat === item ? "bg-ink text-on-ink" : "border border-hairline bg-surface text-subtle"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-faint">{list.length} 篇</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => (
          <a
            key={t.slug}
            href={`/tutorials/${t.slug}`}
            className="flex flex-col rounded-3xl bg-surface p-5 transition-colors hover:bg-surface/80"
          >
            <span className={cn("w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium", CAT_TONE[t.category])}>
              {t.category}
            </span>
            <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{t.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-page px-2 py-0.5 text-[11px] text-muted">
                  {tag}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-faint">{t.minutes} 分钟</span>
            </div>
          </a>
        ))}
      </div>
      {list.length === 0 && (
        <p className="rounded-3xl bg-surface py-16 text-center text-sm text-muted">没有匹配的教程，换个关键词试试。</p>
      )}
    </div>
  );
}
