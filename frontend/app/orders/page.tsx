"use client";

import { Suspense } from "react";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import PurchaseRecordList from "@/components/PurchaseRecordList";
import { AUTH_LINKS } from "@/lib/site";
import { useUser } from "@/lib/useUser";

function OrdersInner() {
  const user = useUser();

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate min-h-[70vh]">
        <AuroraBackdrop className="h-[420px]" />
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
          <div>
            <p className="font-pixel text-[11px] font-bold uppercase tracking-[0.3em] text-faint">
              Orders
            </p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-tight sm:text-4xl">订单</h1>
            <p className="mt-3 text-[15px] text-muted">
              {user
                ? "查询订单、付款与发货状态，已发货的卡密可在这里查看。"
                : "登录后查看你的全部订单。"}
            </p>
          </div>

          {user === undefined && (
            <div className="mt-10 space-y-4">
              <div className="h-28 animate-pulse rounded-3xl bg-surface" />
              <div className="h-36 animate-pulse rounded-3xl bg-surface" />
            </div>
          )}

          {user === null && (
            <div className="mt-10 rounded-3xl bg-surface px-6 py-14 text-center">
              <p className="text-[15px] font-medium">请先登录</p>
              <p className="mt-2 text-sm text-muted">登录后即可查看订单、余额和卡密。</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a href={AUTH_LINKS.login} className="btn-graphite rounded-full px-6 py-2 text-sm">
                  登录
                </a>
                <a
                  href={AUTH_LINKS.register}
                  className="rounded-full border border-hairline px-6 py-2 text-sm font-medium text-ink transition-colors hover:bg-fill"
                >
                  注册
                </a>
              </div>
            </div>
          )}

          {user && (
            <div className="mt-8">
              <PurchaseRecordList />
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <>
          <PillHeader />
          <div className="hero-wash min-h-[70vh] px-6 pt-32">
            <div className="mx-auto h-40 max-w-5xl animate-pulse rounded-3xl bg-surface" />
          </div>
        </>
      }
    >
      <OrdersInner />
    </Suspense>
  );
}
