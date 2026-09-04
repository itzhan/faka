"use client";

import { Suspense } from "react";
import PurchaseRecordList from "@/components/PurchaseRecordList";

export default function MePurchasePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">购买记录</h1>
        <p className="mt-1 text-sm text-muted">账户内的历史订单、付款状态和已发货卡密。</p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface" />}>
        <PurchaseRecordList />
      </Suspense>
    </div>
  );
}
