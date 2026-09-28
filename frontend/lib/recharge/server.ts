// 自助充值的多商家分发:兑换码前缀 → 后台配置的充值商家 → 对应对接类型(driver)。
// 商家配置(含密钥)存在 PHP 后台「充值商家」,这里用共享密钥 RECHARGE_INTERNAL_KEY 取回。
import { beibei } from "./drivers/beibei";
import { jsonError } from "./http";

export interface RechargeProvider {
  id: string;
  driver: string;
  api_base: string;
  token: string;
}

/**
 * 每种对接类型各自实现。返回给前台的响应体必须统一成贝贝格式的信封
 * {success, code, message, data, request_id},前台 lib/beibei.ts 按它解析。
 */
export interface RechargeDriver {
  check(provider: RechargeProvider, code: string): Promise<Response>;
  submit(
    provider: RechargeProvider,
    input: {
      code: string;
      credential: { type: string; value: string };
      idempotencyKey: string;
    }
  ): Promise<Response>;
  request(provider: RechargeProvider, requestId: string): Promise<Response>;
}

// key 与后台 App\Util\RechargeProvider::DRIVERS 保持一致
const DRIVERS: Record<string, RechargeDriver> = {
  beibei,
};

const API_BASE = process.env.API_BASE ?? "http://localhost:8081";

type Resolved =
  | { ok: true; provider: RechargeProvider; driver: RechargeDriver }
  | { ok: false; res: Response };

export async function resolveProvider(
  query: { code: string } | { id: string }
): Promise<Resolved> {
  const key = process.env.RECHARGE_INTERNAL_KEY;
  if (!key) {
    return { ok: false, res: jsonError(503, "SERVICE_UNAVAILABLE", "充值服务未配置") };
  }

  let json: { code?: number; data?: RechargeProvider } | null;
  try {
    const res = await fetch(`${API_BASE}/user/api/rechargeProvider/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Recharge-Key": key },
      body: JSON.stringify(query),
      cache: "no-store",
    });
    json = await res.json();
  } catch {
    return {
      ok: false,
      res: jsonError(503, "SERVICE_UNAVAILABLE", "充值服务暂时无法连接，请稍后再试"),
    };
  }

  if (json?.code === 404) {
    return {
      ok: false,
      res:
        "code" in query
          ? jsonError(400, "CODE_UNRECOGNIZED", "无法识别该兑换码，请检查是否输入完整")
          : jsonError(404, "REQUEST_NOT_FOUND", "未找到该充值请求"),
    };
  }
  const provider = json?.code === 200 ? json.data : undefined;
  const driver = provider ? DRIVERS[provider.driver] : undefined;
  if (!provider || !driver) {
    return { ok: false, res: jsonError(503, "SERVICE_UNAVAILABLE", "充值服务未配置") };
  }
  return { ok: true, provider, driver };
}

// 对外的 request_id 带上商家 ID(`商家ID:上游ID`),查询进度时据此找回商家
export function splitRequestId(id: string): { providerId: string; upstreamId: string } | null {
  const sep = id.indexOf(":");
  if (sep <= 0 || sep === id.length - 1) return null;
  return { providerId: id.slice(0, sep), upstreamId: id.slice(sep + 1) };
}

export async function withProviderRequestId(
  res: Response,
  providerId: string
): Promise<Response> {
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(text, { status: res.status, headers });
  }
  const tag = (obj: unknown) => {
    const rec = obj as Record<string, unknown> | null;
    if (rec && typeof rec === "object" && typeof rec.request_id === "string" && rec.request_id) {
      rec.request_id = `${providerId}:${rec.request_id}`;
    }
  };
  tag(body);
  tag((body as Record<string, unknown> | null)?.data);
  return new Response(JSON.stringify(body), { status: res.status, headers });
}
