"use client";

import { useCallback, useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Row {
  id: number;
  title: string;
  summary: string;
  jump_url: string | null;
  create_time: string;
  read_time: string | null;
  content?: string;
}

function jumpHref(url: string | null) {
  if (!url) return null;
  const ticket = url.match(/ticket\/detail\?id=(\d+)/);
  if (ticket) return `/me/tickets/${ticket[1]}`;
  if (url.includes("purchaseRecord") || url.includes("/user/personal")) return "/me/orders";
  if (url.startsWith("/user/")) return "/me";
  return url;
}

export default function MessagesPage() {
  const [list, setList] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async (p: number, s = status, k = keyword) => {
    const json = await mePost("/user/api/message/data", { page: p, keyword: k, "equal-status": s });
    if (json.code === 200) {
      setList(json.data.list ?? []);
      setTotal(json.data.total ?? json.data.count ?? 0);
      setPage(p);
    } else setMsg(json.msg || "加载失败");
  }, [status, keyword]);

  useEffect(() => {
    void load(1, status, keyword);
    // 关键字只在回车时查询
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function openDetail(row: Row) {
    const json = await mePost("/user/api/message/detail", { id: row.id });
    if (json.code === 200) {
      setOpen(json.data);
      setList((prev) => prev.map((item) => (item.id === row.id ? { ...item, read_time: item.read_time || "now" } : item)));
    }
  }

  async function del(id: number) {
    if (!confirm("删除这条消息？")) return;
    await mePost("/user/api/message/del", { id });
    if (open?.id === id) setOpen(null);
    void load(page);
  }

  async function clearAll() {
    if (!confirm("清空全部消息？此操作不可恢复。")) return;
    await mePost("/user/api/message/clear");
    setOpen(null);
    void load(1);
  }

  const href = jumpHref(open?.jump_url ?? null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">消息中心</h1>
          <p className="mt-1 text-sm text-muted">打开消息后自动标记为已读。</p>
        </div>
        <button onClick={() => void clearAll()} className="text-xs text-danger">
          清空全部
        </button>
      </div>
      {msg && <p className="text-sm text-muted">{msg}</p>}

      <div className="flex gap-2">
        {[
          { v: "", t: "全部" },
          { v: "0", t: "未读" },
          { v: "1", t: "已读" },
        ].map((item) => (
          <button
            key={item.v}
            type="button"
            onClick={() => setStatus(item.v)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${status === item.v ? "bg-ink text-on-ink" : "border border-hairline bg-surface"}`}
          >
            {item.t}
          </button>
        ))}
      </div>
      <input
        className={fieldCls}
        placeholder="搜索消息标题"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void load(1)}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          {list.map((row) => (
            <div
              key={row.id}
              className={`flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 ${open?.id === row.id ? "ring-1 ring-hairline" : ""}`}
            >
              <button type="button" onClick={() => void openDetail(row)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">
                  {!row.read_time && (
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#0d74ce] align-middle" />
                  )}
                  {row.title}
                </p>
                <p className="mt-1 truncate text-xs text-muted">{row.summary}</p>
                <p className="mt-1 text-[11px] text-faint">{row.create_time}</p>
              </button>
              <button onClick={() => void del(row.id)} className="shrink-0 text-xs text-danger">
                删除
              </button>
            </div>
          ))}
          {list.length === 0 && (
            <p className="rounded-3xl bg-surface py-12 text-center text-sm text-muted">暂无消息</p>
          )}
          {total > 10 && (
            <div className="flex justify-center gap-2 pt-2">
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

        <aside className="rounded-3xl bg-surface p-5">
          {!open && <p className="py-10 text-center text-sm text-muted">选择一条消息查看详情</p>}
          {open && (
            <>
              <h2 className="text-base font-semibold">{open.title}</h2>
              <p className="mt-1 text-xs text-faint">{open.create_time}</p>
              <div
                className="detail-html mt-4 text-sm"
                dangerouslySetInnerHTML={{ __html: open.content || open.summary || "" }}
              />
              {href && (
                <a href={href} className="mt-4 inline-block text-sm text-accent">
                  查看相关内容 →
                </a>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
