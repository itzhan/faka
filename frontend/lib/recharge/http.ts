const MAX_BODY = 64 * 1024;

export function jsonError(status: number, code: string, message: string) {
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
