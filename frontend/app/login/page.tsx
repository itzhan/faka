"use client";

import { useEffect, useState } from "react";
import AuthShell, { authFieldCls, authLabelCls } from "@/components/AuthShell";

function afterLoginPath(): string {
  const raw = new URLSearchParams(window.location.search).get("goto");
  if (!raw) return "/";
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return "/";
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return "/";
  if (path.startsWith("/user/authentication/login")) return "/";
  if (path.startsWith("/user/")) return "/me";
  if (path.startsWith("/admin")) return "/";
  return path;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaTs, setCaptchaTs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setCaptchaTs(Date.now()), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = new URLSearchParams({ username, password, captcha });
      const res = await fetch("/user/api/authentication/login", {
        method: "POST",
        body,
        credentials: "include",
      });
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.msg || "登录失败");
      window.location.href = afterLoginPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败,请稍后再试");
      setCaptchaTs(Date.now());
      setCaptcha("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Sign In"
      title="欢迎回来"
      subtitle="登录后可查看订单、余额与会员价。"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={authLabelCls}>账号</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名 / 邮箱 / 手机号"
            autoComplete="username"
            required
            className={authFieldCls}
          />
        </div>
        <div>
          <label className={authLabelCls}>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
            className={authFieldCls}
          />
        </div>
        <div>
          <label className={authLabelCls}>人机验证</label>
          <div className="flex gap-2">
            <input
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="图形验证码"
              required
              className={authFieldCls}
            />
            {captchaTs > 0 && (
              <img
                src={`/user/captcha/image?action=login&t=${captchaTs}`}
                alt="验证码"
                title="点击刷新"
                onClick={() => setCaptchaTs(Date.now())}
                className="h-12 w-[108px] shrink-0 cursor-pointer rounded-xl border border-hairline bg-white object-contain"
              />
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-danger-fill px-4 py-3 text-[13px] text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-graphite w-full rounded-full py-3 text-[15px] font-medium disabled:opacity-60"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        还没有账号?{" "}
        <a href="/register" className="font-medium text-accent hover:underline">
          立即注册
        </a>
      </p>
    </AuthShell>
  );
}
