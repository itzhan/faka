"use client";

import { useEffect, useState } from "react";
import { mePost } from "@/lib/me";

interface Row {
  id: number;
  name: string;
  cover?: string;
  race?: string | null;
  profit?: string | number;
  guest_price?: string;
  my_price?: string;
  rate?: number;
}

interface Promo {
  share_url: string;
  children: number;
  orders: number;
  total: string;
  month: string;
}

export default function PromotePage() {
  const [list, setList] = useState<Row[]>([]);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    mePost("/user/api/personal/dashboard").then((json) => {
      if (json.code === 200) setPromo(json.data.promote ?? null);
    });
    mePost("/user/api/promote/data", { page: 1, limit: 30 }).then((json) => {
      if (json.code === 200) setList(json.data.list ?? []);
    });
  }, []);

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 1200);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">推广中心</h1>
      <p className="text-sm text-muted">好友通过链接购买或注册成为下级后，每笔订单按成交价 − 你的拿货价分成。</p>

      {promo && (
        <>
          <section className="rounded-3xl bg-surface p-5">
            <p className="text-xs text-muted">我的推广链接</p>
            <p className="mt-2 break-all font-pixel text-sm">{promo.share_url}</p>
            <button
              onClick={() => copy(promo.share_url)}
              className="btn-graphite mt-3 rounded-full px-5 py-2 text-sm"
            >
              {copied === promo.share_url ? "已复制" : "复制链接"}
            </button>
          </section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["推广人数", `${promo.children} 人`],
              ["推广订单", `${promo.orders} 单`],
              ["本月收益", `¥${promo.month}`],
              ["累计收益", `¥${promo.total}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-3xl bg-surface p-5">
                <p className="text-xs text-muted">{k}</p>
                <p className="font-pixel mt-2 text-xl">{v}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold">商品预计收益</h2>
      {list.map((row, i) => (
        <div key={`${row.id}-${row.race}-${i}`} className="rounded-2xl bg-surface px-4 py-4">
          <p className="text-sm font-medium">
            {row.name}
            {row.race ? ` · ${row.race}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            游客价 ¥{row.guest_price} · 拿货价 ¥{row.my_price}
          </p>
          <p className="mt-1 text-xs text-ok">
            预计收益 ¥{row.profit}
            {row.rate != null ? ` · ${row.rate}%` : ""}
          </p>
        </div>
      ))}
      {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无可推广商品</p>}
    </div>
  );
}
