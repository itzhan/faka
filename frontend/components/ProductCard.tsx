// 多层圆角环卡片,点击直接进入商品详情页 /item/[id]。
import Link from "next/link";
import type { Commodity } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatPrice(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

const TAG_STYLE: Record<string, string> = {
  red: "bg-danger-fill text-danger",
  orange: "bg-[#cc4e00]/10 text-[#cc4e00]",
  green: "bg-ok-fill text-ok",
  cyan: "bg-[#006f89]/10 text-[#006f89]",
  blue: "bg-accent-fill text-accent",
  purple: "bg-purple-fill text-purple",
  pink: "bg-[#c2298a]/10 text-[#c2298a]",
  gray: "bg-[#555860]/10 text-[#555860]",
};

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-1 rounded-2xl sm:rounded-xl md:rounded-[2rem]",
        "shadow-[inset_0_0_1px_1px_hsl(var(--border)/0.3)]",
        "ring-1 ring-border/50",
        className
      )}
    >
      <div className="grid h-full grid-cols-1 rounded-lg p-1 shadow-md sm:rounded-xl sm:p-1.5 md:rounded-[2rem] md:p-2">
        <div className="h-full rounded-md bg-surface p-2 shadow-xl ring-1 ring-border/50 sm:rounded-lg sm:p-3 md:rounded-3xl md:p-4">
          <div className="flex h-full w-full flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function stockLabel(item: Commodity) {
  if (item.stock <= 0) {
    return { text: "售罄", className: "bg-danger-fill text-danger" };
  }
  if (item.stock_state === 1) {
    return { text: "即将售罄", className: "bg-warn-fill text-warn" };
  }
  return { text: "有库存", className: "bg-ok-fill text-ok" };
}

export default function ProductCard({
  item,
  variant = "poster",
}: {
  item: Commodity;
  variant?: "poster" | "list";
}) {
  const detailUrl = `/item/${item.id}`;
  const stock = stockLabel(item);

  if (variant === "list") {
    return (
      <Link
        href={detailUrl}
        className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface px-3 py-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:gap-4 sm:px-4 sm:py-3.5"
      >
        <div className="h-[88px] w-[70px] shrink-0 overflow-hidden rounded-2xl bg-fill sm:h-[110px] sm:w-[88px]">
          <img
            src={item.cover || "/favicon.ico"}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          {item.category && (
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              {item.category.name}
            </p>
          )}
          <h3 className="mt-0.5 line-clamp-1 text-[15px] font-semibold tracking-tight">
            {item.name}
          </h3>
          {item.leave_message ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">
              {item.leave_message}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {(item.tags ?? []).slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  TAG_STYLE[tag.color] ?? TAG_STYLE.gray
                }`}
              >
                {tag.text}
              </span>
            ))}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                item.delivery_way === 0
                  ? "bg-ok-fill text-ok"
                  : "bg-accent-fill text-accent"
              }`}
            >
              {item.delivery_way === 0 ? "自动交付" : "在线发货"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stock.className}`}
            >
              {stock.text}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <p className="text-gradient-price font-pixel text-[18px] font-semibold leading-none tracking-tight sm:text-[20px]">
            <span className="mr-0.5 text-xs font-medium">¥</span>
            {formatPrice(item.user_price)}
          </p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-subtle">
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M5 1.5A1.5 1.5 0 003.5 3v.5H2.25a.75.75 0 00-.74.66l-.75 6A.75.75 0 001.5 11h13a.75.75 0 00.74-.84l-.75-6a.75.75 0 00-.74-.66H12.5V3A1.5 1.5 0 0011 1.5H5zM11 3v.5H5V3a.5.5 0 01.5-.5h5A.5.5 0 0111 3z" />
            </svg>
          </span>
          <span className="hidden text-faint sm:flex">
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M5.6 2.4L11.2 8 5.6 13.6l-1-1L9.2 8 4.6 3.4z" />
            </svg>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailUrl}
      className="block h-full transition-transform duration-300 will-change-transform hover:-translate-y-0.5"
    >
      <CardShell>
        <div className="relative aspect-[4/5] shrink-0 overflow-hidden rounded-3xl bg-fill">
          <img
            src={item.cover || "/favicon.ico"}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur">
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3 fill-[#0d74ce]"
              aria-hidden
            >
              <path d="M8 0l6 2.4v4.3c0 3.8-2.6 7.3-6 8.3-3.4-1-6-4.5-6-8.3V2.4L8 0zm-.9 10.6l4.2-4.2-1-1-3.2 3.2-1.4-1.4-1 1 2.4 2.4z" />
            </svg>
            官方正版
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3">
          <div className="flex h-6 items-center gap-1.5 overflow-hidden">
            {item.category && (
              <span className="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 text-[11px] font-medium text-subtle">
                {item.category.name}
              </span>
            )}
            {(item.tags ?? []).slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  TAG_STYLE[tag.color] ?? TAG_STYLE.gray
                }`}
              >
                {tag.text}
              </span>
            ))}
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                item.delivery_way === 0
                  ? "bg-ok-fill text-ok"
                  : "bg-accent-fill text-accent"
              }`}
            >
              <svg
                viewBox="0 0 16 16"
                className="h-2.5 w-2.5 fill-current"
                aria-hidden
              >
                <path d="M9.5 0L2 9h4.5L6 16l7.5-9H9z" />
              </svg>
              {item.delivery_way === 0 ? "自动发货" : "在线发货"}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 min-h-[2.6em] text-[16px] font-semibold leading-snug tracking-tight">
            {item.name}
          </h3>

          <div className="mt-auto flex items-end justify-between pt-3">
            <p className="text-gradient-price font-pixel text-[22px] font-semibold leading-none tracking-tight">
              <span className="mr-0.5 text-sm font-medium">¥</span>
              {formatPrice(item.user_price)}
            </p>
            <span className="mb-0.5 flex items-center gap-1 text-[11px] text-faint">
              详情
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3 fill-current"
                aria-hidden
              >
                <path d="M5.6 2.4L11.2 8 5.6 13.6l-1-1L9.2 8 4.6 3.4z" />
              </svg>
            </span>
          </div>
        </div>
      </CardShell>
    </Link>
  );
}
