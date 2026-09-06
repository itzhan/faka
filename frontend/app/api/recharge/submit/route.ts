import { proxyBeibei, readJsonBody } from "@/lib/beibei-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await readJsonBody(req);
  if (!parsed.ok) return parsed.res;

  const code = typeof parsed.body.code === "string" ? parsed.body.code.trim() : "";
  const credential = parsed.body.credential;
  if (!code) {
    return Response.json(
      { success: false, code: "INVALID_REQUEST", message: "请输入卡密", data: null },
      { status: 400 }
    );
  }
  if (!credential || typeof credential !== "object" || Array.isArray(credential)) {
    return Response.json(
      { success: false, code: "CREDENTIAL_REQUIRED", message: "请填写账号凭证", data: null },
      { status: 400 }
    );
  }

  const cred = credential as Record<string, unknown>;
  const type = typeof cred.type === "string" ? cred.type : "";
  let value = cred.value;
  if (value && typeof value === "object") {
    value = JSON.stringify(value);
  }
  if (!type || typeof value !== "string" || !value.trim()) {
    return Response.json(
      { success: false, code: "CREDENTIAL_INVALID", message: "账号凭证不正确", data: null },
      { status: 400 }
    );
  }

  const givenKey = parsed.body.idempotency_key;
  const idempotencyKey =
    typeof givenKey === "string" && givenKey.trim()
      ? givenKey.trim()
      : crypto.randomUUID();

  return proxyBeibei("/api/v1/recharge/submit", {
    method: "POST",
    idempotencyKey,
    body: { code, credential: { type, value } },
  });
}
