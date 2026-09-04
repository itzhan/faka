import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AuroraBackdrop from "@/components/ui/aurora-backdrop";
import Footer from "@/components/Footer";
import PillHeader from "@/components/PillHeader";
import TutorialReader from "@/components/TutorialReader";
import { TUTORIAL_BODIES } from "@/lib/tutorial-bodies";
import { getTutorial, parseTutorial, relatedTutorials, TUTORIALS } from "@/lib/tutorials";

export function generateStaticParams() {
  return TUTORIALS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getTutorial(slug);
  if (!meta) return { title: "教程" };
  return { title: `${meta.title}｜异次元店铺`, description: meta.excerpt };
}

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getTutorial(slug);
  const body = TUTORIAL_BODIES[slug];
  if (!meta || !body) notFound();

  return (
    <>
      <PillHeader />
      <div className="hero-wash relative isolate min-h-screen pt-24 sm:pt-28">
        <AuroraBackdrop className="h-[360px]" />
        <TutorialReader meta={meta} blocks={parseTutorial(body)} related={relatedTutorials(slug)} />
      </div>
      <Footer />
    </>
  );
}
