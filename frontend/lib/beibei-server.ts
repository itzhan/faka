const BASE = process.env.BEIBEI_API_BASE ?? "https://beibeichongzhi.com";
const MAX_BODY = 64 * 1024;

function jsonError(status: number, code: string, message: string) {
  return Response.json(
    { success: false, code, message, data: null, request_id: null },
    { status }
  );
}

export async function readJsonBody(
  req: Request
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; res: Response }> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_BODY) {
    return { ok: false, res: jsonError(413, "INVALID_REQUEST", "请求体过大") };
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, res: jsonError(400, "INVALID_REQUEST", "请求格式不正确") };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, res: jsonError(400, "INVALID_REQUEST", "请求格式不正确") };
  }
  return { ok: true, body: body as Record<string, unknown> };
}

export async function proxyBeibei(
  path: string,
  init: { method: string; body?: unknown; idempotencyKey?: string }
): Promise<Response> {
  const token = process.env.BEIBEI_API_TOKEN;
  if (!token) {
    return jsonError(503, "SERVICE_UNAVAILABLE", "充值服务未配置");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (init.idempotencyKey) {
    headers["Idempotency-Key"] = init.idempotencyKey;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}${path}`, {
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
