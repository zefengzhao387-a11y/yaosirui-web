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
  "bg-morandi-sage/40",
  "bg-morandi-dustyPink/40",
  "bg-morandi-coolGray/40",
  "bg-morandi-warmBeige/40",
  "bg-white/10",
];

const glowColors = [
  "shadow-[0_0_20px_rgba(155,176,165,0.4)]",
  "shadow-[0_0_20px_rgba(212,165,165,0.4)]",
  "shadow-[0_0_20px_rgba(209,213,219,0.4)]",
  "shadow-[0_0_20px_rgba(220,208,192,0.4)]",
  "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
];

const labels = ["欢快", "怀念", "宁静", "忧郁", "激昂"];

export default function EmotionBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const newBubble: Bubble = {
        id: Date.now(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: 110, // Start below screen
        size: Math.random() * 60 + 60,
        color: colors[colorIndex],
        label: labels[Math.floor(Math.random() * labels.length)],
        duration: Math.random() * 10 + 12,
      };

      setBubbles((prev) => [...prev, newBubble]);

      // Remove bubble after animation
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, newBubble.duration * 1000);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-black/20 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h3 className="text-4xl font-serif text-white/5 tracking-[0.5em] uppercase select-none">
          Emotion Field
        </h3>
      </div>
      
      <AnimatePresence>
        {bubbles.map((bubble, index) => {
          const colorIdx = colors.indexOf(bubble.color);
          return (
            <motion.div
              key={bubble.id}
              initial={{ y: "120%", x: `${bubble.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: "-20%", 
                opacity: 1, 
                scale: 1,
                x: `${bubble.x + Math.sin(bubble.id) * 8}%` 
              }}
              exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
              transition={{ duration: bubble.duration, ease: "linear" }}
              onClick={() => popBubble(bubble.id)}
              style={{ width: bubble.size, height: bubble.size }}
              className={`
                absolute rounded-full cursor-pointer flex items-center justify-center
                ${bubble.color} backdrop-blur-md border border-white/10 ${glowColors[colorIdx]}
                hover:scale-110 transition-all active:scale-95 group
              `}
            >
              <span className="text-sm font-serif text-white/90 select-none tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {bubble.label}
              </span>
              
              {/* Animated inner glow */}
              <motion.div 
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-4 rounded-full bg-white/10 blur-md pointer-events-none" 
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
