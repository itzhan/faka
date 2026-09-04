"use client";

import { useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Row { id: number; name: string; status: number; sort: number }

export default function CategoriesPage() {
  const [list, setList] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const json = await mePost("/user/api/category/data", { page: 1, limit: 100 });
    if (json.code === 200) setList(json.data.list ?? json.data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!name.trim()) return;
    const json = await mePost("/user/api/category/save", { name: name.trim() });
    setMsg(json.msg || (json.code === 200 ? "已保存" : "失败"));
    if (json.code === 200) { setName(""); void load(); }
  }
  async function del(id: number) {
    if (!confirm("删除该分类？")) return;
    await mePost("/user/api/category/del", { id, list: String(id) });
    void load();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">商品分类</h1>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <div className="flex gap-2">
        <input className={fieldCls} placeholder="分类名称" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={save} className="btn-graphite shrink-0 rounded-full px-5 text-sm">新增</button>
      </div>
      <div className="space-y-2">
        {list.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <p className="text-sm font-medium">{row.name}</p>
            <button onClick={() => del(row.id)} className="text-xs text-danger">删除</button>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无分类</p>}
      </div>
    </div>
  );
}
