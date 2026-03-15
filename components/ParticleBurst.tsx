"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const PARTICLE_COUNT = 24;
const PARTICLE_SIZE = 8;

interface ParticleBurstProps {
  /** 爆发中心（相对于容器） */
  x: number;
  y: number;
  color: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  vx: number;
  vy: number;
  angle: number;
}

export default function ParticleBurst({ x, y, color, onComplete }: ParticleBurstProps) {
  const [visible, setVisible] = useState(true);
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.6) * 12 - 4,
      angle: Math.random() * 360,
    }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 600);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x,
            y,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: x + p.vx * 18,
            y: y + p.vy * 18 + 80,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{
            duration: 0.55,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            marginLeft: -PARTICLE_SIZE / 2,
            marginTop: -PARTICLE_SIZE / 2,
            background: color,
            borderRadius: "50%",
            boxShadow: `0 0 10px ${color}`,
            transform: `rotate(${p.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
}
