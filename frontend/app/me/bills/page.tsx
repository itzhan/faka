"use client";

import { useEffect, useState } from "react";
import { mePost } from "@/lib/me";

interface Row { id: number; amount: number; balance: number; type: number; currency: number; log: string; create_time: string }

export default function BillsPage() {
  const [list, setList] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load(p: number) {
    const json = await mePost("/user/api/bill/data", { page: p, limit: 15 });
    if (json.code === 200) {
      setList(json.data.list ?? []);
      setTotal(json.data.total ?? 0);
      setPage(p);
    }
  }
  useEffect(() => { void load(1); }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">我的账单</h1>
      {list.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.log}</p>
            <p className="text-xs text-muted">{row.create_time}</p>
          </div>
          <p className={`font-pixel shrink-0 ${row.type === 1 ? "text-ok" : "text-danger"}`}>
            {row.type === 1 ? "+" : "-"}{row.amount}
          </p>
        </div>
      ))}
      {list.length === 0 && <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无账单</p>}
      {total > 15 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => load(page - 1)} className="rounded-full border border-hairline px-4 py-1.5 text-sm disabled:opacity-40">上一页</button>
          <button onClick={() => load(page + 1)} className="rounded-full border border-hairline px-4 py-1.5 text-sm">下一页</button>
        </div>
      )}
    </div>
  );
}
