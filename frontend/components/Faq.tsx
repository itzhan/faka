import { FAQ_ITEMS } from "@/lib/site";

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-24">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        常见问题
      </h2>
      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl bg-white px-6 py-5 open:pb-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 shrink-0 fill-[#86868b] transition-transform duration-300 group-open:rotate-45"
                aria-hidden
              >
                <path d="M7 1h2v6h6v2H9v6H7V9H1V7h6V1z" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#424245]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
