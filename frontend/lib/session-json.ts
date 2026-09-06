export type SessionPreview =
  | { ok: true; email: string; accountId: string; cleaned: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function parseChatGptSession(raw: string): SessionPreview | null {
  const text = raw.trim();
  if (!text) return null;

  const slice = extractJsonObject(text);
  if (!slice) {
    return {
      ok: false,
      error: "这不是完整的 Session JSON。请打开 chatgpt.com/api/auth/session 后全选复制。",
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(slice);
  } catch {
    return { ok: false, error: "JSON 格式无效。请重新复制完整 Session，不要截断。" };
  }

  const obj = asRecord(data);
  if (!obj) {
    return { ok: false, error: "JSON 格式无效。" };
  }

  const user = asRecord(obj.user);
  const account = asRecord(obj.account);
  const email = typeof user?.email === "string" ? user.email.trim() : "";
  const accountId = typeof account?.id === "string" ? account.id.trim() : "";
  const accessToken = typeof obj.accessToken === "string" ? obj.accessToken.trim() : "";
  const sessionToken = typeof obj.sessionToken === "string" ? obj.sessionToken.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "未识别到有效邮箱。请确认复制的是登录后的完整 Session。" };
  }
  if (!accountId) {
    return { ok: false, error: "未识别到账号 ID。请重新登录 ChatGPT 后再复制 Session。" };
  }
  if (!accessToken || accessToken.length < 20) {
    return { ok: false, error: "缺少 accessToken。请复制完整 JSON，不要只复制部分字段。" };
  }
  if (!sessionToken || sessionToken.length < 20) {
    return { ok: false, error: "缺少 sessionToken。请复制完整 JSON，不要只复制部分字段。" };
  }
  if (typeof obj.expires === "string") {
    const exp = Date.parse(obj.expires);
    if (Number.isFinite(exp) && exp <= Date.now()) {
      return { ok: false, error: "Session 已过期。请重新登录 ChatGPT 后再复制。" };
    }
  }

  return { ok: true, email, accountId, cleaned: slice };
}
