"use client";

import { useEffect, useState } from "react";
import { fieldCls, labelCls, mePost } from "@/lib/me";

interface Level {
  id: number;
  name: string;
  price: string | number;
  supplier: number;
  icon?: string;
  cost?: number;
  substation?: number;
  top_domain?: number;
}

export default function ShopPage() {
  const [form, setForm] = useState({
    shop_name: "",
    title: "",
    notice: "",
    service_qq: "",
    service_url: "",
    master_display: "1",
  });
  const [shop, setShop] = useState<{ subdomain?: string; topdomain?: string } | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    mePost("/user/api/personal/dashboard").then((json) => {
      if (json.code !== 200) return;
      const nextShop = json.data.shop;
      if (nextShop) {
        setShop(nextShop);
        setForm({
          shop_name: nextShop.shop_name || "",
          title: nextShop.title || "",
          notice: nextShop.notice || "",
          service_qq: nextShop.service_qq || "",
          service_url: nextShop.service_url || "",
          master_display: String(nextShop.master_display ?? 1),
        });
      }
      setLevels(json.data.levels || []);
      setCurrentLevel(json.data.profile?.business_level?.id ?? 0);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const json = await mePost("/user/api/business/saveConfig", form);
    if (json.code === 200) setMsg(json.msg || "保存成功");
    else setErr(json.msg || "保存失败");
  }

  async function buy(levelId: number) {
    setMsg("");
    setErr("");
    const json = await mePost("/user/api/business/purchase", { levelId });
    if (json.code === 200) {
      setMsg(json.msg || "购买成功");
      location.reload();
    } else setErr(json.msg || "购买失败");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-semibold tracking-tight">我的店铺</h1>
      {msg && <p className="rounded-2xl bg-ok-fill px-4 py-3 text-sm text-ok">{msg}</p>}
      {err && <p className="rounded-2xl bg-danger-fill px-4 py-3 text-sm text-danger">{err}</p>}

      {shop && (
      <form onSubmit={save} className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
        <div>
          <label className={labelCls}>店铺名称</label>
          <input className={fieldCls} value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>网站标题</label>
          <input className={fieldCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>店铺公告</label>
          <textarea className={`${fieldCls} h-28 py-3`} value={form.notice} onChange={(e) => setForm({ ...form, notice: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>客服 QQ</label>
            <input className={fieldCls} value={form.service_qq} onChange={(e) => setForm({ ...form, service_qq: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>客服链接</label>
            <input className={fieldCls} value={form.service_url} onChange={(e) => setForm({ ...form, service_url: e.target.value })} />
          </div>
        </div>
        {(shop.subdomain || shop.topdomain) && (
          <p className="text-xs text-muted">
            已绑域名：{shop.topdomain || shop.subdomain}
          </p>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.master_display === "1"}
            onChange={(e) => setForm({ ...form, master_display: e.target.checked ? "1" : "0" })}
          />
          在主站展示店铺
        </label>
        <button className="btn-graphite rounded-full px-6 py-2.5 text-sm">保存店铺资料</button>
      </form>
      )}

      <section className="rounded-3xl bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold">{shop ? "升级店铺" : "开通店铺"}</h2>
        <p className="mt-1 text-xs text-muted">一次性开通，永久有效。选择套餐即可开通或升级。</p>
        <div className="mt-4 space-y-3">
          {levels.map((lv) => {
            const owned = currentLevel === lv.id;
            return (
            <div key={lv.id} className="flex items-center justify-between rounded-2xl border border-hairline-soft px-4 py-3">
              <div>
                <p className="text-sm font-medium">{lv.name}</p>
                <p className="text-xs text-muted">
                  ¥{lv.price}
                  {lv.supplier === 1 ? " · 供货" : ""}
                  {lv.substation === 1 ? " · 分站" : ""}
                  {lv.top_domain === 1 ? " · 独立域名" : ""}
                  {lv.supplier === 1 && lv.cost != null ? ` · 手续费 ${Number(lv.cost) * 100}%` : ""}
                </p>
              </div>
              {owned ? (
                <span className="text-xs text-ok">当前等级</span>
              ) : (
                <button
                  type="button"
                  onClick={() => buy(lv.id)}
                  className="rounded-full border border-hairline px-4 py-1.5 text-xs font-medium"
                >
                  {shop ? "升级" : "开通"}
                </button>
              )}
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
