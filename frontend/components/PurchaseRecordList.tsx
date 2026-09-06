"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fieldCls } from "@/lib/me";

interface OrderRow {
  id: number;
  trade_no: string;
  amount: number;
  create_time: string;
  pay_time: string | null;
  status: number;
  delivery_status: number;
  secret: string | null;
  card_num: number;
  leave_message?: string | null;
  race?: string | null;
  sku?: Record<string, string> | unknown[] | null;
  commodity?: { name: string; cover: string };
  pay?: { name: string; icon: string };
}

const LIMIT = 10;
type Filter = "all" | "paid" | "pending";

function formatPrice(value: number | string): string {
  const n = Number(value);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function skuText(order: OrderRow): string {
  const parts: string[] = [];
  if (order.race && order.race !== "-") parts.push(order.race);
  if (order.sku && !Array.isArray(order.sku)) {
    for (const [key, val] of Object.entries(order.sku)) {
      parts.push(`${key}: ${val}`);
    }
  }
  return parts.length ? parts.join(" / ") : "-";
}

export default function PurchaseRecordList() {
  const searchParams = useSearchParams();
  const tradeNoParam = searchParams.get("tradeNo") ?? "";

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tradeNo, setTradeNo] = useState(tradeNoParam);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setTradeNo(tradeNoParam);
  }, [tradeNoParam]);

  const load = useCallback(
    async (p: number, query = { tradeNo, fromDate, toDate, filter }) => {
      setLoading(true);
      setError("");
      try {
        const body = new URLSearchParams({
          page: String(p),
          limit: String(LIMIT),
        });
        if (query.tradeNo.trim()) body.set("equal-trade_no", query.tradeNo.trim());
        if (query.fromDate) body.set("betweenStart-create_time", `${query.fromDate} 00:00:00`);
        if (query.toDate) body.set("betweenEnd-create_time", `${query.toDate} 23:59:59`);
        if (query.filter === "paid") body.set("equal-status", "1");
        if (query.filter === "pending") body.set("equal-status", "0");

        const res = await fetch("/user/api/purchaseRecord/data", {
          method: "POST",
          body,
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (json.code !== 200) {
          setError(json.msg || "加载失败");
          setOrders([]);
          return;
        }
        setOrders(json.data.list ?? []);
        setTotal(json.data.total ?? 0);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [tradeNo, fromDate, toDate, filter]
  );

  useEffect(() => {
    void load(1, { tradeNo: tradeNoParam || tradeNo, fromDate, toDate, filter });
    // 仅深链变化时自动拉第一页
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeNoParam]);

  useEffect(() => {
    if (!tradeNoParam || orders.length === 0) return;
    const hit = orders.find((o) => o.trade_no === tradeNoParam);
    if (hit) setExpanded(hit.id);
  }, [orders, tradeNoParam]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    void load(1);
  }

  function changeFilter(next: Filter) {
    setFilter(next);
    void load(1, { tradeNo, fromDate, toDate, filter: next });
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  function downloadSecret(order: OrderRow) {
    if (!order.secret) return;
    const blob = new Blob([order.secret], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `卡密_${order.trade_no}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pageCount = Math.max(1, Math.ceil(total / LIMIT));
  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);
  const highlight = orders.find((o) => o.trade_no === tradeNoParam);

  return (
    <div className="space-y-5">
      {highlight && highlight.status === 1 && (
        <div className="rounded-3xl bg-ok-fill px-5 py-4">
          <p className="text-[15px] font-medium text-ok">购买成功</p>
          <p className="mt-1 font-pixel text-[13px]">{highlight.trade_no}</p>
          <p className="mt-1 text-sm text-muted">
            {highlight.delivery_status === 1
              ? "已发货，向下展开即可查看卡密。"
              : "已支付，发货后卡密会出现在本页。"}
          </p>
        </div>
      )}

      {error && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{error}</p>}

      <form onSubmit={search} className="rounded-3xl bg-surface p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
          <input
            value={tradeNo}
            onChange={(e) => setTradeNo(e.target.value)}
            placeholder="订单号"
            className={fieldCls}
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={`${fieldCls} text-subtle`}
            aria-label="从下单时间"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={`${fieldCls} text-subtle`}
            aria-label="到下单时间"
          />
          <button type="submit" className="btn-graphite h-11 rounded-full px-6 text-sm font-medium">
            查询
          </button>
        </div>
        <nav className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto">
          {(
            [
              { id: "all", label: "全部" },
              { id: "paid", label: "已支付" },
              { id: "pending", label: "未支付" },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeFilter(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-ink text-on-ink"
                    : "border border-hairline bg-surface text-subtle hover:border-hairline-strong"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </form>

      <div className="space-y-4">
        {!loading && orders.length === 0 && !error && (
          <div className="rounded-3xl bg-surface px-6 py-14 text-center">
            <p className="text-[15px] font-medium">没有找到订单</p>
            <p className="mt-2 text-sm text-muted">换个订单号或时间再查，或去商城下一单。</p>
            <a href="/" className="btn-graphite mt-6 inline-block rounded-full px-6 py-2 text-sm">
              去逛逛
            </a>
          </div>
        )}

        {orders.map((order) => {
          const paid = order.status === 1;
          const shipped = order.delivery_status === 1;
          const isOpen = expanded === order.id;
          const isHit = tradeNoParam !== "" && order.trade_no === tradeNoParam;
          return (
            <article
              key={order.id}
              id={`order-${order.trade_no}`}
              className={`overflow-hidden rounded-3xl bg-surface ${isHit ? "ring-2 ring-ok/40" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline-soft px-4 py-3.5 sm:px-6">
                <button
                  type="button"
                  onClick={() => copyText(order.trade_no, `no-${order.id}`)}
                  className="font-pixel max-w-full truncate text-left text-[12px]"
                  title="点击复制订单号"
                >
                  {order.trade_no}
                  {copied === `no-${order.id}` ? " 已复制" : ""}
                </button>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      paid ? "bg-ok-fill text-ok" : "bg-warn-fill text-warn"
                    }`}
                  >
                    {paid ? "已支付" : "未支付"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      shipped ? "bg-ok-fill text-ok" : "bg-danger-fill text-danger"
                    }`}
                  >
                    {shipped ? "已发货" : "未发货"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 px-4 py-4 sm:items-center sm:gap-4 sm:px-6 sm:py-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-fill sm:h-16 sm:w-16">
                  {order.commodity?.cover ? (
                    <img
                      src={order.commodity.cover}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-xs text-faint">商品</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-medium">
                    {order.commodity?.name ?? "商品"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    类别/SKU {skuText(order)} · 数量 {order.card_num}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {order.pay?.icon && (
                      <img src={order.pay.icon} alt="" className="h-4 w-4 rounded" />
                    )}
                    <span>{order.pay?.name ?? "支付方式"}</span>
                    <span>· {order.create_time}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
                    <p className="text-gradient-price font-pixel text-lg font-semibold">
                      ¥{formatPrice(order.amount)}
                    </p>
                    {order.secret && paid && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink"
                      >
                        {isOpen ? "收起卡密" : "查看卡密"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                  <p className="text-gradient-price font-pixel text-xl font-semibold">
                    ¥{formatPrice(order.amount)}
                  </p>
                  {order.secret && paid && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-fill"
                    >
                      {isOpen ? "收起卡密" : "查看卡密"}
                    </button>
                  )}
                </div>
              </div>

              {order.secret && isOpen && (
                <div className="mx-4 mb-5 rounded-2xl bg-page p-4 sm:mx-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted">卡密内容</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyText(order.secret!, `sec-${order.id}`)}
                        className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink hover:bg-fill"
                      >
                        {copied === `sec-${order.id}` ? "已复制 ✓" : "复制"}
                      </button>
                      <button
                        onClick={() => downloadSecret(order)}
                        className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink hover:bg-fill"
                      >
                        下载
                      </button>
                    </div>
                  </div>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-ink">
                    {order.secret}
                  </pre>
                  <a
                    href={`/redeem?code=${encodeURIComponent(order.secret.trim().split(/\s+/)[0])}`}
                    className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
                  >
                    打开充值页
                  </a>
                  {order.leave_message && (
                    <div
                      className="detail-html mt-3 border-t border-hairline-soft pt-3 text-xs leading-relaxed text-muted"
                      dangerouslySetInnerHTML={{ __html: order.leave_message }}
                    />
                  )}
                </div>
              )}
            </article>
          );
        })}

        {loading && <div className="h-32 animate-pulse rounded-3xl bg-surface" />}

        {!loading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted">
            <p>
              第 {from}–{to} 条 · 共 {total} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
                className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-ink disabled:opacity-40"
              >
                上一页
              </button>
              <span>
                {page}/{pageCount}
              </span>
              <button
                disabled={page >= pageCount}
                onClick={() => void load(page + 1)}
                className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-ink disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
