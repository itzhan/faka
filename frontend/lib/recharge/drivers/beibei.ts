import { jsonError } from "../http";
import type { RechargeDriver, RechargeProvider } from "../server";

async function proxyBeibei(
  provider: RechargeProvider,
  path: string,
  init: { method: string; body?: unknown; idempotencyKey?: string }
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${provider.token}`,
    "Content-Type": "application/json",
  };
  if (init.idempotencyKey) {
    headers["Idempotency-Key"] = init.idempotencyKey;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${provider.api_base}${path}`, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return jsonError(503, "SERVICE_UNAVAILABLE", "充值服务暂时无法连接，请稍后再试");
  }

  const text = await upstream.text();
  const out = new Headers();
  out.set("Content-Type", "application/json");
  const retryAfter = upstream.headers.get("Retry-After");
  if (retryAfter) out.set("Retry-After", retryAfter);

  if (init.idempotencyKey) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        parsed.idempotency_key = init.idempotencyKey;
        return new Response(JSON.stringify(parsed), {
          status: upstream.status,
          headers: out,
        });
      }
    } catch {
      // keep upstream body
    }
  }

  return new Response(text || JSON.stringify({
    success: false,
    code: "SERVICE_UNAVAILABLE",
    message: "充值服务无响应",
    data: null,
  }), {
    status: upstream.status,
    headers: out,
  });
}

/** 贝贝充值:前台信封格式本就按贝贝接口设计,响应原样透传 */
export const beibei: RechargeDriver = {
  check: (provider, code) =>
    proxyBeibei(provider, "/api/v1/recharge/check", {
      method: "POST",
      body: { code },
    }),
  submit: (provider, { code, credential, idempotencyKey }) =>
    proxyBeibei(provider, "/api/v1/recharge/submit", {
      method: "POST",
      idempotencyKey,
      body: { code, credential },
    }),
  request: (provider, requestId) =>
    proxyBeibei(provider, `/api/v1/recharge/requests/${encodeURIComponent(requestId)}`, {
      method: "GET",
    }),
};
