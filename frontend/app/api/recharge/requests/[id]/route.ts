import { jsonError } from "@/lib/recharge/http";
import {
  resolveProvider,
  splitRequestId,
  withProviderRequestId,
} from "@/lib/recharge/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = (id ?? "").trim();
  if (!requestId) {
    return Response.json(
      { success: false, code: "INVALID_REQUEST", message: "缺少请求标识", data: null },
      { status: 400 }
    );
  }
  const parts = splitRequestId(requestId);
  if (!parts) {
    return jsonError(404, "REQUEST_NOT_FOUND", "未找到该充值请求");
  }
  const resolved = await resolveProvider({ id: parts.providerId });
  if (!resolved.ok) return resolved.res;
  const { provider, driver } = resolved;
  return withProviderRequestId(
    await driver.request(provider, parts.upstreamId),
    provider.id
  );
}
