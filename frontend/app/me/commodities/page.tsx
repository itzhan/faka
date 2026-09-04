"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";

interface Row {
  id: number;
  name: string;
  cover: string;
  status: number;
  user_price: number;
  card_count?: number;
}

export default function CommoditiesPage() {
  const [list, setList] = useState<Row[]>([]);
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const [goods, catsRes] = await Promise.all([
      mePost("/user/api/commodity/data", { page: 1, limit: 50 }),
      mePost("/user/api/category/data", { page: 1, limit: 100 }),
    ]);
    if (goods.code === 200) setList(goods.data.list ?? []);
    if (catsRes.code === 200) setCats(catsRes.data.list ?? catsRes.data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const json = await mePost("/user/api/commodity/save", {
      name,
      price,
      user_price: price,
      category_id: categoryId,
      delivery_way: 0,
      status: 1,
    });
    setMsg(json.msg || (json.code === 200 ? "已添加" : "失败"));
    if (json.code === 200) { setName(""); setPrice(""); void load(); }
  }
  async function toggle(row: Row) {
    await mePost("/user/api/commodity/save", { id: row.id, status: row.status === 1 ? 0 : 1 });
    void load();
  }
  async function del(id: number) {
    if (!confirm("删除该商品？")) return;
    await mePost("/user/api/commodity/del", { id, list: String(id) });
    void load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">我的商品</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <form onSubmit={create} className="grid gap-3 rounded-3xl bg-surface p-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>名称</label>
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>售价</label>
          <input className={fieldCls} value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>分类</label>
          <select className={fieldCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">选择分类</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn-graphite h-11 self-end rounded-full px-5 text-sm sm:col-span-4">添加商品</button>
      </form>
      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
            <img src={row.cover || "/favicon.ico"} alt="" className="h-10 w-10 rounded-lg object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted">¥{row.user_price} · 库存卡 {row.card_count ?? 0}</p>
            </div>
            <button onClick={() => toggle(row)} className="text-xs text-accent">{row.status === 1 ? "下架" : "上架"}</button>
            <button onClick={() => del(row.id)} className="text-xs text-danger">删除</button>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无商品</p>}
      </div>
    </div>
  );
}
