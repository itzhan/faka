"use client";

import { useState } from "react";
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

export default function QueryPage() {
  const [keywords, setKeywords] = useState("");
  const [orders, setOrders] = useState<QueryOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const kw = keywords.trim();
    if (!kw) return;
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

        <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
          <div className="text-center">
            <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-[#a1a1a6]">
              Order Lookup
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              订单查询
            </h1>
            <p className="mt-3 text-[15px] text-[#86868b]">
              输入订单号或下单时留的联系方式,查看购买记录与卡密。
            </p>
          </div>

          <form onSubmit={search} className="mt-8 flex gap-2.5">
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="订单号 / 联系方式"
              className="h-12 flex-1 rounded-full border border-black/10 bg-white px-5 text-[15px] outline-none transition-shadow placeholder:text-[#a1a1a6] focus:border-black/20 focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-graphite h-12 rounded-full px-7 text-[15px] font-medium disabled:opacity-60"
            >
              {loading ? "查询中…" : "查询订单"}
            </button>
          </form>

          {error && (
            <p className="mt-6 rounded-2xl bg-[#ce2c31]/8 px-5 py-4 text-center text-sm text-[#ce2c31]">
              {error}
            </p>
          )}

          {orders !== null && !error && (
            <div className="mt-8 space-y-4">
              {orders.length === 0 && (
                <div className="rounded-3xl bg-white px-6 py-14 text-center">
                  <p className="text-[15px] font-medium">未找到相关订单</p>
                  <p className="mt-2 text-sm text-[#86868b]">
                    请确认订单号或联系方式无误;仅展示最近的购买记录。
                  </p>
                </div>
              )}

              {orders.map((order) => {
                const paid = order.status === 1;
                return (
                  <article
                    key={order.trade_no}
                    className="overflow-hidden rounded-3xl bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
                      <span className="font-pixel text-[13px] text-[#424245]">
                        {order.trade_no}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          paid
                            ? order.delivery_status === 1
                              ? "bg-[#18794e]/10 text-[#18794e]"
                              : "bg-[#0d74ce]/10 text-[#0d74ce]"
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

                    <div className="flex items-center gap-4 px-6 py-5">
                      {order.commodity?.cover && (
                        <img
                          src={order.commodity.cover}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl bg-[#fbfbfd] object-contain"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium">
                          {order.commodity?.name ?? "商品"}
                        </p>
                        <p className="mt-1 text-xs text-[#86868b]">
                          {order.create_time}
                          {order.card_num > 0 && ` · ${order.card_num} 张`}
                        </p>
                      </div>
                      <p className="text-gradient-price font-pixel shrink-0 text-xl font-semibold">
                        ¥{formatPrice(order.amount)}
                      </p>
                    </div>

                    {order.secret && (
                      <div className="mx-6 mb-6 rounded-2xl bg-[#fbfbfd] p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-[#86868b]">
                            卡密内容
                          </p>
                          <button
                            onClick={() =>
                              copySecret(order.secret!, order.trade_no)
                            }
                            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
                          >
                            {copied === order.trade_no ? "已复制 ✓" : "复制"}
                          </button>
                        </div>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-[#1d1d1f]">
                          {order.secret}
                        </pre>
                        {order.commodity?.leave_message && (
                          <p className="mt-3 border-t border-black/5 pt-3 text-xs leading-relaxed text-[#86868b]">
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
