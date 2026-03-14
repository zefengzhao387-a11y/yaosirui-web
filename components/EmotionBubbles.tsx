"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  label: string;
  duration: number;
}

const colors = [
  "bg-morandi-sage/60",
  "bg-morandi-dustyPink/60",
  "bg-morandi-coolGray/60",
  "bg-morandi-warmBeige/60",
  "bg-morandi-midnightBlue/30",
];

const labels = ["欢快", "怀念", "宁静", "忧郁", "激昂"];

export default function EmotionBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBubble: Bubble = {
        id: Date.now(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: 110, // Start below screen
        size: Math.random() * 60 + 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        label: labels[Math.floor(Math.random() * labels.length)],
        duration: Math.random() * 10 + 10,
      };

      setBubbles((prev) => [...prev, newBubble]);

      // Remove bubble after animation
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, newBubble.duration * 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    // Here you could trigger a confetti or sound effect
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h3 className="text-3xl font-serif text-morandi-midnightBlue/20 dark:text-morandi-cream/20">
          情感场域 (Emotion Field)
        </h3>
      </div>
      
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ y: "120%", x: `${bubble.x}%`, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: "-20%", 
              opacity: 1, 
              scale: 1,
              x: `${bubble.x + Math.sin(bubble.id) * 5}%` 
            }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: bubble.duration, ease: "linear" }}
            onClick={() => popBubble(bubble.id)}
            style={{ width: bubble.size, height: bubble.size }}
            className={`
              absolute rounded-full cursor-pointer flex items-center justify-center
              ${bubble.color} backdrop-blur-sm border border-white/20 shadow-lg
              hover:scale-110 transition-transform active:scale-90
            `}
          >
            <span className="text-xs font-medium text-morandi-midnightBlue dark:text-white select-none">
              {bubble.label}
            </span>
            
            {/* Subtle inner glow */}
            <div className="absolute inset-2 rounded-full bg-white/20 blur-sm pointer-events-none" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
