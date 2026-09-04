"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";

interface QueryOrder {
  trade_no: string;
  amount: number;
  create_time: string;
  pay_time: string | null;
  status: number; // 1=已支付
  delivery_status: number; // 1=已发货
  secret: string | null;
  card_num: number;
  commodity?: { name: string; cover: string; leave_message?: string };
  pay?: { name: string; icon: string };
}

function formatPrice(value: number): string {
  const n = Number(value);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function QueryInner() {
  const searchParams = useSearchParams();
  const tradeNoParam = searchParams.get("tradeNo") ?? "";
  const [keywords, setKeywords] = useState(tradeNoParam);
  const [orders, setOrders] = useState<QueryOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (tradeNoParam) {
      setKeywords(tradeNoParam);
      void runSearch(tradeNoParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeNoParam]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const kw = keywords.trim();
    if (!kw) return;
    await runSearch(kw);
  }

  async function runSearch(kw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/user/api/index/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: kw, page: 1, limit: 10 }),
      });
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.msg || "查询失败");
      setOrders(json.data?.list ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败,请稍后再试");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }

  async function copySecret(text: string, tradeNo: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tradeNo);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate min-h-[70vh]">
        <AuroraBackdrop className="h-[420px]" />

        <main className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
          <div className="text-center">
            <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
              Order Lookup
            </p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-4xl">
              订单查询
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              输入订单号或下单时留的联系方式,查看购买记录与卡密。
            </p>
          </div>

          <form
            onSubmit={search}
            className="mt-8 flex flex-col gap-2.5 sm:flex-row"
          >
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="订单号 / 联系方式"
              className="h-12 flex-1 rounded-full border border-hairline bg-surface px-5 text-[16px] outline-none transition-shadow placeholder:text-faint focus:border-hairline-strong focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)] sm:text-[15px]"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-graphite h-12 w-full shrink-0 rounded-full px-7 text-[15px] font-medium disabled:opacity-60 sm:w-auto"
            >
              {loading ? "查询中…" : "查询订单"}
            </button>
          </form>

          {error && (
            <p className="mt-6 rounded-2xl bg-danger-fill px-5 py-4 text-center text-sm text-danger">
              {error}
            </p>
          )}

          {orders !== null && !error && (
            <div className="mt-8 space-y-4">
              {orders.length === 0 && (
                <div className="rounded-3xl bg-surface px-6 py-14 text-center">
                  <p className="text-[15px] font-medium">未找到相关订单</p>
                  <p className="mt-2 text-sm text-muted">
                    请确认订单号或联系方式无误;仅展示最近的购买记录。
                  </p>
                </div>
              )}

              {orders.map((order) => {
                const paid = order.status === 1;
                return (
                  <article
                    key={order.trade_no}
                    className="overflow-hidden rounded-3xl bg-surface"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-hairline-soft px-4 py-3.5 sm:px-6 sm:py-4">
                      <span className="font-pixel truncate text-[12px] text-subtle sm:text-[13px]">
                        {order.trade_no}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          paid
                            ? order.delivery_status === 1
                              ? "bg-ok-fill text-ok"
                              : "bg-accent-fill text-accent"
                            : "bg-[#cc4e00]/10 text-[#cc4e00]"
                        }`}
                      >
                        {paid
                          ? order.delivery_status === 1
                            ? "已发货"
                            : "已支付 · 处理中"
                          : "未支付"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 px-4 py-4 sm:items-center sm:gap-4 sm:px-6 sm:py-5">
                      {order.commodity?.cover && (
                        <img
                          src={order.commodity.cover}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl bg-fill object-contain"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[15px] font-medium">
                          {order.commodity?.name ?? "商品"}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {order.create_time}
                          {order.card_num > 0 && ` · ${order.card_num} 张`}
                        </p>
                        <p className="text-gradient-price font-pixel mt-2 text-lg font-semibold sm:hidden">
                          ¥{formatPrice(order.amount)}
                        </p>
                      </div>
                      <p className="text-gradient-price font-pixel hidden shrink-0 text-xl font-semibold sm:block">
                        ¥{formatPrice(order.amount)}
                      </p>
                    </div>

                    {order.secret && (
                      <div className="mx-4 mb-4 rounded-2xl bg-page p-4 sm:mx-6 sm:mb-6">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted">
                            卡密内容
                          </p>
                          <button
                            onClick={() =>
                              copySecret(order.secret!, order.trade_no)
                            }
                            className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-fill"
                          >
                            {copied === order.trade_no ? "已复制 ✓" : "复制"}
                          </button>
                        </div>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-ink">
                          {order.secret}
                        </pre>
                        {order.commodity?.leave_message && (
                          <p className="mt-3 border-t border-hairline-soft pt-3 text-xs leading-relaxed text-muted">
                            {order.commodity.leave_message}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function QueryPage() {
  return (
    <Suspense
      fallback={
        <>
          <PillHeader />
          <div className="hero-wash min-h-[70vh] px-6 pt-32">
            <div className="mx-auto h-40 max-w-3xl animate-pulse rounded-3xl bg-surface" />
          </div>
        </>
      }
    >
      <QueryInner />
    </Suspense>
  );
}
