"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ExpandableScreenContextValue {
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  layoutId: string;
  triggerRadius: string;
  contentRadius: string;
  animationDuration: number;
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null);

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext);
  if (!context) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen"
    );
  }
  return context;
}

const layoutSpring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
  mass: 0.85,
};

interface ExpandableScreenProps {
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  layoutId?: string;
  triggerRadius?: string;
  contentRadius?: string;
  animationDuration?: number;
  lockScroll?: boolean;
}

export function ExpandableScreen({
  children,
  expanded,
  defaultExpanded = false,
  onExpandChange,
  layoutId = "expandable-card",
  triggerRadius = "32px",
  contentRadius = "24px",
  animationDuration = 0.35,
  lockScroll = true,
}: ExpandableScreenProps) {
  const [internal, setInternal] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internal;

  const expand = useCallback(() => {
    if (!isControlled) setInternal(true);
    onExpandChange?.(true);
  }, [isControlled, onExpandChange]);

  const collapse = useCallback(() => {
    if (!isControlled) setInternal(false);
    onExpandChange?.(false);
  }, [isControlled, onExpandChange]);

  useEffect(() => {
    if (!lockScroll) return;
    if (!isExpanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded, lockScroll]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded, collapse]);

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        expand,
        collapse,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  );
}

interface ExpandableScreenTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ExpandableScreenTrigger({
  children,
  className = "",
}: ExpandableScreenTriggerProps) {
  const { isExpanded, expand, layoutId, triggerRadius } = useExpandableScreen();

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* 共享 layoutId 的表面:展开时卸载,让全屏层接过 morph */}
      {!isExpanded && (
        <motion.div
          layout
          layoutId={layoutId}
          transition={layoutSpring}
          style={{ borderRadius: triggerRadius }}
          className="pointer-events-none absolute inset-0 bg-surface transform-gpu will-change-transform"
        />
      )}
      <motion.div
        role="button"
        tabIndex={isExpanded ? -1 : 0}
        aria-expanded={isExpanded}
        onClick={(e) => {
          if (isExpanded) return;
          if (e.metaKey || e.ctrlKey) return;
          expand();
        }}
        onKeyDown={(e) => {
          if (isExpanded) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            expand();
          }
        }}
        animate={{ opacity: isExpanded ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "relative h-full w-full",
          isExpanded ? "pointer-events-none" : "cursor-pointer"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ExpandableScreenContentProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
}

export function ExpandableScreenContent({
  children,
  className = "",
  showCloseButton = true,
  closeButtonClassName = "",
}: ExpandableScreenContentProps) {
  const { isExpanded, collapse, layoutId, animationDuration } =
    useExpandableScreen();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          key={layoutId}
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, delay: 0.12 } }}
        >
          <motion.button
            type="button"
            aria-label="关闭详情"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={collapse}
          />
          <div className="pointer-events-none absolute inset-0 flex items-stretch justify-center p-0 sm:items-center sm:p-3 md:p-4">
            <motion.div
              layout
              layoutId={layoutId}
              transition={layoutSpring}
              className={cn(
                "pointer-events-auto relative flex h-full w-full flex-col overflow-hidden transform-gpu will-change-transform rounded-none sm:rounded-[24px]",
                className
              )}
            >
              {showCloseButton && (
                <button
                  type="button"
                  onClick={collapse}
                  className={cn(
                    "absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center rounded-full bg-fill text-ink transition-colors hover:bg-fill-strong sm:right-4 sm:top-4 sm:h-10 sm:w-10",
                    closeButtonClassName
                  )}
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, duration: animationDuration }}
                className="relative z-20 min-h-0 flex-1 overflow-y-auto"
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode;
  content?: ReactNode;
  className?: string;
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = "",
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen();

  if (isExpanded && content) {
    return <div className={className}>{content}</div>;
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>;
  }

  return null;
}

export { useExpandableScreen };
