"use client";

import { motion } from "framer-motion";
import { Lock, Mail, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** 未来信件：倒计时卡片（占位数据，可后续接 API） */
export function FutureLetterCard() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    // 示例：来自 2024 的信，300 天后开启
    const openAt = new Date();
    openAt.setDate(openAt.getDate() + 300);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    openAt.setHours(0, 0, 0, 0);
    setDaysLeft(Math.max(0, Math.ceil((openAt.getTime() - today.getTime()) / 86400000)));
  }, []);
  const hasUpcoming = daysLeft !== null && daysLeft > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition-all cursor-pointer active:scale-[0.98]"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-morandi-midnightBlue/30 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-morandi-cream/90" />
          {hasUpcoming && (
            <motion.span
              className="absolute -bottom-0.5 -right-0.5"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lock className="w-3.5 h-3.5 text-morandi-cream/80" />
            </motion.span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-serif text-sm font-medium mb-0.5">未来信件</h4>
          <p className="text-white/60 text-xs leading-relaxed">
            {daysLeft !== null
              ? `有一封来自 2024 年的信，将在 ${daysLeft} 天后开启`
              : "暂无待开启信件"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** 密闭阁楼：毛玻璃入口（占位，点击可跳转或弹二次验证） */
export function PrivacyVaultCard() {
  const router = useRouter();
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push("/timeline")}
      className="w-full rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-morandi-sage/50"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20" style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
          <Lock className="w-5 h-5 text-white/80" />
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-serif text-sm font-medium mb-0.5">密闭阁楼</h4>
          <p className="text-white/60 text-xs leading-relaxed">
            私密日记区，点击进入需二次验证
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/** 心语瓶：最近一条带诗意引言的日记（占位，可接 API） */
export function HeartBottleCard() {
  const [snippet, setSnippet] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/memories?all=1")
      .then((r) => (r.ok ? r.json() : { memories: [] }))
      .then((body: { memories?: { text?: string; poeticQuote?: string }[] }) => {
        const list = body.memories ?? [];
        const withQuote = list.find((m: any) => m.poeticQuote || (m.text && m.text.length > 20));
        setSnippet(withQuote?.poeticQuote || withQuote?.text?.slice(0, 80) || null);
      })
      .catch(() => setSnippet(null));
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/10 p-5 min-h-[100px]"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-morandi-dustyPink/20 border border-white/10 flex items-center justify-center flex-shrink-0" style={{ backdropFilter: "blur(8px)" }}>
          <Quote className="w-5 h-5 text-morandi-dustyPink" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-serif text-sm font-medium mb-2">心语瓶</h4>
          <p className="text-white/70 text-xs leading-relaxed italic line-clamp-3">
            {snippet || "暂无带诗意引言的日记，去时空轴添加记忆吧"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FunctionalBanners() {
  return (
    <>
      <FutureLetterCard />
      <PrivacyVaultCard />
      <HeartBottleCard />
    </>
  );
}
