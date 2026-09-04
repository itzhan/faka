"use client";

import { useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Row { id: number; username: string; recharge: number; balance: number; create_time: string }

export default function MembersPage() {
  const [list, setList] = useState<Row[]>([]);
  const [to, setTo] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const json = await mePost("/user/api/agentMember/data", { page: 1, limit: 50 });
    if (json.code === 200) setList(json.data.list ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function transfer() {
    if (!to) return;
    const json = await mePost("/user/api/agentMember/transfer", { id: to, amount });
    setMsg(json.msg || (json.code === 200 ? "转账成功" : "失败"));
    if (json.code === 200) { setTo(null); setAmount(""); void load(); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">我的下级</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      {list.map((row) => (
        <div key={row.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-medium">{row.username}</p>
            <p className="text-xs text-muted">余额 ¥{row.balance} · {row.create_time}</p>
          </div>
          <button className="text-xs text-accent" onClick={() => setTo(row.id)}>转账</button>
        </div>
      ))}
      {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无下级</p>}
      {to && (
        <div className="rounded-3xl bg-surface p-5">
          <input className={fieldCls} placeholder="转账金额" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button onClick={transfer} className="btn-graphite rounded-full px-5 py-2 text-sm">确认</button>
            <button onClick={() => setTo(null)} className="rounded-full border border-hairline px-5 py-2 text-sm">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
