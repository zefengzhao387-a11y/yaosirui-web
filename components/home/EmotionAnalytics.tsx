"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getEmotionFromText, getTheme, type EmotionKey } from "@/lib/emotion";

type EmotionStats = {
  dominant: EmotionKey;
  gradient: string;
  tags: { tag: string; count: number }[];
} | null;

const FALLBACK_GRADIENT = "linear-gradient(135deg, rgba(155,176,165,0.25) 0%, rgba(25,25,112,0.2) 100%)";
const JOY_GRADIENT = "linear-gradient(135deg, rgba(253,245,230,0.35) 0%, rgba(255,223,0,0.15) 50%, rgba(253,245,230,0.2) 100%)";
const NOSTALGIA_GRADIENT = "linear-gradient(135deg, rgba(155,176,165,0.3) 0%, rgba(25,25,112,0.25) 100%)";
const CALM_GRADIENT = "linear-gradient(135deg, rgba(155,176,165,0.35) 0%, rgba(211,213,219,0.2) 100%)";

function getGradientForEmotion(emotion: EmotionKey): string {
  switch (emotion) {
    case "joy":
      return JOY_GRADIENT;
    case "nostalgia":
      return NOSTALGIA_GRADIENT;
    case "calm":
      return CALM_GRADIENT;
    default:
      return FALLBACK_GRADIENT;
  }
}

export default function EmotionAnalytics() {
  const [data, setData] = useState<EmotionStats>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/memories?all=1")
      .then((r) => (r.ok ? r.json() : { memories: [] }))
      .then((body: { memories?: { text?: string; title?: string; tags?: string[] }[] }) => {
        if (!isMounted) return;
        const memories = body.memories ?? [];
        if (memories.length === 0) {
          setData({
            dominant: "neutral",
            gradient: FALLBACK_GRADIENT,
            tags: [],
          });
          return;
        }
        const emotionCounts: Record<EmotionKey, number> = {
          joy: 0,
          sadness: 0,
          nostalgia: 0,
          calm: 0,
          excitement: 0,
          neutral: 0,
        };
        const tagCount: Record<string, number> = {};
        for (const m of memories) {
          const text = [m.title, m.text].filter(Boolean).join(" ") || "";
          const emotion = getEmotionFromText(text);
          emotionCounts[emotion]++;
          for (const t of m.tags ?? []) {
            if (t && typeof t === "string") tagCount[t] = (tagCount[t] ?? 0) + 1;
          }
        }
        const dominant = (Object.entries(emotionCounts) as [EmotionKey, number][]).reduce(
          (a, b) => (b[1] > a[1] ? b : a),
          ["neutral", 0] as [EmotionKey, number]
        )[0];
        const tags = Object.entries(tagCount)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setData({
          dominant,
          gradient: getGradientForEmotion(dominant),
          tags,
        });
      })
      .catch(() => {
        if (isMounted) setData({ dominant: "neutral", gradient: FALLBACK_GRADIENT, tags: [] });
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const gradient = data?.gradient ?? FALLBACK_GRADIENT;
  const label = data ? getTheme(data.dominant).label : "平和";
  const tags = data?.tags ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-[2rem] overflow-hidden border border-white/10 p-6 md:p-8 min-h-[220px]"
      style={{ background: gradient, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <h3 className="text-xl font-serif text-white mb-4">情感状态墙</h3>
      <p className="text-white/70 text-sm mb-6">
        近期记忆基调：<span className="font-medium text-white/90">{label}</span>
      </p>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-white/50 text-xs">高频标签</span>
          {tags.map(({ tag, count }, i) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs"
            >
              {tag}
              {count > 1 && <span className="text-white/50 ml-1">×{count}</span>}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-white/40 text-sm">添加更多记忆后，将展示 AI 提取的高频标签</p>
      )}
    </motion.section>
  );
}
