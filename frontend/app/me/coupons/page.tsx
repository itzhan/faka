"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";

interface Row { id: number; code?: string; money: number; expire_time?: string; status?: number }

export default function CouponsPage() {
  const [list, setList] = useState<Row[]>([]);
  const [money, setMoney] = useState("10");
  const [num, setNum] = useState("1");
  const [life, setLife] = useState("1");
  const [msg, setMsg] = useState("");

  async function load() {
    const json = await mePost("/user/api/coupon/data", { page: 1, limit: 50 });
    if (json.code === 200) setList(json.data.list ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const json = await mePost("/user/api/coupon/save", { money, num, life, mode: 0 });
    setMsg(json.msg || (json.code === 200 ? "已生成" : "失败"));
    if (json.code === 200) void load();
  }
  async function del(id: number) {
    await mePost("/user/api/coupon/del", { list: String(id), id });
    void load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">代券管理</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <form onSubmit={create} className="grid gap-3 rounded-3xl bg-surface p-5 sm:grid-cols-4">
        <div><label className={labelCls}>面值</label><input className={fieldCls} value={money} onChange={(e) => setMoney(e.target.value)} /></div>
        <div><label className={labelCls}>生成数量</label><input className={fieldCls} value={num} onChange={(e) => setNum(e.target.value)} /></div>
        <div><label className={labelCls}>可用次数</label><input className={fieldCls} value={life} onChange={(e) => setLife(e.target.value)} /></div>
        <button className="btn-graphite h-11 self-end rounded-full text-sm">生成</button>
      </form>
      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm">
            <p className="font-pixel">{row.code ?? row.id}</p>
            <p>¥{row.money}{row.status === 2 ? " · 锁定" : ""}</p>
            <div className="flex gap-3">
              <button type="button" className="text-xs" onClick={() => void mePost("/user/api/coupon/lock", { list: String(row.id) }).then(() => load())}>锁定</button>
              <button type="button" className="text-xs" onClick={() => void mePost("/user/api/coupon/unlock", { list: String(row.id) }).then(() => load())}>解锁</button>
              <button type="button" className="text-xs text-danger" onClick={() => del(row.id)}>删除</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无代券</p>}
      </div>
    </div>
  );
}
