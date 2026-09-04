"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import { AUTH_LINKS } from "@/lib/site";
import { useUser } from "@/lib/useUser";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; supplier?: boolean };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "我的",
    items: [
      { href: "/me", label: "我的主页" },
      { href: "/", label: "购买商品" },
    ],
  },
  {
    title: "店铺",
    items: [
      { href: "/me/shop", label: "我的店铺" },
      { href: "/me/categories", label: "商品分类", supplier: true },
      { href: "/me/commodities", label: "我的商品", supplier: true },
      { href: "/me/cards", label: "卡密管理", supplier: true },
      { href: "/me/coupons", label: "代券管理", supplier: true },
      { href: "/me/sales", label: "商品订单", supplier: true },
    ],
  },
  {
    title: "财务",
    items: [
      { href: "/me/recharge", label: "充值中心" },
      { href: "/me/cash", label: "硬币兑现" },
      { href: "/me/orders", label: "购买记录" },
      { href: "/me/bills", label: "我的账单" },
    ],
  },
  {
    title: "推广",
    items: [
      { href: "/me/promote", label: "推广中心" },
      { href: "/me/members", label: "我的下级" },
    ],
  },
  {
    title: "服务",
    items: [
      { href: "/me/tickets", label: "我的工单" },
      { href: "/me/messages", label: "消息中心" },
    ],
  },
  {
    title: "账户",
    items: [
      { href: "/me/profile", label: "个人资料" },
      { href: "/me/password", label: "修改密码" },
    ],
  },
];

export default function MeShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const supplier = Boolean(
    user && "business_level" in user && (user as { business_level?: { supplier?: number } }).business_level?.supplier === 1
  );

  if (user === undefined) {
    return (
      <>
        <PillHeader />
        <div className="hero-wash me-shell min-h-[60vh] px-6 pt-32">
          <div className="mx-auto h-48 max-w-7xl animate-pulse rounded-3xl bg-surface" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PillHeader />
        <div className="hero-wash me-shell min-h-[60vh] px-4 pt-28 sm:px-6 sm:pt-32">
          <div className="mx-auto max-w-md rounded-3xl bg-surface px-6 py-14 text-center">
            <p className="text-[15px] font-medium">请先登录</p>
            <p className="mt-2 text-sm text-muted">登录后即可使用「我的」全部功能。</p>
            <div className="mt-6 flex justify-center gap-3">
              <a href={AUTH_LINKS.login} className="btn-graphite rounded-full px-6 py-2 text-sm">
                登录
              </a>
              <a
                href={AUTH_LINKS.register}
                className="rounded-full border border-hairline px-6 py-2 text-sm font-medium"
              >
                注册
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const links = GROUPS.flatMap((g) =>
    g.items.filter((item) => !item.supplier || supplier)
  );

  return (
    <>
      <PillHeader />
      <div className="hero-wash me-shell min-h-screen pt-20 sm:pt-24">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 sm:px-6">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-28 space-y-5">
              {GROUPS.map((group) => {
                const items = group.items.filter((i) => !i.supplier || supplier);
                if (items.length === 0) return null;
                return (
                  <div key={group.title}>
                    <p className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-faint">
                      {group.title}
                    </p>
                    <nav className="mt-2 space-y-1">
                      {items.map((item) => {
                        const active =
                          item.href === "/me"
                            ? pathname === "/me"
                            : item.href === "/"
                              ? pathname === "/"
                              : pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "block rounded-full px-3 py-2 text-sm font-medium",
                              active
                                ? "bg-ink text-on-ink"
                                : "text-subtle hover:bg-fill"
                            )}
                          >
                            {item.label}
                          </a>
                        );
                      })}
                    </nav>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <nav className="no-scrollbar mb-5 flex gap-2 overflow-x-auto lg:hidden">
              {links.map((item) => {
                const active =
                  item.href === "/me"
                    ? pathname === "/me"
                    : item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium",
                      active
                        ? "bg-ink text-on-ink"
                        : "border border-hairline bg-surface text-subtle"
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
