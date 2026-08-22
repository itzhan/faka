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
import { AUTH_LINKS, NAV_LINKS, SITE } from "@/lib/site";

export default function PillHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const items = NAV_LINKS.map((l) => ({ name: l.label, link: l.href }));

  return (
    <Navbar className="fixed inset-x-0 top-0">
      {/* 桌面端:初始通栏,滚动后收缩为居中胶囊 */}
      <NavBody>
        <a
          href="/"
          className="relative z-20 shrink-0 whitespace-nowrap px-2 text-sm font-semibold tracking-tight text-[#1d1d1f]"
        >
          {SITE.name}
        </a>
        <NavItems items={items} />
        <div className="relative z-20 flex shrink-0 items-center gap-3">
          <a
            href={AUTH_LINKS.login}
            className="whitespace-nowrap text-[13px] font-medium text-[#48484a] transition-colors hover:text-[#1d1d1f]"
          >
            登录
          </a>
          <a
            href={AUTH_LINKS.register}
            className="btn-graphite whitespace-nowrap rounded-full px-4 py-1.5 text-[13px]"
          >
            注册
          </a>
        </div>
      </NavBody>

      {/* 移动端 */}
      <MobileNav>
        <MobileNavHeader>
          <a
            href="/"
            className="px-2 text-sm font-semibold tracking-tight text-[#1d1d1f]"
          >
            {SITE.name}
          </a>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
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
              className="w-full py-1 text-[15px] font-medium text-[#1d1d1f]"
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full items-center gap-3 pt-2">
            <a
              href={AUTH_LINKS.login}
              className="flex-1 rounded-full border border-black/10 py-2 text-center text-sm font-medium text-[#1d1d1f]"
            >
              登录
            </a>
            <a
              href={AUTH_LINKS.register}
              className="btn-graphite flex-1 rounded-full py-2 text-center text-sm"
            >
              注册
            </a>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
