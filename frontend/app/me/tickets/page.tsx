"use client";

import { useCallback, useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Stats {
  pending_admin: number;
  pending_user: number;
  resolved: number;
  closed: number;
}

interface TicketRow {
  id: number;
  ticket_no: string;
  type: number;
  type_text: string;
  priority_text: string;
  status: number;
  status_text: string;
  title: string;
  last_message_excerpt: string;
  last_message_time: string;
  user_unread: number;
  commodity_name?: string | null;
}

const STATUS_FILTERS: { value: string; label: string; key: keyof Stats | "all" }[] = [
  { value: "", label: "全部工单", key: "all" },
  { value: "0", label: "待客服回复", key: "pending_admin" },
  { value: "1", label: "待我回复", key: "pending_user" },
  { value: "2", label: "已经解决", key: "resolved" },
  { value: "3", label: "已经关闭", key: "closed" },
];

export default function TicketsPage() {
  const [list, setList] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(true);

  const load = useCallback(async (p: number, s = status, t = type, k = keyword) => {
    const json = await mePost("/user/api/ticket/data", {
      page: p,
      limit: 10,
      status: s,
      type: t,
      keyword: k,
    });
    if (json.code !== 200) {
      setError(json.msg || "加载失败");
      return;
    }
    if (json.data?.ready === false) {
      setReady(false);
      return;
    }
    setReady(true);
    setList(json.data.list ?? []);
    setTotal(json.data.total ?? 0);
    setStats(json.data.stats ?? null);
    setPage(p);
  }, [status, type, keyword]);

  useEffect(() => {
    void load(1, status, type, keyword);
    // 关键字只在回车时查询，避免每敲一字就请求
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type]);

  const allCount = stats
    ? stats.pending_admin + stats.pending_user + stats.resolved + stats.closed
    : 0;

  if (!ready) {
    return (
      <div className="rounded-3xl bg-surface p-8 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight">我的工单</h1>
        <p className="mt-3 text-sm text-muted">工单功能尚未启用，请联系管理员完成数据库升级。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">我的工单</h1>
          <p className="mt-1 text-sm text-muted">购买前有疑问，或购买后需要帮助，都可以在这里和客服沟通。</p>
        </div>
        <a href="/me/tickets/new" className="btn-graphite rounded-full px-5 py-2 text-sm">
          创建工单
        </a>
      </div>

      {error && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STATUS_FILTERS.map((item) => {
          const count = item.key === "all" ? allCount : (stats?.[item.key] ?? 0);
          const active = status === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              className={`rounded-2xl px-3 py-3 text-left ${active ? "bg-ink text-on-ink" : "bg-surface"}`}
            >
              <p className={`text-[11px] ${active ? "text-on-ink/70" : "text-muted"}`}>{item.label}</p>
              <p className="font-pixel mt-1 text-xl">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={fieldCls}
          placeholder="搜索工单号或标题"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load(1)}
        />
        <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">全部类型</option>
          <option value="0">售前咨询</option>
          <option value="1">售后支持</option>
        </select>
      </div>

      <div className="space-y-2">
        {list.map((row) => (
          <a key={row.id} href={`/me/tickets/${row.id}`} className="block rounded-2xl bg-surface px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {row.user_unread > 0 && (
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#0d74ce] align-middle" />
                  )}
                  {row.title}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {row.ticket_no} · {row.type_text}
                  {row.commodity_name ? ` · ${row.commodity_name}` : ""}
                </p>
                {row.last_message_excerpt && (
                  <p className="mt-1 truncate text-xs text-faint">{row.last_message_excerpt}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-full bg-fill px-2 py-0.5 text-[11px]">{row.status_text}</span>
                <p className="mt-2 text-[11px] text-faint">{row.last_message_time}</p>
              </div>
            </div>
          </a>
        ))}
        {list.length === 0 && (
          <div className="rounded-3xl bg-surface py-14 text-center">
            <p className="text-sm font-medium">这里还没有工单</p>
            <p className="mt-1 text-sm text-muted">遇到疑问时，创建一张工单就能持续跟进。</p>
            <a href="/me/tickets/new" className="mt-4 inline-block text-sm text-accent">
              创建第一张工单
            </a>
          </div>
        )}
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
            className="rounded-full border border-hairline px-4 py-1.5 text-sm disabled:opacity-40"
          >
            上一页
          </button>
          <button
            disabled={page * 10 >= total}
            onClick={() => void load(page + 1)}
            className="rounded-full border border-hairline px-4 py-1.5 text-sm disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
