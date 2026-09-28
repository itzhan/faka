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
  code?: string;
  amount?: number | string;
  currency?: string;
  submitted_at?: string;
  created_at?: string;
  recharged_at?: string;
  started_at?: string;
  account?: string;
}

export interface BeibeiData {
  state?: string;
  product_type?: string;
  plan?: string;
  credential_options?: BeibeiCredentialOption[];
  completed_at?: string | null;
  retry_after_seconds?: number | null;
  receipt?: BeibeiReceipt;
  code?: string;
  amount?: number | string;
  currency?: string;
  submitted_at?: string;
  created_at?: string;
  email?: string;
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
  let json: Omit<BeibeiEnvelope, "http" | "retry_after"> & {
    error?: string;
    error_code?: string;
  };
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
  const code =
    json.code ||
    json.error_code ||
    json.error ||
    (res.ok || res.status === 202 ? "OK" : "SERVICE_UNAVAILABLE");
  return {
    ...json,
    success: Boolean(json.success),
    code,
    message: json.message || "请求失败",
    data: json.data ?? null,
    request_id: json.request_id ?? null,
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
  if (
    env.code === "REQUEST_COMPLETED" ||
    env.code === "CARD_ALREADY_USED" ||
    env.code === "CARD_ALREADY_SUBMITTED" ||
    env.data?.state === "completed"
  ) {
    return true;
  }
  return /卡密已(完成|核销|兑换|使用)|已完成充值/.test(env.message || "");
}

export function isTransient(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  return env.code === "SERVICE_UNAVAILABLE" || env.code === "RATE_LIMIT_EXCEEDED";
}

export function isFailed(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  if (isCompleted(env) || isProcessing(env) || isReady(env) || isTransient(env)) {
    return false;
  }
  return !env.success;
}

export function shouldKeepPolling(env: BeibeiEnvelope | null | undefined): boolean {
  if (!env) return false;
  return isProcessing(env) || isTransient(env);
}

export function envelopeRequestId(env: BeibeiEnvelope | null | undefined): string | null {
  if (!env) return null;
  const direct = typeof env.request_id === "string" ? env.request_id.trim() : "";
  if (direct) return direct;
  const rec = asRecord(env.data);
  const nested = rec?.request_id;
  if (typeof nested === "string" && nested.trim()) return nested.trim();
  return null;
}

export async function followExisting(env: BeibeiEnvelope): Promise<BeibeiEnvelope> {
  const id = envelopeRequestId(env);
  if (!id || isReady(env)) return env;
  try {
    const q = await getRequest(id);
    if (q.code === "REQUEST_NOT_FOUND") return env;
    if (isTransient(q) && (isCompleted(env) || isProcessing(env))) {
      return { ...env, request_id: id };
    }
    if (isFailed(q) && isCompleted(env)) return env;
    return {
      ...q,
      request_id: envelopeRequestId(q) || id,
    };
  } catch {
    return env;
  }
}

export function statusLabel(env: BeibeiEnvelope | null): string {
  if (!env) return "";
  if (isCompleted(env)) return "已完成";
  if (env.code === "REQUEST_OUTCOME_UNKNOWN") return "确认结果中";
  if (isProcessing(env)) return "处理中";
  if (isReady(env)) return "未使用";
  if (isFailed(env)) return "失败";
  return env.message || "不可用";
}

export function statusTitle(env: BeibeiEnvelope | null): string {
  if (!env) return "";
  if (isCompleted(env)) return "充值成功";
  if (isFailed(env)) return "充值失败";
  if (env.code === "REQUEST_OUTCOME_UNKNOWN") return "正在确认结果";
  if (env.code === "SERVICE_UNAVAILABLE" || env.code === "RATE_LIMIT_EXCEEDED") {
    return "正在查询进度";
  }
  if (env.code === "REQUEST_ACCEPTED") return "请求已受理";
  if (isProcessing(env)) return "充值处理中";
  return env.message || "处理中";
}

export function statusDetail(env: BeibeiEnvelope | null): string {
  if (!env) return "";
  if (isCompleted(env)) return "充值已经完成";
  if (isFailed(env)) return env.message || "充值失败";
  if (env.code === "REQUEST_OUTCOME_UNKNOWN") {
    return "系统正在核对充值结果，请保持页面打开，不要重复提交。";
  }
  if (env.code === "SERVICE_UNAVAILABLE" || env.code === "RATE_LIMIT_EXCEEDED") {
    return "正在查询该卡密的充值记录，请稍候，不要重复提交。";
  }
  if (env.code === "REQUEST_ACCEPTED") {
    return "充值请求已进入队列，正在处理。";
  }
  if (isProcessing(env)) {
    return "正在为账号写入会员，完成后会自动更新。";
  }
  return env.message || "";
}

export const PROGRESS_STEPS = ["已受理", "正在充值", "确认结果", "充值完成"] as const;

export function progressStepIndex(env: BeibeiEnvelope | null | undefined): number {
  if (!env) return 0;
  if (isCompleted(env) || isFailed(env)) return 3;
  if (env.code === "REQUEST_OUTCOME_UNKNOWN" || isTransient(env)) return 2;
  if (isProcessing(env)) return 1;
  return 0;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  if (typeof v === "string" && v.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(v);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function pickText(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function flattenFields(
  obj: unknown,
  out: Record<string, unknown> = {},
  override = false
): Record<string, unknown> {
  const rec = asRecord(obj);
  if (!rec) return out;
  for (const [k, v] of Object.entries(rec)) {
    if (override || out[k] == null || out[k] === "") out[k] = v;
    if (asRecord(v)) flattenFields(v, out, override);
  }
  return out;
}

function field(flat: Record<string, unknown>, names: string[]): unknown {
  const want = new Set(names.map((n) => n.toLowerCase()));
  for (const [k, v] of Object.entries(flat)) {
    if (want.has(k.toLowerCase()) && v != null && v !== "") return v;
  }
  return undefined;
}

export function mergeEnvelope(
  prev: BeibeiEnvelope | null | undefined,
  next: BeibeiEnvelope
): BeibeiEnvelope {
  if (!prev) return next;
  const prevData = asRecord(prev.data) ?? {};
  const nextData = asRecord(next.data) ?? {};
  const receipt = {
    ...(asRecord(prevData.receipt) ?? {}),
    ...(asRecord(nextData.receipt) ?? {}),
  };
  const data = {
    ...prevData,
    ...nextData,
    ...(Object.keys(receipt).length ? { receipt } : {}),
  };
  return {
    ...prev,
    ...next,
    request_id: next.request_id || prev.request_id,
    data: data as BeibeiData,
  };
}

export function hasPublicReceipt(env: BeibeiEnvelope | null | undefined): boolean {
  const r = asRecord(env?.data?.receipt);
  if (!r) return false;
  return Boolean(
    pickText(r.email, r.account, r.amount, r.submitted_at, r.created_at, r.recharged_at)
  );
}

export function formatBeibeiTime(value?: string | number | null): string {
  if (value == null || value === "") return "-";
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(/\s+/g, " ");
}

export function formatElapsed(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0) return `${m} 分 ${s} 秒`;
  return `${s} 秒`;
}

export interface ReceiptView {
  code: string;
  account: string;
  plan: string;
  amount: string;
  submittedAt: string;
  completedAt: string;
}

export function receiptView(
  env: BeibeiEnvelope | null | undefined,
  fallbackCode: string,
  hints?: { account?: string; submittedAt?: string | number | null }
): ReceiptView {
  const data = env?.data;
  const flat = flattenFields(data);
  flattenFields(data?.receipt, flat, true);

  const accountRaw = field(flat, [
    "email",
    "account_email",
    "user_email",
    "chatgpt_email",
    "account",
  ]);
  const account =
    (typeof accountRaw === "string" && accountRaw.includes("@")
      ? accountRaw.trim()
      : pickText(accountRaw)) ||
    hints?.account ||
    "-";

  let amountRaw = field(flat, [
    "amount",
    "php_amount",
    "amount_php",
    "paid_amount",
    "paid_php",
    "face_value",
    "price",
    "cost",
    "total",
    "amount_display",
  ]);
  let currency = pickText(field(flat, ["currency", "currency_code", "ccy"]));
  const amountObj = asRecord(amountRaw);
  if (amountObj) {
    amountRaw = amountObj.amount ?? amountObj.value ?? amountObj.total ?? amountObj.php;
    currency = pickText(currency, amountObj.currency, amountObj.currency_code);
  }
  let amount = "-";
  if (typeof amountRaw === "number" && Number.isFinite(amountRaw)) {
    amount = currency ? `${amountRaw} ${currency}` : String(amountRaw);
  } else if (typeof amountRaw === "string" && amountRaw.trim() && !amountRaw.includes("@")) {
    amount =
      currency && !amountRaw.includes(currency)
        ? `${amountRaw.trim()} ${currency}`
        : amountRaw.trim();
  }

  const submittedRaw =
    field(flat, [
      "submitted_at",
      "created_at",
      "started_at",
      "recharged_at",
      "recharge_time",
      "paid_at",
      "createdAt",
      "submittedAt",
    ]) ?? hints?.submittedAt ?? null;

  return {
    code: pickText(field(flat, ["card_code", "cardKey", "card_key", "cdkey"]), fallbackCode) || "-",
    account,
    plan: pickText(field(flat, ["plan", "product_plan", "sku"])) || "-",
    amount,
    submittedAt: formatBeibeiTime(
      typeof submittedRaw === "number" || typeof submittedRaw === "string"
        ? submittedRaw
        : null
    ),
    completedAt: formatBeibeiTime(
      pickText(
        field(flat, ["completed_at", "finished_at", "completed_time", "completedAt"])
      ) || null
    ),
  };
}
