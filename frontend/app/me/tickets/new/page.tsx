"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost, meUpload } from "@/lib/me";

interface Option {
  id: number;
  name?: string;
  trade_no?: string;
  commodity_name?: string;
  amount?: number;
}

export default function TicketCreatePage() {
  const [type, setType] = useState(0);
  const [priority, setPriority] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [tradeNo, setTradeNo] = useState("");
  const [orderMode, setOrderMode] = useState<"account" | "manual">("account");
  const [goods, setGoods] = useState<Option[]>([]);
  const [orders, setOrders] = useState<Option[]>([]);
  const [proofId, setProofId] = useState("");
  const [proofPath, setProofPath] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mePost("/user/api/ticket/commodityOptions", { page: 1, limit: 50 }).then((json) => {
      if (json.code === 200) setGoods(json.data.list ?? []);
    });
    mePost("/user/api/ticket/orderOptions", { page: 1, limit: 50 }).then((json) => {
      if (json.code === 200) setOrders(json.data.list ?? []);
    });
  }, []);

  async function onProof(file: File | undefined) {
    if (!file) return;
    const json = await meUpload("/user/api/ticket/upload", file);
    if (json.code === 200) {
      setProofId(String(json.data.upload_id));
      setProofPath(json.data.url || json.data.path || "");
    } else setErr(json.msg || "凭证上传失败");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const body: Record<string, string | number | undefined> = {
        type,
        priority,
        title,
        content,
      };
      if (type === 0 && commodityId) body.commodity_id = commodityId;
      if (type === 1) {
        if (orderMode === "account") body.order_id = orderId;
        else body.trade_no = tradeNo;
        body.proof_upload_id = proofId;
        body.proof_path = proofPath;
      }
      const json = await mePost("/user/api/ticket/create", body);
      if (json.code !== 200) {
        setErr(json.msg || "提交失败");
        return;
      }
      window.location.href = `/me/tickets/${json.data.id}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <a href="/me/tickets" className="text-sm text-muted">
          ← 返回工单
        </a>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">创建工单</h1>
      </div>
      {err && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{err}</p>}

      <section className="rounded-3xl bg-surface p-5">
        <p className={labelCls}>服务类型</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: 0, t: "售前咨询", d: "购买、商品功能或使用方式等疑问" },
            { v: 1, t: "售后支持", d: "已购商品出现异常，需要协助处理" },
          ].map((item) => (
            <button
              key={item.v}
              type="button"
              onClick={() => setType(item.v)}
              className={`rounded-2xl border px-4 py-3 text-left ${type === item.v ? "border-ink bg-ink text-on-ink" : "border-hairline"}`}
            >
              <p className="text-sm font-medium">{item.t}</p>
              <p className={`mt-1 text-xs ${type === item.v ? "text-on-ink/70" : "text-muted"}`}>{item.d}</p>
            </button>
          ))}
        </div>
      </section>

      {type === 0 && (
        <section className="rounded-3xl bg-surface p-5">
          <label className={labelCls}>相关商品（选填）</label>
          <select className={fieldCls} value={commodityId} onChange={(e) => setCommodityId(e.target.value)}>
            <option value="">不关联商品</option>
            {goods.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {type === 1 && (
        <section className="space-y-4 rounded-3xl bg-surface p-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderMode("account")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${orderMode === "account" ? "bg-ink text-on-ink" : "border border-hairline"}`}
            >
              从购买记录选择
            </button>
            <button
              type="button"
              onClick={() => setOrderMode("manual")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${orderMode === "manual" ? "bg-ink text-on-ink" : "border border-hairline"}`}
            >
              手动输入订单号
            </button>
          </div>
          {orderMode === "account" ? (
            <div>
              <label className={labelCls}>相关订单</label>
              <select className={fieldCls} value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
                <option value="">选择已支付订单</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.trade_no} · {o.commodity_name} · ¥{o.amount}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelCls}>订单号</label>
              <input className={fieldCls} value={tradeNo} onChange={(e) => setTradeNo(e.target.value)} required />
            </div>
          )}
          <div>
            <label className={labelCls}>购买凭证（图片）</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void onProof(e.target.files?.[0])}
              className="block w-full text-sm"
            />
            {proofPath && <img src={proofPath} alt="" className="mt-3 h-24 rounded-xl object-contain" />}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-3xl bg-surface p-5">
        <div>
          <p className={labelCls}>优先级</p>
          <div className="flex gap-2">
            {[
              { v: 0, t: "低" },
              { v: 1, t: "中" },
              { v: 2, t: "高" },
            ].map((item) => (
              <button
                key={item.v}
                type="button"
                onClick={() => setPriority(item.v)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${priority === item.v ? "bg-ink text-on-ink" : "border border-hairline"}`}
              >
                {item.t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>工单标题</label>
          <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        </div>
        <div>
          <label className={labelCls}>问题详情</label>
          <textarea
            className={`${fieldCls} h-36 py-3`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <p className="mt-2 text-xs text-faint">请勿发送密码、完整卡密等敏感信息。</p>
        </div>
      </section>

      <button disabled={loading} className="btn-graphite rounded-full px-6 py-2.5 text-sm disabled:opacity-60">
        {loading ? "提交中…" : "提交工单"}
      </button>
    </form>
  );
}
