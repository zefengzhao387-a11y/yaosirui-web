"use client";

import React, { useEffect, useRef } from "react";

interface JournalBackgroundProps {
  emotionColor: string;
}

// 从 rgba(...) 中提取近似的不透明十六进制颜色
function normalizeColor(input: string): string {
  if (input.startsWith("#")) return input;
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) return "#ff9ad5";
  const parts = match[1].split(",").map((p) => parseFloat(p.trim()));
  const [r, g, b] = parts;
  const toHex = (n: number) => {
    const v = Math.max(0, Math.min(255, Math.round(n)));
    return v.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function JournalBackground({ emotionColor }: JournalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1.5;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // 星点
    const starsFar = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.4 + Math.random() * 0.8,
      twinkle: Math.random() * Math.PI * 2,
    }));
    const starsNear = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.9 + Math.random() * 1.4,
      twinkle: Math.random() * Math.PI * 2,
    }));

    // 两条贝塞尔曲线的控制点
    const makeCurve = (offsetY: number) => ({
      p0: { x: -width * 0.1, y: height * offsetY },
      p1: { x: width * 0.3, y: height * (offsetY - 0.18) },
      p2: { x: width * 0.7, y: height * (offsetY + 0.18) },
      p3: { x: width * 1.1, y: height * offsetY },
    });

    const curve1 = makeCurve(0.32);
    const curve2 = makeCurve(0.78);

    type Particle = { t: number; speed: number; curveIndex: 1 | 2; size: number; phase: number };
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i += 1) {
      particles.push({
        t: Math.random(),
        speed: 0.02 + Math.random() * 0.03,
        curveIndex: i % 2 === 0 ? 1 : 2,
        size: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const colorHex = normalizeColor(emotionColor);

    const evalCurve = (c: ReturnType<typeof makeCurve>, t: number): { x: number; y: number } => {
      const u = 1 - t;
      const x =
        u * u * u * c.p0.x +
        3 * u * u * t * c.p1.x +
        3 * u * t * t * c.p2.x +
        t * t * t * c.p3.x;
      const y =
        u * u * u * c.p0.y +
        3 * u * u * t * c.p1.y +
        3 * u * t * t * c.p2.y +
        t * t * t * c.p3.y;
      return { x, y };
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 背景渐变
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#050516");
      bgGrad.addColorStop(0.4, "#05010b");
      bgGrad.addColorStop(1, "#020814");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 远星
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      starsFar.forEach((s, i) => {
        const alpha = 0.3 + 0.25 * (1 + Math.sin(time / 1200 + s.twinkle + i));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // 近星
      ctx.globalAlpha = 1;
      starsNear.forEach((s, i) => {
        const alpha = 0.4 + 0.4 * (1 + Math.sin(time / 900 + s.twinkle + i * 1.7));
        ctx.globalAlpha = alpha;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        grad.addColorStop(0, "rgba(255,255,255,0.95)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 流光曲线本体
      const drawBeam = (c: ReturnType<typeof makeCurve>, thickness: number) => {
        const steps = 80;
        ctx.save();
        // 外层柔光
        ctx.lineWidth = thickness * 3;
        ctx.strokeStyle = `${colorHex}33`;
        ctx.beginPath();
        for (let i = 0; i <= steps; i += 1) {
          const t = i / steps;
          const { x, y } = evalCurve(c, t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 内层高光
        const grad = ctx.createLinearGradient(c.p0.x, c.p0.y, c.p3.x, c.p3.y);
        grad.addColorStop(0, `${colorHex}ff`);
        grad.addColorStop(0.5, `${colorHex}aa`);
        grad.addColorStop(1, `${colorHex}22`);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = grad;
        ctx.beginPath();
        for (let i = 0; i <= steps; i += 1) {
          const t = i / steps;
          const { x, y } = evalCurve(c, t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };

      drawBeam(curve1, 4);
      drawBeam(curve2, 3);

      // 粒子沿曲线运动
      ctx.save();
      particles.forEach((p, idx) => {
        p.t += p.speed * dt;
        if (p.t > 1) p.t -= 1;
        const curve = p.curveIndex === 1 ? curve1 : curve2;
        const { x, y } = evalCurve(curve, p.t);
        const pulse = 0.6 + 0.4 * Math.sin(time / 400 + p.phase + idx);
        const r = p.size * pulse;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(1, `${colorHex}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [emotionColor]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />;
}

