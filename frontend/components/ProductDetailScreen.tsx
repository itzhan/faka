"use client";

import { useEffect, useState } from "react";
import type { Commodity } from "@/lib/api";
import {
  getCommodityDetail,
  prefetchCommodityDetail,
  type CommodityDetail,
} from "@/lib/detail";
import OrderPanel from "./OrderPanel";

export default function ProductDetailScreen({ item }: { item: Commodity }) {
  const [detail, setDetail] = useState<CommodityDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const cached = prefetchCommodityDetail(item.id);
    (cached ?? getCommodityDetail(item.id)).then((data) => {
      if (cancelled) return;
      if (!data) {
        setError("商品详情加载失败");
        return;
      }
      setDetail(data);
    });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-10 text-sm text-muted">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
        <div className="flex min-h-[280px] items-center justify-center bg-page p-8 lg:min-h-[520px]">
          <div className="h-40 w-40 animate-pulse rounded-2xl bg-fill" />
        </div>
        <div className="space-y-4 border-t border-hairline-soft p-8 lg:border-l lg:border-t-0 lg:p-10">
          <div className="h-7 w-2/3 animate-pulse rounded-lg bg-fill" />
          <div className="h-4 w-1/3 animate-pulse rounded-lg bg-fill" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-fill" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-fill" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-fill" />
        </div>
      </div>
    );
  }

  const media = detail.detail_image || detail.cover || item.cover || "/favicon.ico";

  return (
    <div className="flex min-h-full flex-col">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <a
          href={media}
          target="_blank"
          rel="noreferrer"
          title="查看原图"
          className="group relative flex items-center justify-center bg-page p-5 sm:p-8"
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl">
            <img
              src={media}
              alt={detail.name}
              className="block h-auto w-full"
            />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-subtle shadow-sm backdrop-blur sm:bottom-4 sm:right-4 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
              查看原图
            </span>
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur sm:left-4 sm:top-4">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#0d74ce]" aria-hidden>
                <path d="M8 0l6 2.4v4.3c0 3.8-2.6 7.3-6 8.3-3.4-1-6-4.5-6-8.3V2.4L8 0zm-.9 10.6l4.2-4.2-1-1-3.2 3.2-1.4-1.4-1 1 2.4 2.4z" />
              </svg>
              官方正版 · 安全稳定
            </span>
          </div>
        </a>

        <div className="border-t border-hairline-soft p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <OrderPanel detail={detail} />
        </div>
      </div>

      <section className="border-t border-hairline-soft p-5 sm:p-8 lg:p-10">
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          Description
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">宝贝详情</h2>
        <div
          className="detail-html mt-6"
          dangerouslySetInnerHTML={{ __html: detail.description || "" }}
        />
      </section>
    </div>
  );
}
