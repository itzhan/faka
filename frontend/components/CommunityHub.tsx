import type { CommunityGroup } from "@/lib/api";
import { cn } from "@/lib/utils";

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
      <path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
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

const HINTS: Record<string, string> = {
  "support-group": "群二维码有效期较短，过期后请扫客服微信获取新群。",
  "support-wechat": "添加时请备注订单号，不要发送密码或完整 Session。",
};

export default function CommunityHub({ groups }: { groups: CommunityGroup[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <section className="rounded-[28px] bg-surface p-6 sm:p-10">
        <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
          Support
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-[40px]">
          售后客服
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          购买咨询、到账问题和售后都走这里。微信扫描售后群或客服二维码即可联系。联系时请带上订单号。
        </p>
      </section>

      {groups.length === 0 && (
        <div className="mt-6 rounded-3xl bg-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">售后渠道准备中</p>
          <p className="mt-2 text-sm text-muted">开通后会在这里显示客服联系方式。</p>
        </div>
      )}

      {groups.length > 0 && (
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">联系客服</h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:max-w-3xl">
            {groups.map((item) => (
              <article key={item.id} className="h-full">
                <CardShell>
                  <div className="overflow-hidden rounded-2xl bg-page ring-1 ring-hairline/40">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="block h-auto w-full"
                      />
                    ) : (
                      <span className="flex aspect-[3/4] items-center justify-center text-muted">
                        <SupportIcon />
                      </span>
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3">
                    <span className="w-fit rounded-full bg-accent-fill px-2.5 py-0.5 text-[11px] font-medium text-accent">
                      售后客服
                    </span>
                    <h3 className="mt-2 text-[16px] font-semibold leading-snug tracking-tight">
                      {item.name}
                    </h3>
                    {HINTS[item.id] && (
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {HINTS[item.id]}
                      </p>
                    )}
                  </div>
                </CardShell>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
