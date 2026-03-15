"use client";

import { motion } from "framer-motion";
import type { EmotionTheme } from "@/lib/emotion";

interface EmotionBubbleProps {
  id: string;
  theme: EmotionTheme;
  size: number;
  x: number;
  y: number;
  onClick: (e: React.MouseEvent) => void;
  /** 液态感 blob 形状，随时间微变 */
  blobSeed?: number;
}

export default function EmotionBubble({
  id,
  theme,
  size,
  x,
  y,
  onClick,
  blobSeed = 0,
}: EmotionBubbleProps) {
  const duration = 2.5 / theme.speed;
  const borderRadius = `40% 60% 60% 40% / 60% 30% 70% ${40 + (blobSeed % 30)}%`;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        layoutId={id}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{
          opacity: 1,
          scale: theme.scale as [number, number, number],
          y: [0, -20, 0],
          borderRadius: [
            borderRadius,
            `50% 50% 50% 50% / 50% 50% 50% 50%`,
            borderRadius,
          ],
        }}
        transition={{
          y: { duration, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: theme.speed * 0.8, repeat: Infinity, ease: "easeInOut" },
          borderRadius: { duration: duration * 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
        exit={{
          opacity: 0,
          scale: 2.5,
          filter: "blur(18px)",
          transition: { duration: 0.35 },
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(10);
          }
          onClick(e);
        }}
        style={{
          width: size,
          height: size,
          background: theme.color,
          boxShadow: `0 0 28px ${theme.glowColor}`,
        }}
        className="absolute inset-0 cursor-pointer flex items-center justify-center backdrop-blur-md border border-white/20 hover:border-white/40 transition-colors pointer-events-auto"
      >
        <span className="text-sm font-serif text-white/90 select-none tracking-wider drop-shadow-md">
          {theme.label}
        </span>
        {/* 内层光晕 */}
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.85, 1.02, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[15%] rounded-full bg-white/20 blur-md pointer-events-none"
        />
      </motion.div>
    </div>
  );
}
