"use client";

import { useEffect, useState } from "react";
import AuthShell, { authFieldCls, authLabelCls } from "@/components/AuthShell";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaTs, setCaptchaTs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => setCaptchaTs(Date.now()), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      const body = new URLSearchParams({ username, password, captcha });
      const res = await fetch("/user/api/authentication/register", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.msg || "注册失败");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败,请稍后再试");
      setCaptchaTs(Date.now());
      setCaptcha("");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="Welcome"
        title="注册成功"
        subtitle="账号已创建,现在就去登录吧。"
      >
        <a
          href="/login"
          className="btn-graphite block w-full rounded-full py-3 text-center text-[15px] font-medium"
        >
          前往登录
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="创建账号"
      subtitle="注册后享受会员价与完整的订单管理。"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={authLabelCls}>用户名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="设置用户名(仅字母与数字)"
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
            placeholder="设置登录密码"
            autoComplete="new-password"
            required
            className={authFieldCls}
          />
        </div>
        <div>
          <label className={authLabelCls}>确认密码</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再次输入密码"
            autoComplete="new-password"
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
                src={`/user/captcha/image?action=register&t=${captchaTs}`}
                alt="验证码"
                title="点击刷新"
                onClick={() => setCaptchaTs(Date.now())}
                className="h-12 cursor-pointer rounded-xl border border-black/10"
              />
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-[#ce2c31]/8 px-4 py-3 text-[13px] text-[#ce2c31]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-graphite w-full rounded-full py-3 text-[15px] font-medium disabled:opacity-60"
        >
          {loading ? "注册中…" : "创建账号"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#86868b]">
        已有账号?{" "}
        <a href="/login" className="font-medium text-[#0d74ce] hover:underline">
          直接登录
        </a>
      </p>
    </AuthShell>
  );
}
