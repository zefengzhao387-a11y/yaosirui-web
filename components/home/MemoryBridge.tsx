"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const breathDotKeyframes = `
  @keyframes breath-dot {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 12px rgba(239,68,68,0.9); }
    50% { opacity: 0.7; transform: scale(1.15); box-shadow: 0 0 20px rgba(239,68,68,0.95); }
  }
`;
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** 访客投递新记忆数量（来自 API 真实数据） */
export default function MemoryBridge() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/guest-submissions/pending")
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data: { count?: number }) => {
        if (isMounted && typeof data.count === "number") setPendingCount(data.count);
      })
      .catch(() => {
        if (isMounted) setPendingCount(0);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayCount = pendingCount;
  const hasPending = displayCount > 0;

  return (
    <>
      <style>{breathDotKeyframes}</style>
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-[2rem] border border-white/10 overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <button
        type="button"
        onClick={() => router.push("/timeline")}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-white/5 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-morandi-sage/50 rounded-[2rem]"
      >
        <div className="relative w-12 h-12 rounded-2xl bg-morandi-sage/20 border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
          <MessageCircle className="w-6 h-6 text-morandi-sage" />
          {hasPending && (
            <span
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#050505]"
              style={{
                boxShadow: "0 0 12px rgba(239,68,68,0.9)",
                animation: "breath-dot 1.8s ease-in-out infinite",
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-serif text-lg font-medium mb-0.5">记忆之桥</h3>
          <p className="text-white/60 text-sm">
            {hasPending
              ? `有 ${displayCount} 位亲友为你投递了新记忆，点击进入审核`
              : "亲友可为你投递记忆，审核后将出现在时空轴"}
          </p>
        </div>
      </button>
    </motion.section>
    </>
  );
}
