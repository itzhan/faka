import { readJsonBody } from "@/lib/recharge/http";
import { resolveProvider, withProviderRequestId } from "@/lib/recharge/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await readJsonBody(req);
  if (!parsed.ok) return parsed.res;
  const code = typeof parsed.body.code === "string" ? parsed.body.code.trim() : "";
  if (!code) {
    return Response.json(
      { success: false, code: "INVALID_REQUEST", message: "请输入卡密", data: null },
      { status: 400 }
    );
  }
  const resolved = await resolveProvider({ code });
  if (!resolved.ok) return resolved.res;
  const { provider, driver } = resolved;
  return withProviderRequestId(await driver.check(provider, code), provider.id);
}
