import { notFound } from "next/navigation";
import { getCommodityDetail } from "@/lib/detail";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import OrderPanel from "@/components/OrderPanel";
import PillHeader from "@/components/PillHeader";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCommodityDetail(Number(id));
  if (!detail) notFound();

  const media = detail.detail_image || detail.cover || "/favicon.ico";

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

          {/* 主面板:左媒体 + 右下单(对齐老站 Item 布局) */}
          <div className="overflow-hidden rounded-3xl bg-white">
            <div className="grid lg:grid-cols-[1.05fr_1fr]">
              {/* 左:详情大图(优先 detail_image),点击查看原图 */}
              <a
                href={media}
                target="_blank"
                rel="noreferrer"
                title="查看原图"
                className="group relative flex items-center justify-center bg-[#fbfbfd] p-8 lg:min-h-[560px]"
              >
                <img
                  src={media}
                  alt={detail.name}
                  className="max-h-[600px] w-full rounded-2xl object-contain"
                />
                <span className="absolute bottom-5 right-5 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#424245] opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
                    <path d="M1 1h5v2H3v3H1V1zm9 0h5v5h-2V3h-3V1zM1 10h2v3h3v2H1v-5zm13 0h2v5h-5v-2h3v-3z" />
                  </svg>
                  查看原图
                </span>
                <span className="absolute left-5 top-5 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-sm backdrop-blur">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#0d74ce]" aria-hidden>
                    <path d="M8 0l6 2.4v4.3c0 3.8-2.6 7.3-6 8.3-3.4-1-6-4.5-6-8.3V2.4L8 0zm-.9 10.6l4.2-4.2-1-1-3.2 3.2-1.4-1.4-1 1 2.4 2.4z" />
                  </svg>
                  官方正版 · 安全稳定
                </span>
              </a>

              {/* 右:标题 / 徽章 / 动态价格 / 下单表单 */}
              <div className="border-t border-black/5 p-8 lg:border-l lg:border-t-0 lg:p-10">
                <OrderPanel detail={detail} />
              </div>
            </div>
          </div>

          {/* 宝贝详情 */}
          <section className="mt-5 rounded-3xl bg-white p-8 sm:p-10">
            <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-[#a1a1a6]">
              Description
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              宝贝详情
            </h2>
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
