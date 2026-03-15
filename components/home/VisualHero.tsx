"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const NebulaPreview = dynamic(() => import("./NebulaPreview"), { ssr: false });

type Stats = { memoryCount: number; yearCount: number } | null;

/** 数字从 0 滚动到目标值，duration 秒 */
function useCountUp(target: number, duration = 0.9, enabled = true) {
  const [display, setDisplay] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    const controls = animate(prevTarget.current, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prevTarget.current = target;
    return () => controls.stop();
  }, [target, duration, enabled]);

  return display;
}

export default function VisualHero() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok),
      fetch("/api/year-summaries").then((r) => (r.ok ? r.json() : { years: [] })),
      fetch("/api/memories?all=1").then((r) => (r.ok ? r.json() : { memories: [] })),
    ])
      .then(([loggedIn, yearsData, memoriesData]) => {
        if (!isMounted) return;
        const years = (yearsData as { years?: unknown[] }).years ?? [];
        const memories = (memoriesData as { memories?: unknown[] }).memories ?? [];
        const yearCount = Array.isArray(years) ? years.length : 0;
        const memoryCount = Array.isArray(memories) ? memories.length : 0;
        if (loggedIn) {
          setStats({ memoryCount, yearCount });
        } else {
          setStats({ memoryCount: 0, yearCount: 0 });
        }
      })
      .catch(() => {
        if (isMounted) setStats({ memoryCount: 0, yearCount: 0 });
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const targetCount = stats?.memoryCount ?? 0;
  const targetYears = stats?.yearCount ?? 0;
  const displayCount = useCountUp(targetCount, 0.9, stats !== null);
  const displayYears = useCountUp(targetYears, 0.9, stats !== null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-[420px] md:min-h-[480px] rounded-[2rem] overflow-hidden border border-white/10 bg-black/20 shadow-2xl"
      style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
    >
      <div className="absolute inset-0 z-0">
        <NebulaPreview />
      </div>
      <button
        type="button"
        onClick={() => router.push("/timeline")}
        className="absolute inset-0 z-10 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-morandi-sage/50 rounded-[2rem]"
        aria-label="进入多维时空轴"
      />
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[420px] md:min-h-[480px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-white drop-shadow-lg mb-2">
            时空星云
          </h2>
          <p className="text-morandi-sage/90 text-sm md:text-base">
            点击进入多维时空轴，在星空中航行
          </p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-sm font-sans mb-8"
        >
          已收藏 {displayCount} 片星光（记忆），跨越 {displayYears} 年时光
        </motion.p>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium group-hover:bg-white/15 transition-colors"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          进入时空轴
        </motion.span>
      </div>
    </motion.section>
  );
}
