"use client";

import Starfield from "@/components/Starfield";
import VisualHero from "@/components/home/VisualHero";
import EmotionAnalytics from "@/components/home/EmotionAnalytics";
import {
  FutureLetterCard,
  PrivacyVaultCard,
  HeartBottleCard,
} from "@/components/home/FunctionalBanners";
import MemoryBridge from "@/components/home/MemoryBridge";
import EmotionBubblesBackground from "@/components/home/EmotionBubblesBackground";
import EmotionBubbles from "@/components/EmotionBubbles";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

export default function DashboardPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="relative min-h-screen bg-[#050505] transition-colors duration-700">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-morandi-sage z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Starfield />
      </div>
      <EmotionBubblesBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* 顶部：返回首页 + 标题 + 时空轴入口 */}
        <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between max-w-6xl mx-auto border-b border-white/5 bg-black/30 backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-morandi-sage hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-xl font-serif text-white">我的主页</h1>
          <Link
            href="/timeline"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-all active:scale-95"
          >
            <LayoutGrid className="w-4 h-4" />
            多维时空轴
          </Link>
        </header>

        {/* Bento Grid */}
        <section className="px-4 py-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-4">
              <VisualHero />
            </div>
            <div className="md:col-span-2">
              <EmotionAnalytics />
            </div>
            <div className="md:col-span-1">
              <FutureLetterCard />
            </div>
            <div className="md:col-span-1">
              <PrivacyVaultCard />
            </div>
            <div className="md:col-span-2">
              <HeartBottleCard />
            </div>
            <div className="md:col-span-2">
              <MemoryBridge />
            </div>
          </div>
        </section>

        {/* 情感场域 */}
        <section id="emotion" className="py-24 px-4 max-w-5xl mx-auto text-center scroll-mt-20">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">情感场域</h2>
            <p className="text-morandi-sage max-w-xl mx-auto opacity-80">
              每一段回忆都有其独特的色调。点击气泡，释放深藏已久的情感。
            </p>
          </div>
          <EmotionBubbles />
        </section>

        <footer className="py-12 border-t border-white/5 text-center text-morandi-sage/40 text-sm">
          <p>© 2026 Time Capsule: Eternal Symphony. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
