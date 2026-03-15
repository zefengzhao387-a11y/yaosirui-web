"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEmotionFromText, getTheme, type EmotionKey } from "@/lib/emotion";
import EmotionBubble from "./EmotionBubble";
import ParticleBurst from "./ParticleBurst";

export interface DiaryEntry {
  id: string;
  /** 用于情感分析的摘要或标题 */
  summary: string;
  /** 点击气泡后展示的正文 */
  content: string;
}

type FilterEmotion = EmotionKey | "all";

const FILTER_OPTIONS: { value: FilterEmotion; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "joy", label: "欢快" },
  { value: "nostalgia", label: "怀念" },
  { value: "calm", label: "宁静" },
  { value: "sadness", label: "忧郁" },
  { value: "excitement", label: "激昂" },
  { value: "neutral", label: "平和" },
];

const SAMPLE_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    summary: "今天和朋友们去郊游，特别开心，笑了一整天",
    content: "阳光很好，我们在一片绿地里野餐。大家讲了很多过去的糗事，笑得肚子疼。这样的日子真想多来几次。",
  },
  {
    id: "2",
    summary: "翻到老照片，想起小时候的暑假",
    content: "那时候没有手机，只有蝉鸣和西瓜。奶奶摇着蒲扇，我们在院子里数星星。回忆起来心里暖暖的。",
  },
  {
    id: "3",
    summary: "一个人在家，泡了杯茶，很安静",
    content: "窗外下着小雨，房间里只有翻书声。什么都不用想，就这样待着就很好。",
  },
  {
    id: "4",
    summary: "项目终于上线了，激动得睡不着",
    content: "团队一起熬了几个月，看到成果的那一刻真的觉得值了。继续冲！",
  },
  {
    id: "5",
    summary: "有些事没能说出口，心里空落落的",
    content: "不是所有话都来得及说。有些遗憾，大概会留在心里很久吧。",
  },
];

/** 气泡在容器内的布局（百分比），略随机化 */
function bubbleLayout(index: number, total: number): { x: number; y: number; size: number } {
  const cols = 3;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const baseX = (col / cols) * 70 + 10 + (index % 5) * 2;
  const baseY = (row / Math.ceil(total / cols)) * 55 + 15 + (index % 3) * 4;
  const size = 72 + (index % 4) * 12;
  return { x: baseX, y: baseY, size };
}

export default function EmotionBubbles({
  entries: propEntries,
  fetchFromApi = true,
}: {
  entries?: DiaryEntry[] | null;
  /** 为 true 时尝试从 /api/memories?all=1 拉取用户记忆并转为气泡（未登录则用示例） */
  fetchFromApi?: boolean;
}) {
  const [entries, setEntries] = useState<DiaryEntry[]>(propEntries ?? SAMPLE_ENTRIES);
  const [filterEmotion, setFilterEmotion] = useState<FilterEmotion>("all");
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; color: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propEntries !== undefined && propEntries !== null) {
      setEntries(propEntries);
      return;
    }
    if (!fetchFromApi) {
      setEntries(SAMPLE_ENTRIES);
      return;
    }
    fetch("/api/memories?all=1")
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { memories?: { id: string; title: string; text: string }[] };
        const list = data.memories ?? [];
        setEntries(
          list.map((m) => ({
            id: m.id,
            summary: m.title || m.text?.slice(0, 80) || "",
            content: m.text || m.title || "",
          }))
        );
      })
      .catch(() => setEntries(SAMPLE_ENTRIES));
  }, [propEntries, fetchFromApi]);

  const filteredEntries =
    filterEmotion === "all"
      ? entries
      : entries.filter((e) => getEmotionFromText(e.summary) === filterEmotion);

  const handleBubbleClick = useCallback(
    (id: string, themeColor: string, event: React.MouseEvent) => {
      const bubbleRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const container = containerRef.current?.getBoundingClientRect();
      if (!container) return;
      const x = bubbleRect.left - container.left + bubbleRect.width / 2;
      const y = bubbleRect.top - container.top + bubbleRect.height / 2;
      setBurst({ x, y, color: themeColor });
      setPoppedId(id);
    },
    []
  );

  const handleBurstComplete = useCallback(() => {
    setBurst(null);
  }, []);

  const closeContent = useCallback(() => setPoppedId(null), []);

  const poppedEntry = poppedId ? entries.find((e) => e.id === poppedId) : null;
  const poppedTheme = poppedEntry ? getTheme(getEmotionFromText(poppedEntry.summary)) : null;

  return (
    <div className="w-full space-y-4">
      {/* 情感筛选：点击只保留该情感的气泡 */}
      <div className="flex flex-wrap justify-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilterEmotion(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterEmotion === opt.value
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full min-h-[520px] overflow-hidden bg-black/20 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-4xl font-serif text-white/5 tracking-[0.5em] uppercase">
            Emotion Field
          </span>
        </div>

        {/* 气泡层：仅渲染当前筛选情感 */}
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => {
            const emotion = getEmotionFromText(entry.summary) as EmotionKey;
            const theme = getTheme(emotion);
            const layout = bubbleLayout(index, filteredEntries.length);
            if (poppedId === entry.id) return null;
            return (
              <EmotionBubble
                key={entry.id}
                id={entry.id}
                theme={theme}
                size={layout.size}
                x={layout.x}
                y={layout.y}
                blobSeed={index * 7}
                onClick={(e) => handleBubbleClick(entry.id, theme.color, e)}
              />
            );
          })}
          </AnimatePresence>
        </div>

      {/* 粒子爆发层 */}
      <AnimatePresence>
        {burst && (
          <ParticleBurst
            x={burst.x}
            y={burst.y}
            color={burst.color}
            onComplete={handleBurstComplete}
          />
        )}
      </AnimatePresence>

      {/* 破裂后展示的日记正文 */}
      <AnimatePresence>
        {poppedEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-4 md:inset-8 flex items-center justify-center p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10"
          >
            <div className="max-w-lg w-full text-center">
              {poppedTheme && (
                <span className="inline-block text-sm font-serif text-morandi-sage tracking-widest mb-4">
                  {poppedTheme.label}
                </span>
              )}
              <p className="text-white/95 text-lg md:text-xl font-serif leading-relaxed mb-8">
                &ldquo;{poppedEntry.content}&rdquo;
              </p>
              <button
                type="button"
                onClick={closeContent}
                className="px-8 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
              >
                收起
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
