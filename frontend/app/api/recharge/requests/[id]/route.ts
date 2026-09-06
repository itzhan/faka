import { proxyBeibei } from "@/lib/beibei-server";

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
  return proxyBeibei(`/api/v1/recharge/requests/${encodeURIComponent(requestId)}`, {
    method: "GET",
  });
}
