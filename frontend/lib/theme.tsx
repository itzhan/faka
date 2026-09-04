"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
export type ThemeOrigin = { x: number; y: number };

const KEY = "theme-pref";

function resolvePref(pref: ThemePref): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyPref(pref: ThemePref) {
  const resolved = resolvePref(pref);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = pref;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const ThemeContext = createContext<{
  pref: ThemePref;
  resolved: "light" | "dark";
  setPref: (pref: ThemePref, origin?: ThemeOrigin) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as ThemePref | null) ?? "system";
    const next = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setPrefState(next);
    setResolved(resolvePref(next));
    applyPref(next);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = (localStorage.getItem(KEY) as ThemePref | null) ?? "system";
      if (current === "system") {
        applyPref("system");
        setResolved(resolvePref("system"));
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      pref,
      resolved,
      setPref: (next: ThemePref, origin?: ThemeOrigin) => {
        const apply = () => {
          localStorage.setItem(KEY, next);
          setPrefState(next);
          setResolved(resolvePref(next));
          applyPref(next);
        };

        const nextResolved = resolvePref(next);
        const sameLook = nextResolved === resolvePref(pref);
        const startVT = (
          document as Document & {
            startViewTransition?: (cb: () => void) => {
              ready: Promise<void>;
              finished: Promise<void>;
            };
          }
        ).startViewTransition;

        if (!origin || sameLook || reducedMotion() || typeof startVT !== "function") {
          apply();
          return;
        }

        const x = origin.x;
        const y = origin.y;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );
        const root = document.documentElement;
        root.style.setProperty("--theme-x", `${x}px`);
        root.style.setProperty("--theme-y", `${y}px`);
        root.style.setProperty("--theme-r", `${endRadius}px`);
        root.classList.add("theme-vt");
        let vt: { finished: Promise<void> };
        try {
          vt = startVT(apply);
        } catch {
          root.classList.remove("theme-vt");
          apply();
          return;
        }
        vt.finished.finally(() => {
          root.classList.remove("theme-vt");
        });
      },
    }),
    [pref, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const THEME_BOOT_SCRIPT = `(function(){try{var m=localStorage.getItem("theme-pref")||"system";var d=m==="dark"||(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=m;}catch(e){}})();`;
