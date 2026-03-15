"use client";

import { useMemo } from "react";

const BUBBLE_COUNT = 12;
const COLORS = [
  "rgba(253,245,230,0.04)",
  "rgba(155,176,165,0.05)",
  "rgba(212,165,165,0.04)",
  "rgba(173,216,230,0.04)",
];

export default function EmotionBubblesBackground() {
  const bubbles = useMemo(() => {
    return Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      return {
        left: `${(r * 100) % 85 + 5}%`,
        top: `${((i * 7919 + 7891) % 233280) / 233280 * 90 + 5}%`,
        size: 80 + (i % 4) * 40,
        color: COLORS[i % COLORS.length],
        duration: 25 + (i % 5) * 5,
        delay: i * 2,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes float-bubble {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          33% { transform: translate(8px, -12px) scale(1.05); opacity: 0.8; }
          66% { transform: translate(-5px, 8px) scale(0.95); opacity: 0.5; }
        }
        .emotion-bubble-bg {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          animation: float-bubble ease-in-out infinite;
        }
      `}</style>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="emotion-bubble-bg"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            backgroundColor: b.color,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
