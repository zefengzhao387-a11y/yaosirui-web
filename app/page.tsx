"use client";

import Hero from "@/components/Hero";
import Starfield from "@/components/Starfield";
import FeatureSection from "@/components/FeatureSection";
import EmotionBubbles from "@/components/EmotionBubbles";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as { user: { id: string; email: string; name: string | null } };
        setUser(data.user);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative min-h-screen bg-[#050505] transition-colors duration-700">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-morandi-sage z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Background Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Starfield />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="bg-black/20 backdrop-blur-md border-y border-white/5"
        >
          <FeatureSection />
        </motion.div>

        {/* Emotion Bubbles Showcase */}
        <section id="emotion" className="py-24 px-4 max-w-5xl mx-auto text-center scroll-mt-20">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              情感场域
            </h2>
            <p className="text-morandi-sage max-w-xl mx-auto opacity-80">
              每一段回忆都有其独特的色调。点击气泡，释放深藏已久的情感。
            </p>
          </div>
          <EmotionBubbles />
        </section>

        {/* Call to Action Footer */}
        <section className="py-24 text-center px-4 bg-gradient-to-b from-transparent to-black/40">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">
            开始编织你的<br />生命乐章
          </h2>
          <p className="text-morandi-sage mb-12 max-w-lg mx-auto opacity-80">
            加入我们，将珍贵的回忆保存在这个永恒的数字化空间。
          </p>
          <button 
            onClick={() => window.location.href = user ? '/dashboard' : '/login'}
            className="px-12 py-4 bg-white text-black font-bold text-xl rounded-full hover:bg-morandi-cream transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {user ? "个人主页" : "立即注册"}
          </button>
        </section>

        <footer className="py-12 border-t border-white/5 text-center text-morandi-sage/40 text-sm">
          <p>© 2026 Time Capsule: Eternal Symphony. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
