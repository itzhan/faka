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
}

export async function getCommodityDetail(
  id: number
): Promise<CommodityDetail | null> {
  const res = await fetch(
    `${SERVER_BASE}/user/api/index/commodityDetail?commodityId=${id}`,
    { next: { revalidate: 15 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.code !== 200) return null;
  return json.data as CommodityDetail;
}
