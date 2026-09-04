"use client";

import { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { AUTH_LINKS, NAV_LINKS, SITE } from "@/lib/site";
import { useUser } from "@/lib/useUser";

export default function PillHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useUser();
  const items = NAV_LINKS.map((l) => ({ name: l.label, link: l.href }));

  return (
    <Navbar className="fixed inset-x-0 top-0">
      {/* 桌面端:初始通栏,滚动后收缩为居中胶囊 */}
      <NavBody>
        <a
          href="/"
          className="relative z-20 shrink-0 whitespace-nowrap px-2 text-sm font-semibold tracking-tight text-ink"
        >
          {SITE.name}
        </a>
        <NavItems items={items} />
        <div className="relative z-20 flex shrink-0 items-center gap-3">
          <ThemeToggle />
          {user === undefined ? (
            <div className="h-8 w-28 animate-pulse rounded-full bg-fill" />
          ) : user ? (
            <>
              <a
                href="/me"
                title={`余额 ¥${user.balance}`}
                className="flex items-center gap-2 rounded-full border border-hairline py-1 pl-1 pr-2.5 transition-colors hover:bg-fill"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-on-ink">
                    {(user.username[0] || "?").toUpperCase()}
                  </span>
                )}
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="max-w-[100px] truncate text-[13px] font-medium text-ink">
                    {user.username}
                  </span>
                  <span className="font-pixel text-[10px] text-muted">
                    ¥{user.balance}
                  </span>
                </span>
              </a>
              <a
                href="/user/authentication/logout"
                className="whitespace-nowrap text-[13px] font-medium text-muted transition-colors hover:text-ink"
              >
                退出
              </a>
            </>
          ) : (
            <>
              <a
                href={AUTH_LINKS.login}
                className="whitespace-nowrap text-[13px] font-medium text-subtle transition-colors hover:text-ink"
              >
                登录
              </a>
              <a
                href={AUTH_LINKS.register}
                className="btn-graphite whitespace-nowrap rounded-full px-4 py-1.5 text-[13px]"
              >
                注册
              </a>
            </>
          )}
        </div>
      </NavBody>

      {/* 移动端 */}
      <MobileNav>
        <MobileNavHeader>
          <a
            href="/"
            className="px-2 text-sm font-semibold tracking-tight text-ink"
          >
            {SITE.name}
          </a>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {items.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full rounded-xl px-2 py-3 text-[15px] font-medium text-ink active:bg-fill"
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full items-center gap-3 pt-2">
            {user === undefined ? (
              <div className="h-10 w-full animate-pulse rounded-full bg-fill" />
            ) : user ? (
              <>
                <a
                  href="/me"
                  className="flex-1 rounded-full border border-hairline py-2 text-center text-sm font-medium text-ink"
                >
                  {user.username} 的主页
                </a>
                <a
                  href="/user/authentication/logout"
                  className="flex-1 rounded-full border border-hairline py-2 text-center text-sm font-medium text-muted"
                >
                  退出登录
                </a>
              </>
            ) : (
              <>
                <a
                  href={AUTH_LINKS.login}
                  className="flex-1 rounded-full border border-hairline py-2 text-center text-sm font-medium text-ink"
                >
                  登录
                </a>
                <a
                  href={AUTH_LINKS.register}
                  className="btn-graphite flex-1 rounded-full py-2 text-center text-sm"
                >
                  注册
                </a>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
