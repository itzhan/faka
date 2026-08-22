import { FOOTER_COLUMNS, FOOTER_DISCLAIMER, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[13px] font-semibold">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-[#86868b] transition-colors hover:text-[#1d1d1f]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-black/5 pt-6">
          <p className="text-xs text-[#86868b]">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#a1a1a6]">
            {FOOTER_DISCLAIMER}
          </p>
        </div>
      </div>
    </footer>
  );
}
