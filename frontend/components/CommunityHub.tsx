import type { CommunityGroup, CommunityType } from "@/lib/api";
import { cn } from "@/lib/utils";

const SECTIONS: { type: CommunityType; title: string; hint: string; tone: string }[] = [
  { type: "telegram_notice", title: "电报通知群", hint: "补货、维护和发货通知", tone: "bg-accent-fill text-accent" },
  { type: "telegram_chat", title: "电报交流群", hint: "用户交流与使用讨论", tone: "bg-purple-fill text-purple" },
  { type: "qq_notice", title: "QQ 通知群", hint: "QQ 渠道的通知与客服", tone: "bg-ok-fill text-ok" },
];

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
      <path d="M22 3L2 11l5.5 2L18 6l-8 8.5V20l3.5-3.5L19 19l3-16z" />
    </svg>
  );
}

function QqIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
      <path d="M12 2a9 9 0 0 1 9 9c0 2-.7 3.8-1.8 5.3.3 1.2.8 2.2.8 2.2s-1.7-.2-3-.9A9 9 0 1 1 12 2z" />
    </svg>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-1 rounded-2xl sm:rounded-xl md:rounded-[2rem]",
        "shadow-[inset_0_0_1px_1px_hsl(var(--border)/0.3)]",
        "ring-1 ring-border/50"
      )}
    >
      <div className="grid h-full grid-cols-1 rounded-lg p-1 shadow-md sm:rounded-xl sm:p-1.5 md:rounded-[2rem] md:p-2">
        <div className="h-full rounded-md bg-surface p-2 shadow-xl ring-1 ring-border/50 sm:rounded-lg sm:p-3 md:rounded-3xl md:p-4">
          <div className="flex h-full w-full flex-col overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityHub({ groups }: { groups: CommunityGroup[] }) {
  const total = groups.length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <section className="rounded-[28px] bg-surface p-6 sm:p-10">
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          Community
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-[40px]">加入社群</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          电报通知群、交流群和 QQ 通知群都在这里。有二维码的可以直接扫，有链接的点进去加入。
        </p>
        <p className="mt-4 text-xs text-muted">{total} 个已开放社群</p>
      </section>

      {total === 0 && (
        <div className="mt-6 rounded-3xl bg-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">暂时还没有开放的社群</p>
          <p className="mt-2 text-sm text-muted">开通后会在这里显示全部群链接和二维码。</p>
        </div>
      )}

      {SECTIONS.map((section) => {
        const items = groups.filter((g) => g.type === section.type);
        if (items.length === 0) return null;
        const Icon = section.type === "qq_notice" ? QqIcon : TelegramIcon;
        return (
          <section key={section.type} id={section.type} className="mt-10 scroll-mt-28">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                <p className="mt-1 text-sm text-muted">{section.hint}</p>
              </div>
              <span className="text-xs text-faint">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const body = (
                  <div className="h-full transition-transform duration-300 will-change-transform hover:-translate-y-0.5">
                    <CardShell>
                      <div className="relative aspect-square shrink-0 overflow-hidden rounded-2xl bg-page">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full object-cover object-center scale-[1.12]"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-muted">
                            <Icon />
                          </span>
                        )}
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col px-3 pb-1 pt-3">
                        <span
                          className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${section.tone}`}
                        >
                          {section.title}
                        </span>
                        <h3 className="mt-2 line-clamp-2 min-h-[2.6em] text-[16px] font-semibold leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <div className="mt-auto flex items-end justify-between pt-3">
                          {item.url ? (
                            <span className="btn-graphite inline-flex rounded-full px-5 py-2 text-sm">
                              加入
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted">扫描二维码加入</span>
                          )}
                          <span className="mb-0.5 flex items-center gap-1 text-[11px] text-faint">
                            {item.url ? "打开" : "扫码"}
                            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
                              <path d="M5.6 2.4L11.2 8 5.6 13.6l-1-1L9.2 8 4.6 3.4z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </CardShell>
                  </div>
                );
                return item.url ? (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-full"
                  >
                    {body}
                  </a>
                ) : (
                  <article key={item.id} className="h-full">
                    {body}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
