"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";

interface Row { id: number; secret: string; status: number; commodity?: { name: string } }

export default function CardsPage() {
  const [list, setList] = useState<Row[]>([]);
  const [goods, setGoods] = useState<{ id: number; name: string }[]>([]);
  const [commodityId, setCommodityId] = useState("");
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [cards, com] = await Promise.all([
      mePost("/user/api/card/data", { page: 1, limit: 50 }),
      mePost("/user/api/commodity/data", { page: 1, limit: 100 }),
    ]);
    if (cards.code === 200) setList(cards.data.list ?? []);
    if (com.code === 200) setGoods(com.data.list ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const body = new URLSearchParams({ commodity_id: commodityId, secret, unique: "1" });
    const json = await fetch("/user/api/card/save", { method: "POST", body, credentials: "include" }).then((r) => r.json());
    setMsg(json.msg || (json.code === 200 ? "已导入" : "失败"));
    if (json.code === 200) { setSecret(""); void load(); }
  }
  async function act(path: string, id: number) {
    await mePost(path, { list: String(id), id });
    void load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">卡密管理</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <form onSubmit={add} className="space-y-3 rounded-3xl bg-surface p-5">
        <div>
          <label className={labelCls}>商品</label>
          <select className={fieldCls} value={commodityId} onChange={(e) => setCommodityId(e.target.value)} required>
            <option value="">选择商品</option>
            {goods.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>卡密（一行一张）</label>
          <textarea className={`${fieldCls} h-28 py-3`} value={secret} onChange={(e) => setSecret(e.target.value)} required />
        </div>
        <button className="btn-graphite rounded-full px-5 py-2 text-sm">导入卡密</button>
      </form>
      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="rounded-2xl bg-surface px-4 py-3">
            <p className="truncate font-mono text-xs">{row.secret}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <span className={row.status === 0 ? "text-ok" : "text-muted"}>
                {row.status === 0 ? "未售" : row.status === 2 ? "锁定" : "已售"}
              </span>
              <button onClick={() => act("/user/api/card/lock", row.id)}>锁定</button>
              <button onClick={() => act("/user/api/card/unlock", row.id)}>解锁</button>
              <button className="text-danger" onClick={() => act("/user/api/card/del", row.id)}>删除</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无卡密</p>}
      </div>
    </div>
  );
}
