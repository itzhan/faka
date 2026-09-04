"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";
import { useUser } from "@/lib/useUser";

interface Pay { id: number; name: string; icon: string }

const PRESETS = ["50", "100", "200", "500", "1000"];

export default function RechargePage() {
  const user = useUser();
  const [pays, setPays] = useState<Pay[]>([]);
  const [payId, setPayId] = useState<number | null>(null);
  const [amount, setAmount] = useState("100");
  const [err, setErr] = useState("");

  useEffect(() => {
    mePost("/user/api/recharge/pay").then((json) => {
      if (json.code === 200) {
        setPays(json.data ?? []);
        if (json.data?.[0]) setPayId(json.data[0].id);
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const json = await mePost("/user/api/recharge/trade", { amount, pay_id: payId ?? "" });
    if (json.code !== 200) { setErr(json.msg || "下单失败"); return; }
    if (json.data?.url) window.location.href = json.data.url;
    else setErr("未返回支付地址");
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">充值中心</h1>
      {user && (
        <div className="rounded-3xl bg-surface p-5">
          <p className="text-xs text-muted">账户余额</p>
          <p className="font-pixel mt-1 text-2xl">¥{user.balance}</p>
          <p className="mt-1 text-xs text-faint">元气 {user.recharge ?? 0}{user.group?.name ? ` · ${user.group.name}` : ""}</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
        <div>
          <label className={labelCls}>充值金额</label>
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`rounded-full px-4 py-1.5 text-sm ${amount === p ? "bg-ink text-on-ink" : "border border-hairline"}`}
              >
                ¥{p}
              </button>
            ))}
          </div>
          <input className={fieldCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>支付方式</label>
          <div className="flex flex-wrap gap-2">
            {pays.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPayId(p.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${payId === p.id ? "bg-ink text-on-ink" : "border border-hairline"}`}
              >
                {p.icon && <img src={p.icon} alt="" className="h-5 w-5 rounded" />}
                {p.name}
              </button>
            ))}
            {pays.length === 0 && <p className="text-sm text-muted">暂无可用充值方式</p>}
          </div>
        </div>
        {err && <p className="text-sm text-danger">{err}</p>}
        <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">去支付</button>
      </form>
    </div>
  );
}
