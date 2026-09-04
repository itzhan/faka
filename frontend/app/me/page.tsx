"use client";

import { useEffect, useState } from "react";
import { mePost } from "@/lib/me";

interface Dash {
  profile: {
    username: string;
    balance: string;
    coin: string;
    recharge: string;
    total_coin?: string;
    business_level?: { name: string } | null;
    group?: { name: string } | null;
  };
  buy_month: string;
  buy_total: string;
  buy_count: number;
  merchant: boolean;
  today_income?: string;
  yesterday_income?: string;
  month_income?: string;
  trade?: string;
  today_orders?: number;
  pending_delivery?: number;
  card_unsold?: number;
  commodity_online?: number;
  commodity_count?: number;
  week_series?: { label: string; amount: string; pct: number }[];
  week_series_max?: string;
  recent_sales?: { id: number; trade_no: string; amount: number; create_time: string; commodity?: { name: string; cover: string } | null }[];
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-pixel mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default function MeHomePage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mePost("/user/api/personal/dashboard").then((json) => {
      if (json.code !== 200) setError(json.msg || "加载失败");
      else setData(json.data);
    });
  }, []);

  if (error) return <p className="rounded-3xl bg-surface p-6 text-sm text-danger">{error}</p>;
  if (!data) return <div className="h-64 animate-pulse rounded-3xl bg-surface" />;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          Dashboard
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">我的主页</h1>
        <p className="mt-1 text-sm text-muted">
          {data.profile.username}
          {data.profile.group?.name ? ` · ${data.profile.group.name}` : ""}
          {data.profile.business_level?.name ? ` · ${data.profile.business_level.name}` : ""}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">资产数据</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card label="余额" value={`¥${data.profile.balance}`} />
          <Card label="硬币" value={String(data.profile.coin ?? "0")} />
          <Card label="元气（总充值）" value={String(data.profile.recharge ?? "0")} />
          <Card label="经营收入（硬币）" value={`¥${data.profile.total_coin ?? "0"}`} />
        </div>
      </section>

      {data.merchant && (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold">经营数据</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card label="今日收入" value={`¥${data.today_income}`} />
              <Card label="昨日收入" value={`¥${data.yesterday_income}`} />
              <Card label="本月收入" value={`¥${data.month_income}`} />
              <Card label="总交易" value={`¥${data.trade}`} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card label="今日订单" value={`${data.today_orders ?? 0} 单`} />
              <Card label="待发货" value={`${data.pending_delivery ?? 0} 单`} />
              <Card label="未售卡密" value={`${data.card_unsold ?? 0} 张`} />
              <Card
                label="在售商品"
                value={`${data.commodity_online ?? 0}/${data.commodity_count ?? 0}`}
              />
            </div>
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-3xl bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">近 7 日收入</h2>
                <p className="text-xs text-muted">峰值 ¥{data.week_series_max}</p>
              </div>
              <div className="mt-6 flex h-36 items-end gap-2">
                {(data.week_series ?? []).map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-full bg-ink"
                      style={{ height: `${d.pct}%` }}
                    />
                    <span className="text-[10px] text-faint">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">最近卖出</h2>
                <a href="/me/sales" className="text-xs text-muted">
                  全部订单 →
                </a>
              </div>
              <div className="mt-4 space-y-3">
                {(data.recent_sales ?? []).length === 0 && (
                  <p className="py-10 text-center text-sm text-muted">
                    还没有卖出记录
                  </p>
                )}
                {(data.recent_sales ?? []).map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
                    <p className="min-w-0 truncate">{row.commodity?.name ?? row.trade_no}</p>
                    <p className="font-pixel shrink-0 text-ok">¥{row.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold">消费数据</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card label="本月购物" value={`¥${data.buy_month}`} />
          <Card label="累计购物" value={`¥${data.buy_total}`} />
          <Card label="累计订单" value={`${data.buy_count} 单`} />
        </div>
        <div className="mt-4 flex gap-3">
          <a href="/" className="btn-graphite rounded-full px-5 py-2 text-sm">
            去购物
          </a>
          <a
            href="/me/recharge"
            className="rounded-full border border-hairline bg-surface px-5 py-2 text-sm font-medium"
          >
            去充值
          </a>
        </div>
      </section>
    </div>
  );
}
