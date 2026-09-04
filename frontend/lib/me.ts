export async function mePost(
  path: string,
  body: Record<string, string | number | undefined> = {}
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const res = await fetch(path, {
    method: "POST",
    body: params,
    credentials: "include",
    cache: "no-store",
  });
  return res.json();
}

export async function meUpload(path: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(path, {
    method: "POST",
    body,
    credentials: "include",
    cache: "no-store",
  });
  return res.json();
}

export const fieldCls =
  "h-11 w-full rounded-xl border border-hairline bg-surface px-4 text-[16px] outline-none placeholder:text-faint focus:border-hairline-strong focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)] sm:text-[14px]";

export const labelCls = "mb-1.5 block text-[13px] font-medium text-subtle";
