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
import { ArrowLeft, LayoutGrid, Lock } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [savingVault, setSavingVault] = useState(false);

  const handleSaveVaultPassword = async () => {
    if (!newPwd || newPwd.length < 4) {
      alert("新阁楼密码至少 4 位。");
      return;
    }
    setSavingVault(true);
    try {
      const res = await fetch("/api/vault/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: oldPwd || undefined,
          newPassword: newPwd,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        alert(data?.error || "设置阁楼密码失败");
        return;
      }
      alert("阁楼密码已更新。请务必牢记，否则将无法解锁密闭阁楼中的内容。");
      setVaultDialogOpen(false);
      setOldPwd("");
      setNewPwd("");
    } catch {
      alert("网络异常，稍后再试。");
    } finally {
      setSavingVault(false);
    }
  };

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
        {/* 顶部：返回首页 + 标题 + 时空轴入口 + 阁楼密码设置 */}
        <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between max-w-6xl mx-auto border-b border-white/5 bg-black/30 backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-morandi-sage hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-xl font-serif text-white">我的主页</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVaultDialogOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3" />
              设置阁楼密码
            </button>
            <Link
              href="/timeline"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-all active:scale-95"
            >
              <LayoutGrid className="w-4 h-4" />
              多维时空轴
            </Link>
          </div>
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

      {vaultDialogOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-serif text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              设置阁楼密码
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              阁楼密码用于加密你的私密心语。请务必牢记，忘记后将无法解锁密闭阁楼中的内容。
            </p>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="旧阁楼密码（第一次设置可留空）"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm text-white placeholder:text-white/30"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
              />
              <input
                type="password"
                placeholder="新阁楼密码（至少 4 位）"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm text-white placeholder:text-white/40"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVaultDialogOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs text-white/60 hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveVaultPassword}
                disabled={savingVault}
                className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-morandi-cream disabled:opacity-60"
              >
                {savingVault ? "保存中…" : "保存阁楼密码"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
