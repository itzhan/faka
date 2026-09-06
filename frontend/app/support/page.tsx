import type { Metadata } from "next";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import CommunityHub from "@/components/CommunityHub";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import { getCommunityGroups } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "售后客服｜TabCode小铺",
  description: "购买咨询和售后都走这一个客服入口。联系时请带上订单号。",
};

export default async function SupportPage() {
  const groups = await getCommunityGroups();

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate min-h-screen pt-24 sm:pt-28">
        <AuroraBackdrop className="h-[420px]" />
        <CommunityHub groups={groups} />
      </div>
      <Footer />
    </>
  );
}
