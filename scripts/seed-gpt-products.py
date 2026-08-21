#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import secrets
from datetime import datetime

CSS = """<style>
.gpt-plus-desc{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c2024;font-size:14px;line-height:1.7}
.gpt-plus-desc *{box-sizing:border-box}
.gpt-plus-card{margin:0 0 14px;padding:22px;border:1px solid #e0e1e6;border-radius:24px;background:#fff}
.gpt-plus-kicker{margin:0 0 8px;color:#60646c;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.gpt-plus-title{margin:0 0 10px;color:#000;font-size:28px;font-weight:800;letter-spacing:-.05em;line-height:1.1}
.gpt-plus-subtitle{margin:0 0 12px;color:#000;font-size:18px;font-weight:800;letter-spacing:-.04em}
.gpt-plus-text{margin:0 0 16px;color:#60646c}
.gpt-plus-pills{margin:0}
.gpt-plus-pill{display:inline-block;margin:0 8px 8px 0;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;line-height:1}
.gpt-plus-pill-ok{background:#e8f7ee;color:#1aa251}
.gpt-plus-pill-info{background:#e7f2fb;color:#0d74ce}
.gpt-plus-pill-mute{background:#f0f0f3;color:#555860}
.gpt-plus-step{margin:0;padding:12px 0;border-bottom:1px solid #e0e1e6}
.gpt-plus-step-last{border-bottom:0}
.gpt-plus-num{display:inline-block;width:28px;height:28px;margin:0 10px 0 0;border-radius:999px;background:#111 !important;color:#fff !important;font-size:12px;font-weight:700;line-height:28px;text-align:center;vertical-align:top}
.gpt-plus-step-body{display:inline-block;width:calc(100% - 42px);vertical-align:top}
.gpt-plus-step-body b{display:block;margin:0 0 2px;color:#111}
.gpt-plus-step-body span{color:#60646c;font-weight:400}
.gpt-plus-faq{margin:0 0 10px;padding:14px 16px;border-radius:16px;background:#f0f0f3}
.gpt-plus-faq b{display:block}
.gpt-plus-faq span{display:block;margin-top:4px;color:#60646c;font-weight:400}
.gpt-plus-notice{margin:0 0 14px;padding:18px 20px;border:1px solid #ffccc7;border-radius:16px;background:#fff1f0;color:#cf1322;font-size:18px;font-weight:800;line-height:1.75}
.gpt-plus-link{color:#0d74ce;font-weight:700}
</style>"""


def pills(items):
    html = ['<div class="gpt-plus-pills">']
    for text, kind in items:
        html.append(f'<span class="gpt-plus-pill gpt-plus-pill-{kind}">{text}</span>')
    html.append('</div>')
    return '\n'.join(html)


def points(items):
    rows = []
    for i, text in enumerate(items, 1):
        last = ' gpt-plus-step-last' if i == len(items) else ''
        rows.append(
            f'<div class="gpt-plus-step{last}">'
            f'<span class="gpt-plus-num" style="background:#111;color:#fff;">{i:02d}</span>'
            f'<span class="gpt-plus-step-body"><b>{text}</b></span>'
            f'</div>'
        )
    return '\n'.join(rows)


def steps(items):
    rows = []
    for i, (title, text) in enumerate(items, 1):
        last = ' gpt-plus-step-last' if i == len(items) else ''
        rows.append(
            f'<div class="gpt-plus-step{last}">'
            f'<span class="gpt-plus-num" style="background:#111;color:#fff;">{i:02d}</span>'
            f'<span class="gpt-plus-step-body"><b>{title}</b><span>{text}</span></span>'
            f'</div>'
        )
    return '\n'.join(rows)


def faqs(items):
    return '\n'.join(
        f'<div class="gpt-plus-faq"><b>{q}</b><span>{a}</span></div>' for q, a in items
    )


COMMON_STEPS = [
    ('需已有 GPT 账号', '没有账号无法使用。'),
    ('账号需为个人版', '加入过 Team 空间，请先切回个人版再获取 Token，否则可能充值失败。'),
    ('接受不退不换', '卡密售出后，除非卡密无法兑换，否则不退不换。'),
    ('当天购买、当天使用', '不建议囤货。囤货多天后再反馈无法使用，不支持退款。'),
    ('不建议微软邮箱', '微软邮箱更容易风控，建议使用谷歌邮箱。'),
]

COMMON_FAQS = [
    ('兑换失败', '继续重试，或等待 30 分钟后再试。'),
    ('充值成功但未显示 Plus / Pro', '退出账号后重新登录 GPT。'),
    ('网页版看不到对应模型', '使用浏览器无痕模式重新登录。'),
    ('Codex 额度未刷新', '属于官方延迟。等待 30 分钟后重新登录 Codex，随意提问一次即可激活。'),
]

NOTICE = '拍下即默认已阅读并接受以下全部条款。由于官方风控或渠道规则变化，兑换方式可能随时失效，请即买即用。当天无法使用请当天反馈。'


def wrap(body):
    return CSS + '\n<div class="gpt-plus-desc">\n' + body + '\n</div>\n'


def fei_plus_html():
    return wrap(f"""
  <div class="gpt-plus-notice">{NOTICE}</div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official Recharge</div>
    <div class="gpt-plus-title">菲区官方正规卡充</div>
    <div class="gpt-plus-text">本商品为 GPT Plus 自助充值卡密。兑换成功后可获得一个月 ChatGPT Plus，官方价 20 美元。24 小时自动充值，预计 1–3 分钟到账。</div>
    {pills([('秒冲到账', 'ok'), ('同步官方售后', 'info'), ('当天使用', 'mute')])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Risk</div>
    <div class="gpt-plus-subtitle">使用提醒</div>
    {points([
        '不支持覆盖，不支持覆盖，不支持覆盖',
        '账号必须是未订阅状态 / 免费版才可充值',
        '小众邮箱容易掉订阅，建议使用谷歌邮箱',
        '原账号若是 GPT Pro，Plus 无法覆盖。请换新号，或等 Pro 到期后再充',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Before You Buy</div>
    <div class="gpt-plus-subtitle">下单前必读</div>
    <div class="gpt-plus-text">以下条款请确认接受后再拍，任意一条不能接受都不建议购买。</div>
    {steps(COMMON_STEPS)}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Support</div>
    <div class="gpt-plus-subtitle">常见问题</div>
    {faqs(COMMON_FAQS)}
  </div>
""")


def ios_html():
    return wrap(f"""
  <div class="gpt-plus-notice">{NOTICE}</div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official Recharge</div>
    <div class="gpt-plus-title">iOS 土区官方正规充值</div>
    <div class="gpt-plus-text">本商品为 GPT Plus 自助充值卡密。兑换成功后可获得 1 个月 ChatGPT Plus 订阅，官方价 20 美元。24 小时自动充值，预计 1–3 分钟到账。商品说明中的谷歌或 iOS 端充值，指的是充值方式，你只需要有 GPT 账号即可充值。不要拿之前在别的地方用低价卡密充值过的号来充值，容易封号。</div>
    {pills([('秒冲到账', 'ok'), ('质保30天', 'info'), ('当天使用', 'mute')])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Warranty</div>
    <div class="gpt-plus-subtitle">质保规则</div>
    {points([
        '质保 30 天不掉订阅。不质保封号情况。',
        '如 30 天内出现掉订阅，可按剩余天数退差价。',
        '封号问题 99% 为用户自身使用环境或账号本身风控导致，封号不在售后范围内。',
        '建议使用干净稳定的 IP 环境，不要多人共享或频繁切换地区登录。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Risk</div>
    <div class="gpt-plus-subtitle">使用提醒</div>
    {points([
        '原 Plus 未到期会被覆盖，不叠加时长。',
        '小众邮箱容易掉订阅，不要使用微软邮箱，建议使用谷歌邮箱。',
        '如果原账号订阅的是 GPT Pro，Plus 卡密无法覆盖。请换新号，或等 Pro 到期后再充。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Before You Buy</div>
    <div class="gpt-plus-subtitle">下单前必读</div>
    <div class="gpt-plus-text">以下条款请确认接受后再拍，任意一条不能接受都不建议购买。</div>
    {steps(COMMON_STEPS)}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official</div>
    <div class="gpt-plus-subtitle">风险说明</div>
    {points([
        '不建议囤货。囤货多天后再反馈无法使用并要求退款，不支持退款。',
        '由于官方风控或渠道规则变化，兑换方式可能随时失效，请即买即用。',
        '如当天无法使用，请当天联系反馈处理。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Support</div>
    <div class="gpt-plus-subtitle">常见问题</div>
    {faqs(COMMON_FAQS)}
  </div>
""")


def pro5x_html():
    return wrap(f"""
  <div class="gpt-plus-notice">{NOTICE}</div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official Recharge</div>
    <div class="gpt-plus-title">iOS 官方正规充值｜GPT Pro 5X</div>
    <div class="gpt-plus-text">本商品为 GPT Pro 5X 自助充值卡密。兑换成功后可获得 1 个月 GPT Pro 5X 订阅，官方价 100 美元。24 小时自动充值，预计 1–3 分钟到账。不要拿之前在别的地方用低价卡密充值过的号来充值，容易封号。如果你的 Plus 是 iOS 端充值的，可以覆盖上去。</div>
    {pills([('秒冲到账', 'ok'), ('质保30天', 'info'), ('100刀款', 'mute')])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Warranty</div>
    <div class="gpt-plus-subtitle">质保规则</div>
    {points([
        '质保 30 天不掉订阅。不质保封号情况。',
        '如 30 天内出现掉订阅，可按剩余天数退差价。',
        '封号问题 99% 为用户自身使用环境或账号本身风控导致，封号不在售后范围内。',
        '建议使用干净稳定的 IP 环境，不要多人共享或频繁切换地区登录。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Risk</div>
    <div class="gpt-plus-subtitle">使用提醒</div>
    {points([
        '原 Plus 未到期会被覆盖，不叠加时长。',
        '小众邮箱容易掉订阅，不要使用微软邮箱，建议使用谷歌邮箱。',
        '请勿使用微软邮箱。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Before You Buy</div>
    <div class="gpt-plus-subtitle">下单前必读</div>
    <div class="gpt-plus-text">以下条款请确认接受后再拍，任意一条不能接受都不建议购买。</div>
    {steps(COMMON_STEPS)}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official</div>
    <div class="gpt-plus-subtitle">风险说明</div>
    {points([
        '不建议囤货。囤货多天后再反馈无法使用并要求退款，不支持退款。',
        '由于官方风控或渠道规则变化，兑换方式可能随时失效，请即买即用。',
        '如当天无法使用，请当天联系反馈处理。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Support</div>
    <div class="gpt-plus-subtitle">常见问题</div>
    {faqs(COMMON_FAQS)}
  </div>
""")


def pro20x_ios_html():
    return wrap(f"""
  <div class="gpt-plus-notice">{NOTICE}</div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official Recharge</div>
    <div class="gpt-plus-title">iOS 官方正规充值｜GPT Pro 20X</div>
    <div class="gpt-plus-text">本商品为 GPT Pro 20X 自助充值卡密。兑换成功后可获得 1 个月 GPT Pro 20X 订阅，官方价 200 美元。24 小时自动充值，预计 1–3 分钟到账。保证正规充值。不要拿之前在别的地方用低价卡密充值过的号来充值，容易封号。如果你的 Plus 是 iOS 端充值的，可以覆盖上去。</div>
    {pills([('秒冲到账', 'ok'), ('质保30天', 'info'), ('200刀款', 'mute')])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Warranty</div>
    <div class="gpt-plus-subtitle">质保规则</div>
    {points([
        '质保 30 天不掉订阅。不质保封号情况。',
        '如 30 天内出现掉订阅，可按剩余天数退差价。',
        '封号问题 99% 为用户自身使用环境或账号本身风控导致，封号不在售后范围内。',
        '建议使用干净稳定的 IP 环境，不要多人共享或频繁切换地区登录。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Risk</div>
    <div class="gpt-plus-subtitle">使用提醒</div>
    {points([
        '原 Plus 未到期会被覆盖，不叠加时长。',
        '小众邮箱容易掉订阅，不要使用微软邮箱，建议使用谷歌邮箱。',
        '请勿使用微软邮箱。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Before You Buy</div>
    <div class="gpt-plus-subtitle">下单前必读</div>
    <div class="gpt-plus-text">以下条款请确认接受后再拍，任意一条不能接受都不建议购买。</div>
    {steps(COMMON_STEPS)}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official</div>
    <div class="gpt-plus-subtitle">风险说明</div>
    {points([
        '不建议囤货。囤货多天后再反馈无法使用并要求退款，不支持退款。',
        '由于官方风控或渠道规则变化，兑换方式可能随时失效，请即买即用。',
        '如当天无法使用，请当天联系反馈处理。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Support</div>
    <div class="gpt-plus-subtitle">常见问题</div>
    {faqs(COMMON_FAQS)}
  </div>
""")


def pro20x_fei_html():
    return wrap(f"""
  <div class="gpt-plus-notice">{NOTICE}</div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official Recharge</div>
    <div class="gpt-plus-title">官方卡充｜GPT Pro 20X</div>
    <div class="gpt-plus-text">本商品为 GPT Pro 20X 自助充值卡密。兑换成功后可获得 1 个月 Pro 20X 套餐。提交订单后将由人工处理，正常处理时间约 1–30 分钟。每日接单时间：24 小时自动充值。账单请自行保存。请勿使用微软邮箱。</div>
    {pills([('支持续费', 'ok'), ('正规充值', 'info'), ('200刀款', 'mute')])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Official</div>
    <div class="gpt-plus-subtitle">禁止提交说明</div>
    {points([
        '目前账号如果已经是 Plus / Team / Pro 资格账号，请勿提交 GPT Plus / GPT Pro 充值订单。',
        '如之前购买或使用过：非正常 Pro / Plus、0 元购、谷歌内购订阅、低价黑冲账号、存在异常订阅记录的账号，请勿提交。',
        '否则可能导致订阅掉线、触发邮件欺诈风控、充值失败、账号异常。请更换正常账号后再提交。',
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Tips</div>
    <div class="gpt-plus-subtitle">商品说明</div>
    {steps([
        ('订阅消费说明', '本服务仅用于 GPT Plus / GPT Pro 正价订阅消费。使用本服务完成的所有正价订阅消费，原则上不支持退款。除非因平台或本服务本身原因导致无法完成服务，才可按售后规则处理。'),
        ('违规行为处理', '如因客户自身违规行为导致问题，包括邮件欺诈、网络滥用、违反平台使用条款、账号存在异常订阅记录、使用异常环境或异常账号，由此造成的充值失败、订阅异常、账号限制，均不支持退款。'),
        ('账号封禁、KYC、手机号等问题', '如因账号被封禁、KYC 未通过、需要绑定手机号、客户自行取消订阅、账号自身风控或限制导致无法正常使用，需客户自行处理，本店不承担相关责任，且不予退款。'),
        ('官方退款处理', '如出现订阅掉线、订单异常等情况，需客户自行联系 OpenAI / ChatGPT 官方客服处理。是否可以退款、退款金额、退款时间，均以官方客服最终判断为准。本店不主动代理官方退款，也不保证官方退款结果。'),
        ('退款流程及扣款说明', '如官方最终完成退款，本店将在收到退款后进行处理。退款时将扣除 20% 处理费用，剩余款项按实际到账情况退还给客户。'),
        ('建议使用邮箱', '建议使用 Gmail（强烈建议）、163、126、QQ 邮箱提交订单。'),
    ])}
  </div>
  <div class="gpt-plus-card">
    <div class="gpt-plus-kicker">Risk</div>
    <div class="gpt-plus-subtitle">充值提醒</div>
    {points([
        '充值成功后，系统会向您提供的邮箱发送相关邮件通知，并告知账号套餐已成功充值。',
        '请提供需要充值的 GPT Plus / Pro 套餐账号。如账号未购买套餐，需按要求提交账号 Token 或 Cookie，格式以 TXT 文本为准。',
        '请在使用本服务前仔细阅读以上全部条款。提交订单即代表您已理解并接受本商品全部须知、规则与协议内容。',
        '阅读完毕后，请在下单用户协议处输入：我已阅读并接受本商品全部须知规则与全部协议内容',
    ])}
  </div>
""")


PRODUCTS = [
    {
        'name': 'ChatGPT Plus 月卡｜ iOS 官方正规充值【质保30天】【秒冲】【卡密可囤三天】',
        'price': '132.00',
        'stock': 200,
        'sort': 10,
        'html': ios_html(),
    },
    {
        'name': 'ChatGPT Pro 5X｜1个月｜iOS 官方正规充值 【秒冲】【质保30天】',
        'price': '650.00',
        'stock': 5,
        'sort': 20,
        'html': pro5x_html(),
    },
    {
        'name': 'ChatGPT Pro 20X 月卡｜官方卡充｜1个月｜支持续费｜正规充值',
        'price': '1080.00',
        'stock': 8,
        'sort': 30,
        'html': pro20x_fei_html(),
    },
    {
        'name': 'ChatGPT Pro 20X 月卡｜iOS 官方正规充值【秒冲】【质保30天】',
        'price': '1180.00',
        'stock': 10,
        'sort': 40,
        'html': pro20x_ios_html(),
    },
]


def sql_escape(value: str) -> str:
    return value.replace('\\', '\\\\').replace("'", "''")


def main():
    updates = {
        2: fei_plus_html(),
        3: ios_html(),
        4: pro5x_html(),
        5: pro20x_fei_html(),
        6: pro20x_ios_html(),
    }
    statements = ['SET NAMES utf8mb4;']
    for cid, html in updates.items():
        statements.append(
            f"UPDATE acg_commodity SET description='{sql_escape(html)}' WHERE id={cid};"
        )
    statements.append(
        "SELECT id, name, LOCATE('以下全部条款', description) AS notice_ok, LOCATE('gpt-plus-warn', description) AS old_warn FROM acg_commodity ORDER BY id;"
    )
    print('\n'.join(statements))


if __name__ == '__main__':
    main()
