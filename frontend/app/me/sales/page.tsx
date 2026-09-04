"use client";

import { useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Row {
  id: number;
  trade_no: string;
  amount: number;
  status: number;
  delivery_status: number;
  card_num: number;
  commodity?: { name: string };
}

export default function SalesPage() {
  const [list, setList] = useState<Row[]>([]);
  const [secret, setSecret] = useState("");
  const [target, setTarget] = useState<number | null>(null);

  async function load() {
    const json = await mePost("/user/api/commodityOrder/data", { page: 1, limit: 30 });
    if (json.code === 200) setList(json.data.list ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function delivery() {
    if (!target || !secret.trim()) return;
    const json = await mePost("/user/api/commodityOrder/delivery", { id: target, secret });
    if (json.code === 200) { setTarget(null); setSecret(""); void load(); }
    else alert(json.msg);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">商品订单</h1>
      {list.map((row) => (
        <div key={row.id} className="rounded-2xl bg-surface px-4 py-4">
          <div className="flex justify-between gap-3 text-sm">
            <p className="min-w-0 truncate font-medium">{row.commodity?.name ?? row.trade_no}</p>
            <p className="font-pixel text-ok">¥{row.amount}</p>
          </div>
          <p className="mt-1 font-pixel text-[12px] text-muted">{row.trade_no} · x{row.card_num}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span>{row.status === 1 ? "已支付" : "未支付"}</span>
            <span>{row.delivery_status === 1 ? "已发货" : "未发货"}</span>
            {row.status === 1 && row.delivery_status === 0 && (
              <button className="text-accent" onClick={() => setTarget(row.id)}>发货</button>
            )}
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无卖出订单</p>}
      {target && (
        <div className="rounded-3xl bg-surface p-5">
          <p className="text-sm font-medium">填写发货内容</p>
          <textarea className={`${fieldCls} mt-3 h-28 py-3`} value={secret} onChange={(e) => setSecret(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button onClick={delivery} className="btn-graphite rounded-full px-5 py-2 text-sm">确认发货</button>
            <button onClick={() => setTarget(null)} className="rounded-full border border-hairline px-5 py-2 text-sm">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
