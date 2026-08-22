import { notFound } from "next/navigation";
import { getCommodityDetail } from "@/lib/detail";
import { LEGACY_BASE } from "@/lib/site";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";

function formatPrice(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

const STOCK_LABEL: Record<number, { text: string; cls: string }> = {
  0: { text: "已售罄", cls: "text-[#86868b]" },
  1: { text: "库存 即将售罄", cls: "text-[#cc4e00]" },
  2: { text: "库存 紧张", cls: "text-[#cc4e00]" },
  3: { text: "库存 充足", cls: "text-[#18794e]" },
  4: { text: "库存 非常多", cls: "text-[#18794e]" },
};

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

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCommodityDetail(Number(id));
  if (!detail) notFound();

  const soldOut = detail.stock <= 0 || detail.stock_state === 0;
  const stock = STOCK_LABEL[detail.stock_state] ?? STOCK_LABEL[3];
  const hasDiscount = detail.user_price < detail.price;
  const orderUrl = `${LEGACY_BASE}/item/${detail.id}`;

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate">
        <AuroraBackdrop className="h-[420px]" />

        <main className="mx-auto max-w-7xl px-6 pb-24 pt-28">
          {/* 面包屑 */}
          <nav className="mb-5 flex items-center gap-2 text-[13px] text-[#86868b]">
            <a href="/" className="transition-colors hover:text-[#1d1d1f]">
              商城
            </a>
            <span aria-hidden>/</span>
            <span className="max-w-[60vw] truncate text-[#424245]">
              {detail.name}
            </span>
          </nav>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            {/* 左:封面卡 */}
            <div className="relative overflow-hidden rounded-3xl bg-white">
              <div className="flex aspect-[16/11] w-full items-center justify-center bg-[#fbfbfd] p-8">
                <img
                  src={detail.cover || "/favicon.ico"}
                  alt={detail.name}
                  className="max-h-full max-w-full rounded-2xl object-contain"
                />
              </div>
              <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-sm backdrop-blur">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#0d74ce]" aria-hidden>
                  <path d="M8 0l6 2.4v4.3c0 3.8-2.6 7.3-6 8.3-3.4-1-6-4.5-6-8.3V2.4L8 0zm-.9 10.6l4.2-4.2-1-1-3.2 3.2-1.4-1.4-1 1 2.4 2.4z" />
                </svg>
                官方正版 · 安全稳定
              </span>
            </div>

            {/* 右:信息与购买 */}
            <div className="flex flex-col rounded-3xl bg-white p-8">
              <div className="flex flex-wrap items-center gap-1.5">
                {(detail.tags ?? []).map((tag, i) => (
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
                    detail.delivery_way === 0
                      ? "bg-[#18794e]/10 text-[#18794e]"
                      : "bg-[#0d74ce]/10 text-[#0d74ce]"
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
                    <path d="M9.5 0L2 9h4.5L6 16l7.5-9H9z" />
                  </svg>
                  {detail.delivery_way === 0 ? "自动发货" : "在线发货"}
                </span>
              </div>

              <h1 className="mt-4 text-[26px] font-semibold leading-snug tracking-tight">
                {detail.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-[13px]">
                <span className={`font-medium ${stock.cls}`}>{stock.text}</span>
                {detail.order_sold > 0 && (
                  <span className="rounded-full bg-[#c2298a]/10 px-2.5 py-0.5 font-medium text-[#c2298a]">
                    已售 {detail.order_sold}
                  </span>
                )}
              </p>

              <div className="mt-auto pt-8">
                {hasDiscount && (
                  <p className="text-sm text-[#a1a1a6] line-through">
                    ¥{formatPrice(detail.price)}
                  </p>
                )}
                <p className="text-gradient-price font-pixel text-[40px] font-semibold leading-none tracking-tight">
                  <span className="mr-1 text-xl font-medium">¥</span>
                  {formatPrice(detail.user_price)}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <a
                    href={orderUrl}
                    className={`flex-1 rounded-full py-3 text-center text-[15px] font-medium ${
                      soldOut
                        ? "pointer-events-none bg-[#e8e8ed] text-[#86868b]"
                        : "btn-graphite"
                    }`}
                  >
                    {soldOut ? "已售罄" : "立即购买"}
                  </a>
                  {detail.service_url && (
                    <a
                      href={detail.service_url}
                      className="rounded-full border border-black/10 px-6 py-3 text-[15px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/5"
                    >
                      联系客服
                    </a>
                  )}
                </div>
                <p className="mt-3 text-xs text-[#a1a1a6]">
                  下单与支付将在安全收银台完成。
                </p>
              </div>
            </div>
          </div>

          {/* 商品详情 */}
          <section className="mt-5 rounded-3xl bg-white p-8 sm:p-10">
            <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-[#a1a1a6]">
              Description
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              商品详情
            </h2>
            {detail.detail_image && (
              <img
                src={detail.detail_image}
                alt=""
                className="mt-6 w-full rounded-2xl"
              />
            )}
            <div
              className="detail-html mt-6"
              // 详情 HTML 由后端 HTMLPurifier 白名单消毒后存储,可直接渲染
              dangerouslySetInnerHTML={{ __html: detail.description || "" }}
            />
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
