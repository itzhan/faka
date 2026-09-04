"use client";

import { useEffect, useMemo, useState } from "react";
import TutorialRich from "@/components/TutorialRich";
import type { TutorialBlock, TutorialMeta } from "@/lib/tutorials";
import { cn } from "@/lib/utils";

const CAT_TONE: Record<string, string> = {
  购买教程: "bg-accent-fill text-accent",
  支付与订单: "bg-ok-fill text-ok",
  售后指南: "bg-danger-fill text-danger",
  产品对比: "bg-purple-fill text-purple",
  使用指南: "bg-warn-fill text-warn",
  模型动态: "bg-ink/10 text-ink",
  账号安全: "bg-accent-fill text-accent",
  网络环境: "bg-ok-fill text-ok",
};

export default function TutorialReader({
  meta,
  blocks,
  related,
}: {
  meta: TutorialMeta;
  blocks: TutorialBlock[];
  related: TutorialMeta[];
}) {
  const toc = useMemo(
    () => blocks.filter((b): b is Extract<TutorialBlock, { type: "h2" }> => b.type === "h2"),
    [blocks]
  );
  const [active, setActive] = useState(toc[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const el = document.getElementById("tutorial-article");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const readable = Math.max(1, el.offsetHeight - window.innerHeight * 0.4);
      const passed = 120 - rect.top;
      setProgress(Math.min(1, Math.max(0, passed / readable)));
      let current = toc[0]?.id ?? "";
      for (const item of toc) {
        const node = document.getElementById(item.id);
        if (node && node.getBoundingClientRect().top < 140) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-[2px] bg-fill">
        <div className="h-full bg-ink transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <article className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <a href="/tutorials" className="text-sm text-muted">
          ← 全部教程
        </a>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <header className="rounded-[28px] bg-surface p-6 sm:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", CAT_TONE[meta.category])}>
                  {meta.category}
                </span>
                <span className="text-xs text-faint">{meta.minutes} 分钟阅读</span>
              </div>
              <h1 className="mt-4 text-[28px] font-semibold tracking-tight sm:text-[34px]">{meta.title}</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{meta.excerpt}</p>
              {toc.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {toc.slice(0, 5).map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="rounded-full bg-page px-3 py-1 text-[12px] text-subtle"
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              )}
            </header>

            <div id="tutorial-article" className="mt-4 space-y-5 rounded-[28px] bg-surface px-5 py-6 sm:px-9 sm:py-9">
              {blocks.map((block, i) => {
                if (block.type === "h2") {
                  const step = /^(第.+[步组]|方式[一二三四]|一、|二、|三、)/.test(block.text);
                  return (
                    <h2
                      key={i}
                      id={block.id}
                      className={cn(
                        "scroll-mt-28 text-[20px] font-semibold tracking-tight",
                        step && "flex items-start gap-3"
                      )}
                    >
                      {step && (
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-on-ink">
                          {String(toc.findIndex((t) => t.id === block.id) + 1).padStart(2, "0")}
                        </span>
                      )}
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "h3") {
                  return (
                    <h3 key={i} id={block.id} className="scroll-mt-28 text-[16px] font-semibold">
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === "p") {
                  return (
                    <p key={i} className="text-[15px] leading-[1.85] text-subtle">
                      <TutorialRich text={block.text} />
                    </p>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={i}
                      className="rounded-2xl bg-page px-4 py-3 text-[14px] leading-relaxed text-subtle"
                    >
                      <TutorialRich text={block.text} />
                    </blockquote>
                  );
                }
                if (block.type === "ul" || block.type === "ol") {
                  const Tag = block.type;
                  return (
                    <Tag
                      key={i}
                      className={cn(
                        "space-y-2 text-[15px] leading-relaxed text-subtle",
                        block.type === "ul" ? "list-disc pl-5" : "list-decimal pl-5"
                      )}
                    >
                      {block.items.map((item, j) => (
                        <li key={j}>
                          <TutorialRich text={item} />
                        </li>
                      ))}
                    </Tag>
                  );
                }
                if (block.type === "table") {
                  return (
                    <div key={i} className="overflow-x-auto rounded-2xl border border-hairline-soft">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-page text-muted">
                          <tr>
                            {block.headers.map((h) => (
                              <th key={h} className="px-4 py-2.5 font-medium">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, ri) => (
                            <tr key={ri} className="border-t border-hairline-soft">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-4 py-2.5 text-subtle">
                                  <TutorialRich text={cell} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return <hr key={i} className="border-hairline-soft" />;
              })}

              <div className="mt-8 rounded-2xl bg-page px-4 py-4 text-[13px] leading-relaxed text-muted">
                第三方平台规则和套餐可能调整。购买时请以本站商品详情页的实时价格、库存、交付方式和售后规则为准。
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href="/#products" className="btn-graphite rounded-full px-4 py-1.5 text-xs">
                    查看商品
                  </a>
                  <a href="/query" className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-xs font-medium">
                    查询订单
                  </a>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold">继续阅读</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {related.map((t) => (
                    <a key={t.slug} href={`/tutorials/${t.slug}`} className="rounded-3xl bg-surface p-5">
                      <p className="text-[11px] text-muted">{t.category}</p>
                      <p className="mt-2 text-sm font-semibold tracking-tight">{t.title}</p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{t.excerpt}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="relative hidden lg:block">
            <div
              className="fixed top-28 z-20 w-[240px] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              style={{ right: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-faint">本篇目录</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-fill">
                <div
                  className="h-full rounded-full bg-ink transition-[width] duration-150"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-faint">已读 {Math.round(progress * 100)}%</p>
              <nav className="mt-3 space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      "block rounded-xl px-2 py-1.5 text-[13px] leading-snug",
                      active === item.id ? "bg-ink text-on-ink" : "text-subtle hover:bg-fill"
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
