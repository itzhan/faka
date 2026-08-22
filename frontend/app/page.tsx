import { getCategories, getCommodities } from "@/lib/api";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import PillHeader from "@/components/PillHeader";
import Storefront from "@/components/Storefront";

export default async function Home() {
  const categories = await getCategories();
  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      items: await getCommodities(category.id),
    }))
  );
  const nonEmpty = sections.filter((s) => s.items.length > 0);

  const allItems = nonEmpty.flatMap((s) => s.items);
  const totalStock = allItems.reduce((sum, i) => sum + Math.max(i.stock, 0), 0);
  const stats = {
    productCount: allItems.length,
    totalSold: allItems.reduce((sum, i) => sum + (i.order_sold || 0), 0),
    stockLabel: totalStock > 500 ? "非常多" : totalStock > 50 ? "充足" : String(totalStock),
  };

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate">
        {/* Aceternity Aurora 二创:蓝紫极光缓慢流动,只铺 Hero 区,底部渐隐 */}
        <AuroraBackdrop />
        <Hero stats={stats} />
        <Storefront sections={nonEmpty} />
      </div>
      <Faq />
      <Footer />
    </>
  );
}
