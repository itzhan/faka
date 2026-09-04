// 商品详情接口封装(GET /user/api/index/commodityDetail)

const SERVER_BASE = process.env.API_BASE ?? "http://localhost:8081";

export interface CommodityDetail {
  id: number;
  name: string;
  description: string; // 富文本 HTML(后端 HTMLPurifier 已消毒)
  cover: string;
  detail_image: string | null;
  price: number;
  user_price: number;
  stock: number;
  stock_state: number;
  delivery_way: number;
  order_sold: number;
  inventory_hidden: number;
  category_id: number;
  tags: { text: string; color: string }[];
  service_url: string;
  share_url: string;
  /** {category?: {race: price}, sku?: {group: {option: addPrice}}} 或空数组 */
  config: { category?: Record<string, number>; sku?: Record<string, Record<string, number>> } | unknown[];
  widget: { name: string; title?: string; label?: string }[];
  contact_type: number; // 0=任意 1=手机 2=邮箱 3=QQ
  password_status: number;
  trade_captcha: number;
  coupon: number;
  minimum: number;
  maximum: number;
  draft_status: number;
  login: boolean;
}

const detailCache = new Map<number, Promise<CommodityDetail | null>>();

export async function getCommodityDetail(
  id: number
): Promise<CommodityDetail | null> {
  const isServer = typeof window === "undefined";
  const base = isServer ? SERVER_BASE : "";
  const res = await fetch(
    `${base}/user/api/index/commodityDetail?commodityId=${id}`,
    isServer ? { next: { revalidate: 15 } } : undefined
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.code !== 200) return null;
  return json.data as CommodityDetail;
}

/** 悬停预取,展开详情时 instant 命中 */
export function prefetchCommodityDetail(id: number) {
  if (typeof window === "undefined") return;
  if (!detailCache.has(id)) {
    detailCache.set(id, getCommodityDetail(id));
  }
  return detailCache.get(id);
}
