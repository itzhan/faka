// 对接现有 PHP 后端 /user/api/* 的类型化封装。
// 服务端组件里直接打后端容器地址；浏览器端走 next.config 的同源 rewrite。

const SERVER_BASE = process.env.API_BASE ?? "http://localhost:8081";

function baseUrl(): string {
  return typeof window === "undefined" ? SERVER_BASE : "";
}

interface ApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  commodity_count?: number;
  children?: Category[];
}

export interface Commodity {
  id: number;
  name: string;
  cover: string;
  price: number;
  user_price: number;
  stock: number;
  order_sold: number;
  delivery_way: number; // 0=人工发货 1=自动发货
  inventory_hidden: number;
  recommend: number;
  category_id: number;
  stock_state: number;
  tags: { text: string; color: string }[];
  category?: { id: number; name: string; icon: string };
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    // 商品数据短缓存，开发期基本即时
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API ${path} HTTP ${res.status}`);
  }
  const json = (await res.json()) as ApiEnvelope<T>;
  if (json.code !== 200) {
    throw new Error(`API ${path} 业务错误: ${json.msg}`);
  }
  return json.data;
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/user/api/index/data");
}

export function getCommodities(categoryId: number): Promise<Commodity[]> {
  return request<Commodity[]>(`/user/api/index/commodity?categoryId=${categoryId}`);
}
