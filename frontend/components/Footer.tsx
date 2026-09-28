import { FOOTER_DISCLAIMER, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-hairline-soft bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          {FOOTER_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
