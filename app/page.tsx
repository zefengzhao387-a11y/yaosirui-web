"use client";

import Hero from "@/components/Hero";
import Starfield from "@/components/Starfield";
import FeatureSection from "@/components/FeatureSection";
import EmotionBubbles from "@/components/EmotionBubbles";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative min-h-screen bg-morandi-cream dark:bg-morandi-midnightBlue transition-colors duration-700">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-morandi-sage z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Background Starfield */}
      <div className="fixed inset-0 pointer-events-none">
        <Starfield />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Hero />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="bg-white/30 backdrop-blur-sm border-y border-morandi-sage/20"
        >
          <FeatureSection />
        </motion.div>

        {/* Emotion Bubbles Showcase */}
        <section className="py-24 px-4 max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-morandi-midnightBlue dark:text-morandi-cream mb-4">
              情感场域
            </h2>
            <p className="text-morandi-sage max-w-xl mx-auto">
              每一段回忆都有其独特的色调。点击气泡，释放深藏已久的情感。
            </p>
          </div>
          <EmotionBubbles />
        </section>

        {/* Call to Action Footer */}
        <section className="py-24 text-center px-4">
          <h2 className="text-4xl md:text-6xl font-serif text-morandi-midnightBlue dark:text-morandi-cream mb-8">
            开始编织你的<br />生命乐章
          </h2>
          <p className="text-morandi-sage mb-12 max-w-lg mx-auto">
            加入我们，将珍贵的回忆保存在这个永恒的数字化空间。
          </p>
          <button className="neo-brutalism px-12 py-4 bg-morandi-sage text-white font-bold text-xl rounded-none">
            立即注册
          </button>
        </section>

        <footer className="py-12 border-t border-morandi-sage/10 text-center text-morandi-sage/60 text-sm">
          <p>© 2026 Time Capsule: Eternal Symphony. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
