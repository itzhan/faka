// 站点静态配置：文案、外链、FAQ、页脚。占位内容集中在这里,直接改即可。

/** 老站(PHP)地址,查单/登录等未迁移页面暂时跳过去 */
export const LEGACY_BASE =
  process.env.NEXT_PUBLIC_LEGACY_BASE ?? "http://localhost:8081";

export const SITE = {
  name: "异次元店铺",
  slogan: "AI 订阅,即买即用。",
  subtitle: "主营各类 AI 工具充值与账号",
  promises: ["本店不做无意义价格内卷,", "优先保证渠道稳定与交付质量。"],
};

export const NAV_LINKS = [
  { label: "商城", href: "/" },
  { label: "查单", href: `${LEGACY_BASE}/user/index/query` },
  { label: "订单", href: `${LEGACY_BASE}/user/personal/purchaseRecord` },
  { label: "教程", href: "#faq" },
];

export const AUTH_LINKS = {
  login: `${LEGACY_BASE}/user/authentication/login`,
  register: `${LEGACY_BASE}/user/authentication/register`,
};

/** 社群按钮(占位链接,上线前替换) */
export const COMMUNITY_LINKS = [
  { label: "电报通知群", href: "https://t.me/", icon: "telegram" as const },
  { label: "电报交流群", href: "https://t.me/", icon: "telegram" as const },
  { label: "QQ 通知群", href: "#", icon: "qq" as const },
];

export const HERO_ACTIONS = {
  browse: { label: "查看商品", href: "#products" },
  query: { label: "查询订单", href: `${LEGACY_BASE}/user/index/query` },
  agent: { label: "代理合作", href: "#" },
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
    a: "商品卡会实时显示库存状态。缺货时可以加入社群关注补货通知,或联系客服预订。",
  },
  {
    q: "购买后出现问题怎么办?",
    a: "请先通过「查单」页确认订单状态,如仍有问题,携订单号联系首页展示的官方客服渠道处理。",
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "商品分类",
    links: [
      { label: "ChatGPT", href: "/#products" },
      { label: "Claude", href: "/#products" },
      { label: "Grok", href: "/#products" },
    ],
  },
  {
    title: "购买指南",
    links: [
      { label: "充值教程", href: "#faq" },
      { label: "自动发货查收说明", href: "#faq" },
      { label: "充值不到账怎么办", href: "#faq" },
    ],
  },
  {
    title: "帮助中心",
    links: [
      { label: "常见问题", href: "#faq" },
      { label: "查单", href: `${LEGACY_BASE}/user/index/query` },
      { label: "订单", href: `${LEGACY_BASE}/user/personal/purchaseRecord` },
      { label: "联系客服", href: "#" },
    ],
  },
  {
    title: "网站信息",
    links: [
      { label: "关于本店", href: "#" },
      { label: "服务条款", href: "#" },
      { label: "隐私政策", href: "#" },
    ],
  },
];

export const FOOTER_DISCLAIMER =
  "本站为独立第三方服务平台,非 OpenAI、Anthropic、谷歌、xAI 官方网站,与相关官方公司无隶属关系。商品库存、价格、使用方式和售后规则以商品详情页为准。";
