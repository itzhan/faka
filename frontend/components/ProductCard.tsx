import type { Commodity } from "@/lib/api";

function formatPrice(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

/** stock_state: 0=售罄 1=≤5 2=≤20 3=≤100 4=更多(见 Shop::getStockState) */
const STOCK_LABEL: Record<number, { text: string; cls: string }> = {
  0: { text: "已售罄", cls: "text-[#86868b]" },
  1: { text: "库存 即将售罄", cls: "text-[#cc4e00]" },
  2: { text: "库存 紧张", cls: "text-[#cc4e00]" },
  3: { text: "库存 充足", cls: "text-[#18794e]" },
  4: { text: "库存 非常多", cls: "text-[#18794e]" },
};

/** 后端标签颜色白名单 → 苹果风浅底色 chip */
const TAG_STYLE: Record<string, string> = {
  red: "bg-[#ce2c31]/10 text-[#ce2c31]",
  orange: "bg-[#cc4e00]/10 text-[#cc4e00]",
  green: "bg-[#18794e]/10 text-[#18794e]",
  cyan: "bg-[#006f89]/10 text-[#006f89]",
  blue: "bg-[#0d74ce]/10 text-[#0d74ce]",
  purple: "bg-[#7e42af]/10 text-[#7e42af]",
  pink: "bg-[#c2298a]/10 text-[#c2298a]",
  gray: "bg-[#555860]/10 text-[#555860]",
};

export default function ProductCard({ item }: { item: Commodity }) {
  const soldOut = item.stock <= 0 || item.stock_state === 0;
  const stock = STOCK_LABEL[item.stock_state] ?? STOCK_LABEL[3];
  const detailUrl = `/item/${item.id}`;
  const hasDiscount = item.user_price < item.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#7e42af]/20 hover:shadow-[0_24px_60px_rgba(74,74,156,0.12)]">
      {/* 封面:留白衬底,按图片比例完整展示;右上角官方角标 */}
      <div className="relative bg-[#fbfbfd] p-4 pb-3">
        {/* 16:10 舞台:图片等比缩放完整展示(不裁切),方图居中、横幅图铺满,卡片高度统一 */}
        <div className="flex aspect-[16/10] w-full items-center justify-center">
          <img
            src={item.cover || "/favicon.ico"}
            alt={item.name}
            className="max-h-full max-w-full rounded-xl object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015]"
          />
        </div>
        <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-sm backdrop-blur">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#0d74ce]" aria-hidden>
            <path d="M8 0l6 2.4v4.3c0 3.8-2.6 7.3-6 8.3-3.4-1-6-4.5-6-8.3V2.4L8 0zm-.9 10.6l4.2-4.2-1-1-3.2 3.2-1.4-1.4-1 1 2.4 2.4z" />
          </svg>
          官方正版 · 安全稳定
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-1">
        {/* 分类 chip + 商品标签 + 发货方式 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.category && (
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-[#424245]">
              {item.category.name}
            </span>
          )}
          {(item.tags ?? []).map((tag, i) => (
            <span
              key={i}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                TAG_STYLE[tag.color] ?? TAG_STYLE.gray
              }`}
            >
              {tag.text}
            </span>
          ))}
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              item.delivery_way === 0
                ? "bg-[#18794e]/10 text-[#18794e]"
                : "bg-[#0d74ce]/10 text-[#0d74ce]"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
              <path d="M9.5 0L2 9h4.5L6 16l7.5-9H9z" />
            </svg>
            {item.delivery_way === 0 ? "自动发货" : "在线发货"}
          </span>
        </div>

        <h3 className="mt-3 text-[18px] font-semibold leading-snug tracking-tight">
          {item.name}
        </h3>

        <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868b]">
          {item.delivery_way === 0
            ? "自助下单,付款后系统即时发放,全程无需等待。"
            : "付款后人工核发,进度可在订单页实时查看。"}
        </p>

        {/* 价格 × 库存/销量 */}
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {hasDiscount && (
              <p className="text-[13px] text-[#a1a1a6] line-through">
                ¥{formatPrice(item.price)}
              </p>
            )}
            <p className="text-gradient-price font-pixel text-[28px] font-semibold leading-none tracking-tight">
              <span className="mr-0.5 text-base font-medium">¥</span>
              {formatPrice(item.user_price)}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-0.5 text-[13px]">
            <span className={`font-medium ${stock.cls}`}>{stock.text}</span>
            {item.order_sold > 0 && (
              <span className="rounded-full bg-[#c2298a]/10 px-2.5 py-0.5 font-medium text-[#c2298a]">
                已售 {item.order_sold}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-5">
          <a
            href={detailUrl}
            className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium ${
              soldOut
                ? "pointer-events-none bg-[#e8e8ed] text-[#86868b]"
                : "btn-graphite"
            }`}
          >
            {soldOut ? "已售罄" : "立即下单"}
          </a>
          <a
            href={detailUrl}
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
          >
            查看详情
          </a>
        </div>
      </div>
    </article>
  );
}
