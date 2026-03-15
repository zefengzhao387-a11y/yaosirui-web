"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10"
      >
        <h1 className="text-6xl md:text-8xl font-serif mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          永恒交响
          <span className="block text-2xl md:text-4xl font-sans mt-2 opacity-60">
            Eternal Symphony
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-morandi-sage mb-10 font-sans leading-relaxed opacity-90">
          一个跨越维度的数字化回忆博物馆。
          在这里，碎片化的记忆被编织成永恒的乐章。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/timeline'}
            className="px-10 py-4 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-morandi-cream transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            开启探索之旅 <ArrowRight size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 glass rounded-full font-medium border border-white/20 text-white hover:bg-white/5 transition-all"
          >
            了解更多
          </motion.button>
        </div>
      </motion.div>
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-morandi-sage opacity-20 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-morandi-dustyPink opacity-20 blur-3xl"
      />
    </section>
  );
}
