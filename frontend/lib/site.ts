// 站点静态配置：文案、外链、FAQ、页脚。占位内容集中在这里,直接改即可。

/** 老站(PHP)地址,查单/登录等未迁移页面暂时跳过去 */
export const LEGACY_BASE =
  process.env.NEXT_PUBLIC_LEGACY_BASE ?? "http://localhost:8081";

export const SITE = {
  name: "TabCode小铺",
  slogan: "AI 订阅,即买即用。",
  subtitle: "主营各类 AI 工具充值与账号",
  promises: ["本店不做无意义价格内卷,", "优先保证渠道稳定与交付质量。"],
};

export const NAV_LINKS = [
  { label: "商城", href: "/" },
  { label: "查单", href: "/query" },
  { label: "售后", href: "/support" },
  { label: "订单", href: "/orders" },
  { label: "我的", href: "/me" },
  // 教程入口暂时从顶栏隐藏，页面仍可访问 /tutorials
];

export const AUTH_LINKS = {
  login: "/login",
  register: "/register",
};

/** 首页售后入口，详情在 /support */
export const COMMUNITY_LINKS = [
  { label: "售后客服", href: "/support", icon: "support" as const },
];

export const HERO_ACTIONS = {
  browse: { label: "查看商品", href: "#products" },
  query: { label: "查询订单", href: "/query" },
  // 代理合作入口暂时隐藏:{ label: "代理合作", href: "#" }
};

/** 购买说明卡的三条 */
export const BUYING_NOTES = [
  {
    title: "实时商品信息",
    desc: "价格、库存和交付方式以当前商品卡和详情页为准。",
  },
  {
    title: "按商品交付",
    desc: "自动发货或人工核发会在商品页标明,付款后回到订单页查看进度。",
  },
  {
    title: "订单可查询",
    desc: "付款确认、处理状态与交付内容都可在订单详情或查单页查看。",
  },
];

export const FAQ_ITEMS = [
  {
    q: "下单后多久发货?",
    a: "标注「自动发货」的商品付款后即时发货;人工核发的商品一般会在商品页标注处理时效。",
  },
  {
    q: "如果库存不足怎么办?",
    a: "商品卡会实时显示库存状态。缺货时可以联系售后客服预订。",
  },
  {
    q: "购买后出现问题怎么办?",
    a: "请先通过「查单」页确认订单状态。仍有问题，携订单号到「售后」页联系客服。",
  },
];

export const FOOTER_DISCLAIMER =
  "本站为独立第三方服务平台,非 OpenAI、Anthropic、谷歌、xAI 官方网站,与相关官方公司无隶属关系。商品库存、价格、使用方式和售后规则以商品详情页为准。";
