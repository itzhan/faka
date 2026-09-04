"use client";

import { useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";

export default function PasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (password !== rePassword) {
      setErr("两次密码输入不一致");
      return;
    }
    const json = await mePost("/user/api/security/password", {
      old_password: oldPassword,
      password,
      re_password: rePassword,
    });
    if (json.code === 200) {
      setMsg(json.msg || "修改成功");
      setOldPassword("");
      setPassword("");
      setRePassword("");
    } else setErr(json.msg || "修改失败");
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">修改密码</h1>
      <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
        {msg && <p className="rounded-2xl bg-ok-fill px-4 py-3 text-sm text-ok">{msg}</p>}
        {err && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{err}</p>}
        <div>
          <label className={labelCls}>旧密码</label>
          <input
            type="password"
            className={fieldCls}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className={labelCls}>新密码</label>
          <input
            type="password"
            className={fieldCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className={labelCls}>确认新密码</label>
          <input
            type="password"
            className={fieldCls}
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <p className="text-xs text-muted">密码至少 6 位。修改成功后请使用新密码登录。</p>
        <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">保存修改</button>
      </form>
    </div>
  );
}
