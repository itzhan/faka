import type { Metadata } from "next";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import TutorialHub from "@/components/TutorialHub";

export const metadata: Metadata = {
  title: "教程中心｜异次元店铺",
  description: "ChatGPT、Claude、Grok、Gemini 购买、支付查单、自动发货和账号安全指南。",
};

export default function TutorialsPage() {
  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate min-h-screen pt-24 sm:pt-28">
        <AuroraBackdrop className="h-[420px]" />
        <TutorialHub />
      </div>
      <Footer />
    </>
  );
}
