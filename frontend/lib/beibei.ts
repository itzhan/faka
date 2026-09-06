import { parseChatGptSession } from "@/lib/session-json";

export interface BeibeiField {
  key: string;
  label: string;
  required: boolean;
  type: string;
}

export interface BeibeiCredentialOption {
  label: string;
  fields: BeibeiField[];
}

export interface BeibeiReceipt {
  email?: string;
  plan?: string;
  completed_at?: string;
}

export interface BeibeiData {
  state?: string;
  product_type?: string;
  plan?: string;
  credential_options?: BeibeiCredentialOption[];
  completed_at?: string | null;
  retry_after_seconds?: number | null;
  receipt?: BeibeiReceipt;
}

export interface BeibeiEnvelope {
  request_id?: string | null;
  success: boolean;
  code: string;
  message: string;
  data: BeibeiData | null;
  idempotency_key?: string;
  http: number;
  retry_after: number | null;
}

export function redeemHref(code?: string): string {
  const first = (code ?? "").split(/\s+/)[0]?.trim();
  if (!first) return "/redeem";
  return `/redeem?code=${encodeURIComponent(first)}`;
}

export function assembleCredential(
  option: BeibeiCredentialOption | undefined,
  values: Record<string, string>
): { type: string; value: string } {
  const fields = option?.fields ?? [];
  const type = fields.find((f) => f.key === "session_json")?.key ?? fields[0]?.key ?? "session_json";
  if (fields.length === 1) {
    let value = values[fields[0].key] ?? "";
    if (fields[0].key === "session_json") {
      const parsed = parseChatGptSession(value);
      if (parsed?.ok) value = parsed.cleaned;
    }
    return { type: fields[0].key, value };
  }
  if (fields.length <= 1) {
    let value = values[type] ?? "";
    if (type === "session_json") {
      const parsed = parseChatGptSession(value);
      if (parsed?.ok) value = parsed.cleaned;
    }
    return { type, value };
  }
  return { type, value: JSON.stringify(values) };
}

function retryAfterFrom(res: Response, json: { data?: BeibeiData | null }): number | null {
  const header = res.headers.get("Retry-After");
  if (header) {
    const n = Number(header);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const fromData = json.data?.retry_after_seconds;
  if (typeof fromData === "number" && fromData > 0) return fromData;
  return null;
}

async function readEnvelope(res: Response): Promise<BeibeiEnvelope> {
  let json: Omit<BeibeiEnvelope, "http" | "retry_after">;
  try {
    json = await res.json();
  } catch {
    json = {
      success: false,
      code: "SERVICE_UNAVAILABLE",
      message: "充值服务暂时无法连接，请稍后再试",
      data: null,
    };
  }
  return {
    ...json,
    success: Boolean(json.success),
    code: json.code || (res.ok ? "OK" : "SERVICE_UNAVAILABLE"),
    message: json.message || "请求失败",
    data: json.data ?? null,
    http: res.status,
    retry_after: retryAfterFrom(res, json),
  };
}

export async function checkCode(code: string): Promise<BeibeiEnvelope> {
  const res = await fetch("/api/recharge/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return readEnvelope(res);
}

export async function submitRecharge(input: {
  code: string;
  credential: { type: string; value: string };
  idempotency_key?: string;
}): Promise<BeibeiEnvelope> {
  const res = await fetch("/api/recharge/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readEnvelope(res);
}

export async function getRequest(requestId: string): Promise<BeibeiEnvelope> {
  const res = await fetch(`/api/recharge/requests/${encodeURIComponent(requestId)}`);
  return readEnvelope(res);
}

export function isReady(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  return env.success && (env.data?.state === "ready" || env.code === "OK");
}

export function isProcessing(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  return (
    env.code === "REQUEST_ACCEPTED" ||
    env.code === "REQUEST_PROCESSING" ||
    env.code === "CARD_PROCESSING" ||
    env.code === "REQUEST_OUTCOME_UNKNOWN" ||
    env.data?.state === "processing" ||
    env.http === 202
  );
}

export function isCompleted(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  return (
    env.code === "REQUEST_COMPLETED" ||
    env.code === "CARD_ALREADY_USED" ||
    env.data?.state === "completed"
  );
}

export function statusLabel(env: BeibeiEnvelope | null): string {
  if (!env) return "";
  if (isCompleted(env)) return "已完成";
  if (isProcessing(env)) return "处理中";
  if (isReady(env)) return "未使用";
  return env.message || "不可用";
}
