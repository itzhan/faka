import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";

export default function NotFound() {
  return (
    <>
      <PillHeader />
      <main className="hero-wash flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-pixel text-6xl font-bold text-[#8b5cf6]">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          页面不存在或商品已下架
        </h1>
        <p className="mt-3 text-[15px] text-[#86868b]">
          它可能被移动、删除,或者从未存在过。
        </p>
        <a
          href="/"
          className="btn-graphite mt-8 rounded-full px-7 py-2.5 text-sm font-medium"
        >
          返回商城
        </a>
      </main>
      <Footer />
    </>
  );
}
