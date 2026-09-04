"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";
import { useUser } from "@/lib/useUser";

interface Row { id: number; amount: number; type: number; status?: number; create_time?: string }

export default function CashPage() {
  const user = useUser();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("2");
  const [list, setList] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const json = await mePost("/user/api/cash/record", { page: 1, limit: 20 });
    if (json.code === 200) setList(json.data.list ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const json = await mePost("/user/api/cash/submit", { amount, type });
    setMsg(json.msg || (json.code === 200 ? "已提交" : "失败"));
    if (json.code === 200) { setAmount(""); void load(); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">硬币兑现</h1>
      {user && (
        <div className="rounded-3xl bg-surface p-5">
          <p className="text-xs text-muted">当前可用硬币</p>
          <p className="font-pixel mt-1 text-2xl">{user.coin ?? "0"}</p>
          <p className="mt-1 text-xs text-faint">1 硬币按 1 元结算，手续费从到账金额中扣除。</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-5">
        <div>
          <label className={labelCls}>兑现数量</label>
          <input className={fieldCls} value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>到账方式</label>
          <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="2">到余额</option>
            <option value="0">支付宝</option>
            <option value="1">微信</option>
            <option value="3">USDT</option>
          </select>
        </div>
        {msg && <p className="text-sm text-muted">{msg}</p>}
        <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">提交兑现</button>
      </form>
      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="flex justify-between rounded-2xl bg-surface px-4 py-3 text-sm">
            <span>¥{row.amount}</span>
            <span className="text-muted">{row.create_time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
