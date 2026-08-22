"use client";

// 商品详情右栏:标题/徽章/动态价格 + 完整下单面板。
// 结构对齐老站 Nagoya Item.html,接口同 assets/user/controller/index/item.js:
//   valuation(实时算价) / stock(实时库存) / pay(支付方式) / order/trade(下单)
import { useCallback, useEffect, useRef, useState } from "react";
import type { CommodityDetail } from "@/lib/detail";

interface PayMethod {
  id: number;
  name: string;
  icon: string;
  handle: string;
}

interface TradeResult {
  tradeNo: string;
  secret?: string;
  leave_message?: string;
}

const CONTACT_LABEL: Record<number, string> = {
  0: "联系方式",
  1: "手机号",
  2: "邮箱地址",
  3: "QQ号",
};

function formatPrice(value: number | string): string {
  const n = Number(value);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

async function postForm(url: string, data: Record<string, string>) {
  const body = new URLSearchParams(data);
  const res = await fetch(url, { method: "POST", body });
  return res.json();
}

export default function OrderPanel({ detail }: { detail: CommodityDetail }) {
  const config = Array.isArray(detail.config) ? {} : detail.config;
  const races = config.category ?? null;
  const skuGroups = config.sku ?? null;

  const [race, setRace] = useState(races ? Object.keys(races)[0] : "");
  const [sku, setSku] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (skuGroups)
      for (const [g, opts] of Object.entries(skuGroups))
        init[g] = Object.keys(opts)[0];
    return init;
  });
  const [num, setNum] = useState(detail.minimum > 0 ? detail.minimum : 1);
  const [contact, setContact] = useState("");
  const [coupon, setCoupon] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaTs, setCaptchaTs] = useState(0);
  const [widgetValues, setWidgetValues] = useState<Record<string, string>>({});

  const [price, setPrice] = useState<string | null>(null);
  const [stock, setStock] = useState(detail.stock);
  const [pays, setPays] = useState<PayMethod[]>([]);
  const [payId, setPayId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TradeResult | null>(null);
  const [shared, setShared] = useState(false);
  const captchaMounted = useRef(false);

  const buildPost = useCallback(() => {
    const post: Record<string, string> = {
      item_id: String(detail.id),
      num: String(num),
    };
    if (race) post["race"] = race;
    for (const [g, v] of Object.entries(sku)) post[`sku[${g}]`] = v;
    if (contact) post["contact"] = contact;
    if (coupon) post["coupon"] = coupon;
    if (password) post["password"] = password;
    if (captcha) post["captcha"] = captcha;
    for (const [k, v] of Object.entries(widgetValues)) if (v) post[k] = v;
    return post;
  }, [detail.id, num, race, sku, contact, coupon, password, captcha, widgetValues]);

  // 实时算价 + 库存
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [val, stk] = await Promise.all([
          postForm("/user/api/index/valuation", buildPost()),
          postForm("/user/api/index/stock", buildPost()),
        ]);
        if (cancelled) return;
        if (val.code === 200) setPrice(val.data.price);
        if (stk.code === 200) setStock(Number(stk.data.stock));
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
    // 仅规格/数量/优惠券变化时重新估价
  }, [detail.id, num, race, sku, coupon]); // eslint-disable-line react-hooks/exhaustive-deps

  // 支付方式
  useEffect(() => {
    postForm(`/user/api/index/pay?itemId=${detail.id}`, {}).then((res) => {
      if (res.code === 200) {
        setPays(res.data);
        if (res.data.length > 0) setPayId(res.data[0].id);
      }
    });
  }, [detail.id]);

  useEffect(() => {
    captchaMounted.current = true;
    setCaptchaTs(Date.now());
  }, []);

  async function submit() {
    setError("");
    if (!detail.login && !contact.trim()) {
      setError(`请填写${CONTACT_LABEL[detail.contact_type] ?? "联系方式"}`);
      return;
    }
    if (detail.trade_captcha === 1 && !captcha.trim()) {
      setError("请输入图形验证码");
      return;
    }
    if (payId === null) {
      setError("暂无可用支付方式");
      return;
    }
    setSubmitting(true);
    try {
      const post = buildPost();
      post["pay_id"] = String(payId);
      const res = await postForm("/user/api/order/trade", post);
      if (res.code !== 200) throw new Error(res.msg || "下单失败");
      if (!res.data.url) {
        // 余额支付 / 0 元单:直接出卡密
        setResult(res.data);
      } else {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "下单失败,请稍后再试");
      setCaptchaTs(Date.now());
      setCaptcha("");
    } finally {
      setSubmitting(false);
    }
  }

  function share() {
    navigator.clipboard.writeText(detail.share_url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    });
  }

  const soldOut = stock <= 0;
  const fieldCls =
    "h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-[14px] outline-none transition-shadow placeholder:text-[#a1a1a6] focus:border-black/20 focus:shadow-[0_0_0_4px_rgba(13,116,206,0.08)]";
  const labelCls = "mb-1.5 block text-[13px] font-medium text-[#424245]";

  // 下单成功(无收银台跳转)结果卡
  if (result) {
    return (
      <div className="flex h-full flex-col justify-center">
        <div className="rounded-2xl bg-[#18794e]/8 p-6">
          <p className="text-[15px] font-semibold text-[#18794e]">✓ 购买成功</p>
          <p className="font-pixel mt-2 text-[13px] text-[#424245]">
            {result.tradeNo}
          </p>
          {result.secret && (
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-white p-4 font-mono text-[13px] leading-relaxed">
              {result.secret}
            </pre>
          )}
          {result.leave_message && (
            <p className="mt-3 text-xs leading-relaxed text-[#86868b]">
              {result.leave_message}
            </p>
          )}
          <a
            href="/query"
            className="btn-graphite mt-5 inline-block rounded-full px-6 py-2 text-sm"
          >
            前往查单页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-[24px] font-semibold leading-snug tracking-tight">
        {detail.name}
      </h1>

      {/* 徽章排:发货方式 / 已售 / 库存 / 分享(对齐老站) */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-medium">
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 ${
            detail.delivery_way === 0
              ? "bg-[#18794e]/10 text-[#18794e]"
              : "bg-[#0d74ce]/10 text-[#0d74ce]"
          }`}
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
            <path d="M9.5 0L2 9h4.5L6 16l7.5-9H9z" />
          </svg>
          {detail.delivery_way === 0 ? "自动发货" : "在线发货"}
        </span>
        <span className="rounded-full bg-black/5 px-3 py-1 text-[#424245]">
          已售 {detail.order_sold}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${
            soldOut
              ? "bg-black/5 text-[#86868b]"
              : "bg-[#18794e]/10 text-[#18794e]"
          }`}
        >
          库存 {detail.inventory_hidden ? "充足" : stock}
        </span>
        <button
          onClick={share}
          className="rounded-full border border-black/10 px-3 py-1 text-[#424245] transition-colors hover:bg-black/5"
        >
          {shared ? "已复制链接 ✓" : "分享"}
        </button>
      </div>

      {/* 动态价格 */}
      <p className="text-gradient-price font-pixel mt-5 text-[36px] font-semibold leading-none tracking-tight">
        <span className="mr-1 text-lg font-medium">¥</span>
        {price !== null ? formatPrice(price) : formatPrice(detail.user_price)}
      </p>

      <div className="mt-6 space-y-4">
        {/* 宝贝类型(race) */}
        {races && (
          <div>
            <label className={labelCls}>宝贝类型</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(races).map(([name, p]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setRace(name)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                    race === name
                      ? "bg-[#1d1d1f] text-white"
                      : "border border-black/10 bg-white text-[#424245] hover:border-black/25"
                  }`}
                >
                  {name}
                  <span className="ml-1 opacity-70">¥{formatPrice(p)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SKU 组 */}
        {skuGroups &&
          Object.entries(skuGroups).map(([group, opts]) => (
            <div key={group}>
              <label className={labelCls}>{group}</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(opts).map(([opt, add]) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSku((s) => ({ ...s, [group]: opt }))}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                      sku[group] === opt
                        ? "bg-[#1d1d1f] text-white"
                        : "border border-black/10 bg-white text-[#424245] hover:border-black/25"
                    }`}
                  >
                    {opt}
                    {Number(add) > 0 && (
                      <span className="ml-1 opacity-70">+¥{formatPrice(add)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

        {/* 游客联系方式 */}
        {!detail.login && (
          <div>
            <label className={labelCls}>
              {CONTACT_LABEL[detail.contact_type] ?? "联系方式"}
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={`请输入您的${CONTACT_LABEL[detail.contact_type] ?? "联系方式"}`}
              className={fieldCls}
            />
          </div>
        )}

        {/* 优惠券 */}
        {detail.coupon === 1 && (
          <div>
            <label className={labelCls}>优惠券</label>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="优惠券代码,没有则不填"
              className={fieldCls}
            />
          </div>
        )}

        {/* 自定义控件 */}
        {(detail.widget ?? []).map((w) => (
          <div key={w.name}>
            <label className={labelCls}>{w.title ?? w.label ?? w.name}</label>
            <input
              value={widgetValues[w.name] ?? ""}
              onChange={(e) =>
                setWidgetValues((v) => ({ ...v, [w.name]: e.target.value }))
              }
              className={fieldCls}
            />
          </div>
        ))}

        {/* 查询密码 */}
        {detail.password_status === 1 && (
          <div>
            <label className={labelCls}>查询密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置查询订单的密码"
              className={fieldCls}
            />
          </div>
        )}

        {/* 购买数量 */}
        <div>
          <label className={labelCls}>购买数量</label>
          <div className="flex h-11 w-40 items-stretch overflow-hidden rounded-xl border border-black/10 bg-white">
            <button
              type="button"
              onClick={() => setNum((n) => Math.max(detail.minimum > 0 ? detail.minimum : 1, n - 1))}
              className="w-11 text-lg text-[#424245] transition-colors hover:bg-black/5"
            >
              −
            </button>
            <input
              type="number"
              value={num}
              onChange={(e) => setNum(Math.max(1, Number(e.target.value) || 1))}
              className="w-full border-x border-black/10 text-center text-[14px] outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setNum((n) =>
                  detail.maximum > 0 ? Math.min(detail.maximum, n + 1) : n + 1
                )
              }
              className="w-11 text-lg text-[#424245] transition-colors hover:bg-black/5"
            >
              +
            </button>
          </div>
        </div>

        {/* 人机验证 */}
        {detail.trade_captcha === 1 && (
          <div>
            <label className={labelCls}>人机验证</label>
            <div className="flex gap-2">
              <input
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder="图形验证码"
                className={fieldCls}
              />
              {captchaTs > 0 && (
                <img
                  src={`/user/captcha/image?action=trade&t=${captchaTs}`}
                  alt="验证码"
                  title="点击刷新"
                  onClick={() => setCaptchaTs(Date.now())}
                  className="h-11 cursor-pointer rounded-xl border border-black/10"
                />
              )}
            </div>
          </div>
        )}

        {/* 支付方式 */}
        {pays.length > 0 && (
          <div>
            <label className={labelCls}>付款方式</label>
            <div className="flex flex-wrap gap-2">
              {pays.map((pay) => (
                <button
                  key={pay.id}
                  type="button"
                  onClick={() => setPayId(pay.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${
                    payId === pay.id
                      ? "bg-[#1d1d1f] text-white"
                      : "border border-black/10 bg-white text-[#424245] hover:border-black/25"
                  }`}
                >
                  <img src={pay.icon} alt="" className="h-5 w-5 rounded" />
                  {pay.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-[#ce2c31]/8 px-4 py-3 text-[13px] text-[#ce2c31]">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={soldOut || submitting}
          className={`w-full rounded-full py-3 text-[15px] font-medium ${
            soldOut
              ? "pointer-events-none bg-[#e8e8ed] text-[#86868b]"
              : "btn-graphite disabled:opacity-60"
          }`}
        >
          {soldOut ? "已售罄" : submitting ? "正在下单…" : "立即购买"}
        </button>
      </div>
    </div>
  );
}
