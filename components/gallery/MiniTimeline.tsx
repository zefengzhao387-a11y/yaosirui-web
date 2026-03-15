"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

type MiniTimelineProps = {
  years: string[];
  activeYear: string | null;
  onYearClick?: (year: string) => void;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
};

/** 根据滚动位置推断当前可见年份（按记忆所在年份分布近似） */
function useScrollSyncYear(
  scrollRef: React.RefObject<HTMLElement | null>,
  yearOrder: string[]
) {
  const [active, setActive] = useState<string | null>(yearOrder[0] ?? null);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el || yearOrder.length === 0) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const progress = scrollHeight > clientHeight
        ? scrollTop / (scrollHeight - clientHeight)
        : 0;
      const index = Math.min(
        Math.floor(progress * yearOrder.length),
        yearOrder.length - 1
      );
      setActive(yearOrder[Math.max(0, index)] ?? null);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef, yearOrder]);

  return active;
}

export default function MiniTimeline({
  years,
  activeYear: controlledYear,
  onYearClick,
  scrollContainerRef,
}: MiniTimelineProps) {
  const scrollSyncedYear = useScrollSyncYear(scrollContainerRef ?? { current: null }, years);
  const activeYear = controlledYear ?? scrollSyncedYear;

  if (years.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
      {years.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => onYearClick?.(y)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${activeYear === y
              ? "bg-morandi-sage/30 text-white border border-morandi-sage/50"
              : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white/90"}
          `}
        >
          {y}
        </button>
      ))}
    </div>
  );
}
