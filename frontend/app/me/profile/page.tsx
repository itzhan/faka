"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost, meUpload } from "@/lib/me";
import { useUser } from "@/lib/useUser";

type Tab = "info" | "edit" | "email" | "phone";

export default function ProfilePage() {
  const session = useUser();
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState({
    nicename: "",
    qq: "",
    alipay: "",
    wallet_address: "",
    settlement: "0",
    avatar: "",
    wechat: "",
  });
  const [appKey, setAppKey] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [emailCaptcha, setEmailCaptcha] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailTs, setEmailTs] = useState(0);

  const [phone, setPhone] = useState("");
  const [phoneCaptcha, setPhoneCaptcha] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneTs, setPhoneTs] = useState(0);

  useEffect(() => {
    if (!session) return;
    setForm({
      nicename: session.nicename || "",
      qq: session.qq || "",
      alipay: session.alipay || "",
      wallet_address: session.wallet_address || "",
      settlement: String(session.settlement ?? 0),
      avatar: session.avatar || "",
      wechat: "",
    });
    setAppKey(session.app_key || "");
  }, [session]);

  if (session === undefined) return <div className="h-48 animate-pulse rounded-3xl bg-surface" />;
  if (!session) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const json = await mePost("/user/api/security/personal", form);
    if (json.code === 200) setMsg(json.msg || "修改成功");
    else setErr(json.msg || "保存失败");
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    const json = await meUpload("/user/api/upload/send?mime=image", file);
    if (json.code === 200) setForm((f) => ({ ...f, avatar: json.data.url }));
    else setErr(json.msg || "头像上传失败");
  }

  async function uploadWechat(file?: File) {
    if (!file) return;
    const json = await meUpload("/user/api/upload/send?mime=image", file);
    if (json.code === 200) setForm((f) => ({ ...f, wechat: json.data.url }));
    else setErr(json.msg || "二维码上传失败");
  }

  async function resetKey() {
    if (!confirm("重置商户密钥后，已接入的接口需要同步更新。继续？")) return;
    const json = await mePost("/user/api/security/resetKey");
    if (json.code === 200) {
      setAppKey(json.data.app_key);
      setMsg("密钥已重置");
    } else setErr(json.msg || "重置失败");
  }

  async function sendEmail() {
    setErr("");
    const json = await mePost("/user/api/security/emailBindNew", { email, captcha: emailCaptcha });
    if (json.code === 200) setMsg(json.msg || "验证码已发送");
    else {
      setErr(json.msg || "发送失败");
      setEmailTs(Date.now());
    }
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    const json = await mePost("/user/api/security/email", { email, email_captcha: emailCode });
    if (json.code === 200) {
      setMsg("邮箱已更新");
      location.reload();
    } else setErr(json.msg || "保存失败");
  }

  async function sendPhone() {
    setErr("");
    const json = await mePost("/user/api/security/phoneBindNew", { phone, captcha: phoneCaptcha });
    if (json.code === 200) setMsg(json.msg || "验证码已发送");
    else {
      setErr(json.msg || "发送失败");
      setPhoneTs(Date.now());
    }
  }

  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    const json = await mePost("/user/api/security/phone", { phone, phone_captcha: phoneCode });
    if (json.code === 200) {
      setMsg("手机已更新");
      location.reload();
    } else setErr(json.msg || "保存失败");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "info", label: "账户信息" },
    { id: "edit", label: "修改资料" },
    { id: "email", label: "邮箱" },
    { id: "phone", label: "手机" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-semibold tracking-tight">个人资料</h1>
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setMsg("");
              setErr("");
              if (item.id === "email") setEmailTs(Date.now());
              if (item.id === "phone") setPhoneTs(Date.now());
            }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${tab === item.id ? "bg-ink text-on-ink" : "border border-hairline bg-surface"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {msg && <p className="rounded-2xl bg-ok-fill px-4 py-3 text-sm text-ok">{msg}</p>}
      {err && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{err}</p>}

      {tab === "info" && (
        <div className="rounded-3xl bg-surface p-5 text-sm">
          {[
            ["用户名", session.username],
            ["商户 ID", String(session.id)],
            ["登录 IP", session.login_ip || "-"],
            ["登录时间", session.login_time || "-"],
            ["上次登录 IP", session.last_login_ip || "-"],
            ["上次登录时间", session.last_login_time || "-"],
            ["注册时间", session.create_time || "-"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-hairline-soft py-3 last:border-0">
              <span className="text-muted">{k}</span>
              <span className="text-right">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-muted">商户密钥</span>
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-pixel truncate text-xs">{appKey || "—"}</span>
              <button type="button" onClick={() => void resetKey()} className="text-xs text-accent">
                重置
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "edit" && (
        <form onSubmit={save} className="space-y-4 rounded-3xl bg-surface p-5">
          <div>
            <label className={labelCls}>头像</label>
            <div className="flex items-center gap-3">
              {form.avatar ? (
                <img src={form.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-on-ink">
                  {(session.username[0] || "?").toUpperCase()}
                </span>
              )}
              <input type="file" accept="image/*" onChange={(e) => void uploadAvatar(e.target.files?.[0])} />
            </div>
          </div>
          <div>
            <label className={labelCls}>真实姓名（提现）</label>
            <input className={fieldCls} value={form.nicename} onChange={(e) => setForm({ ...form, nicename: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>QQ 号</label>
            <input className={fieldCls} value={form.qq} onChange={(e) => setForm({ ...form, qq: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>自动结算方式</label>
            <select className={fieldCls} value={form.settlement} onChange={(e) => setForm({ ...form, settlement: e.target.value })}>
              <option value="0">支付宝</option>
              <option value="1">微信</option>
              <option value="3">USDT (TRC20)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>支付宝账号</label>
            <input className={fieldCls} value={form.alipay} onChange={(e) => setForm({ ...form, alipay: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>钱包地址（TRC20）</label>
            <input className={fieldCls} value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>微信收款二维码</label>
            <input type="file" accept="image/*" onChange={(e) => void uploadWechat(e.target.files?.[0])} />
            {form.wechat && <p className="mt-1 text-xs text-ok">已选择新二维码，保存后生效</p>}
            {session.wechat && !form.wechat && <p className="mt-1 text-xs text-muted">已绑定微信收款码</p>}
          </div>
          <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">保存修改</button>
        </form>
      )}

      {tab === "email" && (
        <form onSubmit={saveEmail} className="space-y-4 rounded-3xl bg-surface p-5">
          <div>
            <label className={labelCls}>当前邮箱</label>
            <input className={fieldCls} value={session.email || "未绑定"} disabled />
          </div>
          <div>
            <label className={labelCls}>新邮箱</label>
            <input className={fieldCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>图形验证码</label>
            <div className="flex gap-2">
              <input className={fieldCls} value={emailCaptcha} onChange={(e) => setEmailCaptcha(e.target.value)} />
              {emailTs > 0 && (
                <img
                  src={`/user/captcha/image?action=emailBindNew&t=${emailTs}`}
                  alt="验证码"
                  onClick={() => setEmailTs(Date.now())}
                  className="h-11 w-[108px] cursor-pointer rounded-xl border border-hairline bg-white object-contain"
                />
              )}
            </div>
          </div>
          <div>
            <label className={labelCls}>邮箱验证码</label>
            <div className="flex gap-2">
              <input className={fieldCls} value={emailCode} onChange={(e) => setEmailCode(e.target.value)} required />
              <button type="button" onClick={() => void sendEmail()} className="shrink-0 rounded-full border border-hairline px-4 text-sm">
                发送
              </button>
            </div>
          </div>
          <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">保存邮箱</button>
        </form>
      )}

      {tab === "phone" && (
        <form onSubmit={savePhone} className="space-y-4 rounded-3xl bg-surface p-5">
          <div>
            <label className={labelCls}>当前手机</label>
            <input className={fieldCls} value={session.phone || "未绑定"} disabled />
          </div>
          <div>
            <label className={labelCls}>新手机</label>
            <input className={fieldCls} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>图形验证码</label>
            <div className="flex gap-2">
              <input className={fieldCls} value={phoneCaptcha} onChange={(e) => setPhoneCaptcha(e.target.value)} />
              {phoneTs > 0 && (
                <img
                  src={`/user/captcha/image?action=phoneBindNew&t=${phoneTs}`}
                  alt="验证码"
                  onClick={() => setPhoneTs(Date.now())}
                  className="h-11 w-[108px] cursor-pointer rounded-xl border border-hairline bg-white object-contain"
                />
              )}
            </div>
          </div>
          <div>
            <label className={labelCls}>短信验证码</label>
            <div className="flex gap-2">
              <input className={fieldCls} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} required />
              <button type="button" onClick={() => void sendPhone()} className="shrink-0 rounded-full border border-hairline px-4 text-sm">
                发送
              </button>
            </div>
          </div>
          <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">保存手机</button>
        </form>
      )}
    </div>
  );
}
