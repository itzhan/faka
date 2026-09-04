"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fieldCls, mePost } from "@/lib/me";

interface Ticket {
  id: number;
  ticket_no: string;
  type_text: string;
  priority_text: string;
  status: number;
  status_text: string;
  title: string;
  create_time: string;
  update_time: string;
  last_message_time: string;
  commodity_name?: string | null;
  order_trade_no?: string | null;
  proof?: { url: string } | null;
}

interface Msg {
  id: number;
  sender_type: number;
  sender_name: string;
  content: string;
  create_time: string;
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const json = await mePost("/user/api/ticket/detail", { id, limit: 50 });
    if (json.code !== 200) {
      setErr(json.msg || "工单不存在");
      return;
    }
    setTicket(json.data.ticket);
    setMessages(json.data.messages ?? []);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setErr("");
    const json = await mePost("/user/api/ticket/reply", { id, content });
    setSending(false);
    if (json.code !== 200) {
      setErr(json.msg || "回复失败");
      return;
    }
    setContent("");
    if (json.data?.message) setMessages((prev) => [...prev, json.data.message]);
    else void load();
    if (json.data?.status !== undefined && ticket) {
      setTicket({ ...ticket, status: json.data.status, status_text: "待客服回复" });
    }
  }

  if (err && !ticket) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center">
        <p className="text-sm font-medium">没有找到这张工单</p>
        <p className="mt-2 text-sm text-muted">{err}</p>
        <a href="/me/tickets" className="mt-4 inline-block text-sm text-accent">
          返回工单列表
        </a>
      </div>
    );
  }

  if (!ticket) return <div className="h-64 animate-pulse rounded-3xl bg-surface" />;

  const closed = ticket.status >= 2;

  return (
    <div className="space-y-5">
      <a href="/me/tickets" className="text-sm text-muted">
        ← 返回工单
      </a>
      <div className="rounded-3xl bg-surface p-5">
        <div className="flex flex-wrap gap-2 text-[11px] text-muted">
          <span>{ticket.ticket_no}</span>
          <span>{ticket.type_text}</span>
          <span>优先级 {ticket.priority_text}</span>
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{ticket.title}</h1>
        <p className="mt-2 text-sm text-muted">当前状态：{ticket.status_text}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <div className="space-y-3 rounded-3xl bg-surface p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl px-4 py-3 ${m.sender_type === 0 ? "bg-page" : "border border-hairline-soft"}`}
              >
                <div className="flex justify-between text-xs text-muted">
                  <span>{m.sender_name || (m.sender_type === 0 ? "我" : "客服")}</span>
                  <span>{m.create_time}</span>
                </div>
                <div
                  className="detail-html mt-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: m.content || "" }}
                />
              </div>
            ))}
            {messages.length === 0 && <p className="py-8 text-center text-sm text-muted">暂无沟通记录</p>}
          </div>

          {closed ? (
            <div className="rounded-3xl bg-surface p-5 text-sm text-muted">
              这张工单已结束，无法继续回复。
              <a href="/me/tickets/new" className="ml-2 text-accent">
                创建新工单
              </a>
            </div>
          ) : (
            <form onSubmit={reply} className="rounded-3xl bg-surface p-5">
              {err && <p className="mb-3 text-sm text-danger">{err}</p>}
              <textarea
                className={`${fieldCls} h-28 py-3`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="补充回复"
                required
              />
              <button disabled={sending} className="btn-graphite mt-3 rounded-full px-5 py-2 text-sm disabled:opacity-60">
                {sending ? "发送中…" : "发送回复"}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-3xl bg-surface p-5 text-sm">
            <p className="text-xs text-muted">创建时间</p>
            <p className="mt-1">{ticket.create_time}</p>
            <p className="mt-3 text-xs text-muted">最后更新</p>
            <p className="mt-1">{ticket.update_time || ticket.last_message_time}</p>
            {ticket.commodity_name && (
              <>
                <p className="mt-3 text-xs text-muted">关联商品</p>
                <p className="mt-1">{ticket.commodity_name}</p>
              </>
            )}
            {ticket.order_trade_no && (
              <>
                <p className="mt-3 text-xs text-muted">关联订单</p>
                <p className="mt-1 font-pixel text-xs">{ticket.order_trade_no}</p>
              </>
            )}
          </div>
          {ticket.proof?.url && (
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs text-muted">购买凭证</p>
              <img src={ticket.proof.url} alt="" className="mt-2 rounded-xl" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
