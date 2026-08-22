"use client";

import { useState } from "react";
import type { Category, Commodity } from "@/lib/api";
import ProductCard from "./ProductCard";

interface Section {
  category: Category;
  items: Commodity[];
}

export default function Storefront({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<number | "all">("all");

  const visible =
    activeId === "all"
      ? sections
      : sections.filter((s) => s.category.id === activeId);

  const pills: { id: number | "all"; name: string; icon?: string }[] = [
    { id: "all", name: "全部商品" },
    ...sections.map((s) => ({
      id: s.category.id,
      name: s.category.name,
      icon: s.category.icon,
    })),
  ];

  return (
    <div id="products">
      {/* 分类 tab:贝贝式独立大胶囊,带品牌图标,与商品区左对齐 */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <nav className="no-scrollbar flex items-center gap-2.5 overflow-x-auto">
          {pills.map((pill) => {
            const active = activeId === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveId(pill.id)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-[#1d1d1f] text-white"
                    : "border border-black/10 bg-white text-[#424245] hover:-translate-y-0.5 hover:border-black/20 hover:text-[#1d1d1f] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
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
                      active ? "fill-white" : "fill-[#48484a]"
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
      </div>

      {/* 商品分区:切换分类时整组淡入上浮 */}
      <main
        key={String(activeId)}
        className="animate-grid-in mx-auto max-w-7xl space-y-20 px-6 pb-24 pt-6"
      >
        {visible.map(({ category, items }) => (
          <section key={category.id}>
            <div className="mb-6">
              <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-[#a1a1a6]">
                Marketplace
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <h2 className="text-[28px] font-semibold tracking-tight">
                  {category.name}
                </h2>
                <span className="text-sm text-[#86868b]">
                  {items.length} 件商品
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
