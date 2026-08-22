import DitherVisual from "@/components/DitherVisual";
import {
  BUYING_NOTES,
  COMMUNITY_LINKS,
  HERO_ACTIONS,
  SITE,
} from "@/lib/site";

interface Stats {
  productCount: number;
  totalSold: number;
  stockLabel: string;
}

const NOTE_ICONS = [
  // 实时商品信息
  <path key="0" d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 5h12v2H6V7zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />,
  // 按商品交付
  <path key="1" d="M3 4h13v4h3l3 4v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V4h2zm13 6v3h4.5L18 10h-2z" />,
  // 订单可查询
  <path key="2" d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm8.7 15.3l3 3-1.4 1.4-3-3 1.4-1.4zM10 5v5l4 2-.8 1.5L8.5 11V5H10z" />,
];

export default function Hero({ stats }: { stats: Stats }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-6 pt-28 lg:grid-cols-[1.4fr_1fr]">
      {/* 左:标题 + 宣传 + 社群 + 行动,右侧嵌像素抖动视觉 */}
      <div className="grid rounded-3xl bg-white p-10 lg:grid-cols-[1fr_240px] lg:gap-8">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap rounded-full bg-[#18794e]/10 px-2.5 py-1 text-[11px] font-medium text-[#18794e]">
            官方直充
          </span>
          <span className="whitespace-nowrap rounded-full bg-[#0d74ce]/10 px-2.5 py-1 text-[11px] font-medium text-[#0d74ce]">
            自动发货
          </span>
          <span className="truncate text-xs font-medium uppercase tracking-widest text-[#86868b]">
            {SITE.subtitle}
          </span>
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          <span className="text-gradient-ink">
            <span className="font-pixel">AI</span> 订阅
          </span>
          ,即买即用。
        </h1>
        <div className="mt-4 space-y-1 text-[15px] text-[#424245]">
          {SITE.promises.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {COMMUNITY_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-medium text-[#424245] transition-colors hover:bg-black/5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#48484a]" aria-hidden>
                {link.icon === "telegram" ? (
                  <path d="M22 3L2 11l5.5 2L18 6l-8 8.5V20l3.5-3.5L19 19l3-16z" />
                ) : (
                  <path d="M12 2a9 9 0 0 1 9 9c0 2-.7 3.8-1.8 5.3.3 1.2.8 2.2.8 2.2s-1.7-.2-3-.9A9 9 0 1 1 12 2z" />
                )}
              </svg>
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={HERO_ACTIONS.browse.href}
            className="btn-graphite rounded-full px-6 py-2.5 text-sm font-medium"
          >
            {HERO_ACTIONS.browse.label}
          </a>
          <a
            href={HERO_ACTIONS.query.href}
            className="rounded-full border border-black/10 px-6 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
          >
            {HERO_ACTIONS.query.label}
          </a>
          <a
            href={HERO_ACTIONS.agent.href}
            className="text-sm font-medium text-[#1d1d1f] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black/50"
          >
            {HERO_ACTIONS.agent.label} →
          </a>
        </div>
      </div>

      {/* 像素抖动蛋形视觉(窄屏隐藏) */}
      <div className="hidden items-center lg:flex">
        <div className="h-[300px] w-full">
          <DitherVisual />
        </div>
      </div>
      </div>

      {/* 右:统计 + 购买说明 */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-3xl bg-black/5">
          {[
            { label: "上架商品", value: String(stats.productCount), cls: "text-[#0d74ce]" },
            { label: "可用库存", value: stats.stockLabel, cls: "text-[#18794e]" },
            { label: "累计成交", value: stats.totalSold.toLocaleString(), cls: "text-[#7e42af]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-4 py-6 text-center">
              <p className={`text-2xl font-semibold tracking-tight ${stat.cls}`}>
                {/^[\d,]+$/.test(stat.value) ? (
                  <span className="font-pixel">{stat.value}</span>
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1 text-xs text-[#86868b]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 rounded-3xl bg-white p-7">
          <h2 className="text-sm font-semibold">购买说明</h2>
          <ul className="mt-4 space-y-4">
            {BUYING_NOTES.map((note, i) => (
              <li key={note.title} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#48484a]" aria-hidden>
                    {NOTE_ICONS[i]}
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-medium">{note.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#86868b]">
                    {note.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
