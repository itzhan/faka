"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Commodity } from "@/lib/api";
import ProductCard from "./ProductCard";

interface Section {
  category: Category;
  items: Commodity[];
}

type ViewMode = "poster" | "list";

const VIEW_KEY = "faka-storefront-view-v2";

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-hairline bg-surface p-1">
      <button
        type="button"
        aria-label="海报卡片"
        aria-pressed={view === "poster"}
        onClick={() => onChange("poster")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          view === "poster" ? "bg-ink text-on-ink" : "text-muted hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="列表"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          view === "list" ? "bg-ink text-on-ink" : "text-muted hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M1 2h14v2H1V2zm0 5h14v2H1V7zm0 5h14v2H1v-2z" />
        </svg>
      </button>
    </div>
  );
}

export default function Storefront({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<number | "all">("all");
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_KEY);
    if (saved === "list" || saved === "poster") setView(saved);
  }, []);

  const changeView = (next: ViewMode) => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

  const pills: { id: number | "all"; name: string; icon?: string }[] = [
    { id: "all", name: "全部商品" },
    ...sections.map((s) => ({
      id: s.category.id,
      name: s.category.name,
      icon: s.category.icon,
    })),
  ];

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const base =
      activeId === "all"
        ? sections
        : sections.filter((s) => s.category.id === activeId);
    if (!keyword) return base;
    return base
      .map((s) => ({
        ...s,
        items: s.items.filter((item) =>
          item.name.toLowerCase().includes(keyword)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [activeId, query, sections]);

  const visible =
    view === "list"
      ? filtered
      : activeId === "all"
        ? sections
        : sections.filter((s) => s.category.id === activeId);

  return (
    <div id="products">
      {view === "poster" ? (
        <>
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-8 sm:px-6">
            <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto">
              {pills.map((pill) => {
                const active = activeId === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setActiveId(pill.id)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "bg-ink text-on-ink"
                        : "border border-hairline bg-surface text-subtle hover:-translate-y-0.5 hover:border-hairline-strong hover:text-ink hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    {pill.icon ? (
                      <img
                        src={pill.icon}
                        alt=""
                        className={`h-[18px] w-[18px] rounded-full ${
                          active ? "brightness-0 invert" : ""
                        }`}
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-[18px] w-[18px] ${
                          active ? "fill-on-ink" : "fill-subtle"
                        }`}
                        aria-hidden
                      >
                        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                      </svg>
                    )}
                    {pill.name}
                  </button>
                );
              })}
            </nav>
            <ViewToggle view={view} onChange={changeView} />
          </div>

          <main
            key={`poster-${String(activeId)}`}
            className="animate-grid-in mx-auto max-w-7xl space-y-14 px-4 pb-24 pt-6 sm:space-y-20 sm:px-6"
          >
            {visible.map(({ category, items }) => (
              <section key={category.id}>
                <div className="mb-6">
                  <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
                    Marketplace
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <h2 className="text-[24px] font-semibold tracking-tight sm:text-[28px]">
                      {category.name}
                    </h2>
                    <span className="text-sm text-muted">
                      {items.length} 件商品
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </main>
        </>
      ) : (
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
          <div className="mb-5 flex items-center justify-end">
            <ViewToggle view={view} onChange={changeView} />
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-3xl bg-surface p-4 lg:sticky lg:top-24">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="h-4 w-1 rounded-full bg-accent" />
                <p className="text-sm font-semibold">分类</p>
              </div>
              <div className="space-y-1">
                {pills.map((pill) => {
                  const active = activeId === pill.id;
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setActiveId(pill.id)}
                      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-ink text-on-ink"
                          : "text-subtle hover:bg-fill hover:text-ink"
                      }`}
                    >
                      {pill.icon ? (
                        <img
                          src={pill.icon}
                          alt=""
                          className={`h-4 w-4 rounded-full ${
                            active ? "brightness-0 invert" : ""
                          }`}
                        />
                      ) : null}
                      {pill.name}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div>
              <label className="relative mb-5 block">
                <svg
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-faint"
                  aria-hidden
                >
                  <path d="M6.5 1a5.5 5.5 0 014.38 8.82l3.15 3.15-1.06 1.06-3.15-3.15A5.5 5.5 0 116.5 1zm0 1.5a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索商品名称或关键词..."
                  className="h-12 w-full rounded-full border border-hairline bg-surface pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-faint focus:border-hairline-strong"
                />
              </label>

              <div
                key={`list-${String(activeId)}-${query}`}
                className="animate-grid-in space-y-8"
              >
                {visible.length === 0 ? (
                  <p className="rounded-3xl bg-surface px-6 py-16 text-center text-sm text-muted">
                    没有找到相关商品
                  </p>
                ) : (
                  visible.map(({ category, items }) => (
                    <section key={category.id}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-4 w-1 rounded-full bg-accent" />
                        {category.icon ? (
                          <img
                            src={category.icon}
                            alt=""
                            className="h-4 w-4 rounded-full"
                          />
                        ) : null}
                        <h2 className="text-sm font-semibold">
                          {category.name}
                          <span className="ml-1 font-normal text-muted">
                            ({items.length})
                          </span>
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            variant="list"
                          />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
