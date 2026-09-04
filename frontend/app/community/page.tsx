import type { Metadata } from "next";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import CommunityHub from "@/components/CommunityHub";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import { getCommunityGroups } from "@/lib/api";

export const metadata: Metadata = {
  title: "加入社群｜异次元店铺",
  description: "电报通知群、电报交流群和 QQ 通知群，查看全部邀请链接与二维码。",
};

export default async function CommunityPage() {
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
