export type TutorialCategory =
  | "购买教程"
  | "支付与订单"
  | "售后指南"
  | "产品对比"
  | "使用指南"
  | "模型动态"
  | "账号安全"
  | "网络环境";

export const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  "购买教程",
  "支付与订单",
  "售后指南",
  "产品对比",
  "使用指南",
  "模型动态",
  "账号安全",
  "网络环境",
];

export interface TutorialMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: TutorialCategory;
  tags: string[];
  date: string;
  minutes: number;
  featured?: boolean;
}

export const TUTORIALS: TutorialMeta[] = [
  { slug: "chatgpt-cdk-recharge-guide", title: "ChatGPT 卡密兑换教程：打开充值链接、填写 CDK 与 Session", excerpt: "付款后会收到充值链接和兑换码。打开链接、校验 CDK、粘贴 ChatGPT Session，按页面提示完成开通。", category: "使用指南", tags: ["CDK", "卡密兑换", "ChatGPT Plus"], date: "2026/08/31", minutes: 6, featured: true },
  { slug: "chatgpt-plus-purchase-complete-guide", title: "ChatGPT Plus 购买完整教程：选商品、下单、付款与查收", excerpt: "第一次购买 ChatGPT Plus 不需要反复试单。先确认账号状态和商品说明，再按页面完成下单、付款与查收。", category: "购买教程", tags: ["ChatGPT Plus", "充值"], date: "2026/07/13", minutes: 6, featured: true },
  { slug: "chatgpt-recharge-card-and-payment-guide", title: "ChatGPT 充值完整教程：购买、付款、查单与交付流程", excerpt: "第一次购买不用反复试单。按商品说明完成下单、付款和查单，订单状态与交付内容都能在原订单中找到。", category: "购买教程", tags: ["ChatGPT充值", "购买流程"], date: "2026/07/13", minutes: 7, featured: true },
  { slug: "gpt-5-6-release-and-use-guide", title: "GPT-5.6 正式发布：Sol、Terra、Luna 区别与使用指南", excerpt: "GPT-5.6 已进入公开可用阶段。先理解 Sol、Terra、Luna 的定位，再按任务复杂度和预算选择。", category: "模型动态", tags: ["GPT-5.6", "Sol", "Terra"], date: "2026/07/13", minutes: 8, featured: true },
  { slug: "openai-codex-complete-guide-2026", title: "OpenAI Codex 完整指南：App、Cloud、CLI 与 IDE 怎么选", excerpt: "Codex 不只是补全代码，它可以读取仓库、修改文件、运行测试和推进完整开发任务。", category: "使用指南", tags: ["OpenAI Codex", "CLI"], date: "2026/07/13", minutes: 10, featured: true },
  { slug: "bn", title: "USDT 购买及充值教程", excerpt: "从币安购买 USDT，到按订单指定网络、地址和金额完成转账，避免错链和少付。", category: "购买教程", tags: ["USDT", "币安"], date: "2026/08/13", minutes: 5 },
  { slug: "ai-membership-plan-comparison", title: "AI 会员套餐怎么选：ChatGPT、Claude、Gemini 与 Grok 对比思路", excerpt: "没有一个套餐适合所有人。先看任务类型、使用频率和账号生态，再决定购买哪个 AI 会员。", category: "产品对比", tags: ["ChatGPT", "Claude", "Gemini"], date: "2026/07/13", minutes: 7 },
  { slug: "payment-and-order-status-guide", title: "支付成功但订单没变化怎么办：订单状态与回调排查指南", excerpt: "支付平台显示成功，不代表浏览器页面会在同一秒更新。先查订单状态和交易记录，避免重复付款。", category: "支付与订单", tags: ["支付回调", "支付宝", "USDT"], date: "2026/07/13", minutes: 6 },
  { slug: "auto-delivery-and-order-lookup-guide", title: "自动发货与游客查单教程：订单号和查询密码怎么用", excerpt: "自动发货内容写入订单详情。保存订单号和查询密码，就能在离开支付页面后重新找到订单。", category: "支付与订单", tags: ["自动发货", "游客查单"], date: "2026/07/13", minutes: 5 },
  { slug: "ai-account-security-checklist", title: "AI 会员账号安全清单：密码、验证码与登录环境怎么保护", excerpt: "账号安全的重点不是频繁改密码，而是保护邮箱、验证码、会话令牌和长期登录环境。", category: "账号安全", tags: ["密码", "验证码"], date: "2026/07/13", minutes: 6 },
  { slug: "recharge-not-received-troubleshooting", title: "AI 会员充值不到账排查：从订单状态到账号检查", excerpt: "先判断是订单未确认、交付仍在处理，还是账号页面没有刷新，再决定是否提交售后。", category: "售后指南", tags: ["充值不到账", "订单售后"], date: "2026/07/13", minutes: 6 },
  { slug: "codex-subscription-buying-guide", title: "Codex 使用前怎么选订阅：购买、登录与安全注意事项", excerpt: "先确认自己的开发需求、账号归属和长期使用方式，再选择适合 Codex 使用场景的商品。", category: "购买教程", tags: ["Codex", "开发工具"], date: "2026/07/13", minutes: 6 },
  { slug: "chatgpt-recharge-self-help-center", title: "ChatGPT 充值自助排查：支付、到账、账号与网络问题", excerpt: "先判断问题发生在付款、商城订单还是 ChatGPT 账号，再按顺序处理，通常比重复下单更快。", category: "售后指南", tags: ["充值排查", "到账延迟"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-recharge-faq-2026", title: "ChatGPT 充值常见问题 FAQ：购买、支付、账号与售后", excerpt: "从下单前选择到付款后查收，一篇回答 ChatGPT 充值最常遇到的问题。", category: "购买教程", tags: ["FAQ", "Plus充值"], date: "2026/07/13", minutes: 8 },
  { slug: "gpt-5-6-plus-pro-renewal-guide", title: "GPT-5.6 如何体验：Plus/Pro 升级、续费与看不到模型排查", excerpt: "看不到 GPT-5.6 不一定是充值失败，分批开放、客户端缓存和账号计划都可能影响模型列表。", category: "使用指南", tags: ["GPT-5.6", "Plus升级"], date: "2026/07/13", minutes: 6 },
  { slug: "chatgpt-payment-not-approved-solutions", title: "ChatGPT 付款未获批准怎么办：支付失败原因与解决顺序", excerpt: "支付被拒后连续重试通常没有帮助。先停止尝试，再检查卡片、账单信息、网络和账号状态。", category: "支付与订单", tags: ["付款未获批准", "支付失败"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-pro-subscription-guide-2026", title: "ChatGPT Pro 订阅指南：国内购买、适用人群与安全事项", excerpt: "Pro 更适合真正受到额度和复杂任务限制的高频用户，普通体验用户应先评估需求。", category: "购买教程", tags: ["ChatGPT Pro", "国内购买"], date: "2026/07/13", minutes: 7 },
  { slug: "chatgpt-plus-pro-selection-guide-2026", title: "2026 ChatGPT Plus/Pro 怎么选：国内充值方式与避坑指南", excerpt: "先按任务量选套餐，再按账号控制权和售后选择交付方式，不要只比较最低价格。", category: "产品对比", tags: ["ChatGPT Plus", "ChatGPT Pro"], date: "2026/07/13", minutes: 10 },
  { slug: "chatgpt-recharge-delay-handling", title: "ChatGPT 充值到账延迟怎么办：20–60 分钟处理建议", excerpt: "商城已付款不等于目标平台会同一秒刷新。先确认账号与官方状态，再决定是否需要售后。", category: "售后指南", tags: ["到账延迟", "ChatGPT Plus"], date: "2026/07/13", minutes: 5 },
  { slug: "gpt-5-5-capabilities-and-upgrade-guide", title: "GPT-5.5 能力与使用指南：适用任务、订阅和 Codex", excerpt: "GPT-5.5 更强调端到端知识工作和 Agent 任务，选择时应看任务闭环能力，而不只是单轮问答。", category: "模型动态", tags: ["GPT-5.5", "Agent"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-registration-guide-2026", title: "2026 ChatGPT 注册教程：邮箱注册、登录与常见错误排查", excerpt: "注册流程本身不复杂，关键是使用长期可控的邮箱、稳定网络和真实可恢复的登录方式。", category: "账号安全", tags: ["ChatGPT注册", "邮箱注册"], date: "2026/07/13", minutes: 7 },
  { slug: "gpt-image-2-use-guide", title: "GPT Image 2 使用指南：生图、文字、UI 与局部编辑", excerpt: "图像模型的价值不只在第一次生成，更在于能否通过局部修改持续把结果做对。", category: "使用指南", tags: ["GPT Image 2", "AI生图"], date: "2026/07/13", minutes: 9 },
  { slug: "gpt-5-4-use-guide", title: "GPT-5.4 使用指南：专业工作、Agent 与 Codex 场景", excerpt: "GPT-5.4 更适合复杂专业任务和工具工作流，使用时要给出范围、验证方法和完成标准。", category: "模型动态", tags: ["GPT-5.4", "Codex"], date: "2026/07/13", minutes: 7 },
  { slug: "chatgpt-degradation-detection-guide", title: "ChatGPT 回答变差怎么办：模型、额度与账号状态检测", excerpt: "一次回答不好不能证明账号被“降智”，需要在相同模型、相同提示和相同设置下重复比较。", category: "账号安全", tags: ["ChatGPT降智", "模型检测"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-degradation-complete-handbook", title: "ChatGPT 回答质量下降完整排查：从提示词到网络环境", excerpt: "先把可变因素逐项固定，再判断是任务写法、产品限制还是账号和服务异常。", category: "使用指南", tags: ["回答质量", "ChatGPT排查"], date: "2026/07/13", minutes: 10 },
  { slug: "chatgpt-ip-quality-check-guide", title: "ChatGPT 网络环境检测：IP 类型、风险分数与泄露排查", excerpt: "IP 检测适合发现明显异常，但不同数据库可能给出不同结果，最终要结合实际登录稳定性判断。", category: "网络环境", tags: ["IP检测", "DNS泄露"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-ip-risk-control-guide", title: "ChatGPT 换节点仍异常？IP、设备与账号风控原理", excerpt: "平台不会只看一个 IP。设备、会话、地区变化和使用行为共同决定是否触发验证。", category: "网络环境", tags: ["IP风控", "浏览器指纹"], date: "2026/07/13", minutes: 8 },
  { slug: "residential-ip-guide-for-chatgpt", title: "住宅 IP 是什么：ChatGPT 稳定网络选择与使用原则", excerpt: "住宅标签不等于绝对安全，稳定、合规、来源清楚和长期一致通常比频繁更换更重要。", category: "网络环境", tags: ["住宅IP", "机房IP"], date: "2026/07/13", minutes: 7 },
  { slug: "gpt-image-1-5-guide", title: "GPT Image 1.5 回顾：精准编辑、多轮修改与使用技巧", excerpt: "精准编辑的关键是锁定保留区域并缩小单次修改范围，这个方法对新旧图像模型都适用。", category: "模型动态", tags: ["GPT Image 1.5", "图像编辑"], date: "2026/07/13", minutes: 7 },
  { slug: "gpt-5-2-model-archive-guide", title: "GPT-5.2 模型回顾：Instant、Thinking、Pro 与升级路径", excerpt: "旧模型文章仍可帮助理解产品分层，但购买和使用时必须以当前模型列表为准。", category: "模型动态", tags: ["GPT-5.2", "Thinking"], date: "2026/07/13", minutes: 6 },
  { slug: "chatgpt-plus-upgrade-methods-2026", title: "2026 ChatGPT Plus 国内升级教程：官方订阅、应用商店与代充", excerpt: "升级方式没有绝对最优，关键是账号控制权、支付条件、总成本和售后范围。", category: "购买教程", tags: ["ChatGPT Plus", "国内升级"], date: "2026/07/13", minutes: 8 },
  { slug: "chatgpt-plus-features-and-audience-guide", title: "ChatGPT Plus 适合谁：功能、使用场景与购买判断", excerpt: "Plus 的核心价值是更稳定地获得高级模型和工具，但是否值得取决于每周实际使用量。", category: "产品对比", tags: ["ChatGPT Plus", "适合人群"], date: "2026/07/13", minutes: 7 },
  { slug: "chatgpt-pro-features-and-audience-guide", title: "ChatGPT Pro 适合谁：高频使用、复杂任务与成本判断", excerpt: "Pro 不是简单的“更贵 Plus”，它适合能够把更高额度和高级能力转化成实际产出的用户。", category: "产品对比", tags: ["ChatGPT Pro", "Plus对比"], date: "2026/07/13", minutes: 7 },
  { slug: "chatgpt-plus-business-comparison", title: "ChatGPT Plus 与 Business 对比：个人、团队和数据管理怎么选", excerpt: "一个人使用优先比较 Plus/Pro；需要统一成员、权限和工作区时，再考虑 Business。", category: "产品对比", tags: ["ChatGPT Business", "团队订阅"], date: "2026/07/13", minutes: 6 },
  { slug: "supergrok-subscription-guide", title: "Grok 与 SuperGrok 订阅指南：功能、适用场景与购买流程", excerpt: "选择 Grok 订阅前，先确认你真正需要的是其产品体验、实时信息能力还是更高使用额度。", category: "购买教程", tags: ["Grok", "xAI"], date: "2026/07/13", minutes: 6 },
  { slug: "gemini-subscription-guide", title: "Google Gemini 订阅指南：账号、地区、功能与购买注意事项", excerpt: "Gemini 更适合已经深度使用 Google 账号和相关工具的人，购买前要先确认账号与地区条件。", category: "购买教程", tags: ["Gemini", "Google AI"], date: "2026/07/13", minutes: 6 },
  { slug: "chatgpt-plans-price-comparison-guide", title: "ChatGPT 套餐与价格怎么比较：Free、Plus、Pro、Business", excerpt: "不要只看月费。把使用频率、额度、团队管理和账号控制权一起计算，才能选到合适计划。", category: "产品对比", tags: ["ChatGPT价格", "Plus"], date: "2026/07/13", minutes: 7 },
];

export function getTutorial(slug: string) {
  return TUTORIALS.find((t) => t.slug === slug);
}

export function relatedTutorials(slug: string, limit = 3) {
  const current = getTutorial(slug);
  if (!current) return [];
  const same = TUTORIALS.filter((t) => t.slug !== slug && t.category === current.category);
  const rest = TUTORIALS.filter((t) => t.slug !== slug && t.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

export type TutorialBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" };

export function headingId(text: string) {
  return text.replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fff-]/g, "").slice(0, 48);
}

function rewrite(text: string) {
  return text
    .replaceAll("贝贝商店", "TabCode小铺")
    .replaceAll("异次元店铺", "TabCode小铺")
    .replaceAll("/orders/lookup", "/query")
    .replaceAll("](/faq)", "](/tutorials)");
}

export function parseTutorial(markdown: string): TutorialBlock[] {
  const lines = rewrite(markdown).replace(/\r\n/g, "\n").split("\n");
  const blocks: TutorialBlock[] = [];
  let i = 0;

  const flushList = (kind: "ul" | "ol", items: string[]) => {
    if (items.length) blocks.push({ type: kind, items: [...items] });
    items.length = 0;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) {
      i += 1;
      continue;
    }
    if (line === "***" || line === "---" || line === "* * *") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push({ type: "h2", id: headingId(text), text });
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      blocks.push({ type: "h3", id: headingId(text), text });
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        parts.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: parts.join(" ") });
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i += 1;
      }
      if (rows.length >= 2) {
        blocks.push({ type: "table", headers: rows[0], rows: rows.slice(1) });
      }
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      flushList("ul", items);
      continue;
    }
    if (/^\d+[\.\\、]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[\.\\、]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[\.\\、]\s+/, ""));
        i += 1;
      }
      flushList("ol", items);
      continue;
    }
    const parts: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+[\.\\、]\s+/.test(lines[i].trim())
    ) {
      parts.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "p", text: parts.join(" ") });
  }
  return blocks;
}
