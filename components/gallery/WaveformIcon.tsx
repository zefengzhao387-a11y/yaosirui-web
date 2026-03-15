"use client";

import { motion } from "framer-motion";

const BAR_COUNT = 5;

/** 静态波形图标（未播放） */
export function WaveformIconStatic({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 h-4 ${className ?? ""}`} aria-hidden>
      {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-white/70"
          style={{ height: `${h * 100}%`, minHeight: 4 }}
        />
      ))}
    </div>
  );
}

/** 播放中的动态波形（随声音起伏的条形动画） */
export function WaveformIconActive({ className }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center justify-center gap-0.5 h-4 ${className ?? ""}`}
      aria-hidden
      initial="idle"
      animate="play"
      variants={{
        play: { transition: { staggerChildren: 0.08, delayChildren: 0 } },
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <motion.span
          key={i}
          className="w-0.5 h-4 rounded-full bg-morandi-sage block"
          style={{ transformOrigin: "bottom" }}
          variants={{
            idle: { scaleY: 0.3 },
            play: {
              scaleY: [0.3, 0.9, 0.5, 0.8, 0.4, 0.7, 0.3],
              transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            },
          }}
        />
      ))}
    </motion.div>
  );
}
