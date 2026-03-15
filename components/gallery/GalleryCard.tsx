"use client";

import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { WaveformIconStatic } from "./WaveformIcon";

export type GalleryItem = {
  id: string;
  title: string;
  date: string;
  location?: string;
  text?: string;
  url: string;
  voiceUrl?: string | null;
  year: string;
};

type GalleryCardProps = {
  item: GalleryItem;
  layoutMode: "bento" | "waterfall";
  span?: { row: number; col: number };
  onOpen: (item: GalleryItem) => void;
  onLongPressPoetic?: (item: GalleryItem) => void;
};

const LONG_PRESS_MS = 600;

export default function GalleryCard({
  item,
  layoutMode,
  span = { row: 1, col: 1 },
  onOpen,
  onLongPressPoetic,
}: GalleryCardProps) {
  const [poeticPreview, setPoeticPreview] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimation();

  const handlePointerDown = useCallback(() => {
    if (!onLongPressPoetic) return;
    longPressTimer.current = setTimeout(async () => {
      longPressTimer.current = null;
      try {
        const res = await fetch("/api/poetic-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tags: [],
            mood: "怀旧",
            colors: [],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.quote) {
          setPoeticPreview(data.quote);
          await controls.start({ scale: 1.02 });
          setTimeout(() => setPoeticPreview(null), 4000);
        }
      } catch {
        setPoeticPreview("长按可生成诗意引言");
        setTimeout(() => setPoeticPreview(null), 2000);
      }
    }, LONG_PRESS_MS);
  }, [onLongPressPoetic, controls]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const isBento = layoutMode === "bento";

  return (
    <motion.div
      layout
      layoutId={isBento ? `gallery-card-${item.id}` : undefined}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        ...(isBento
          ? { gridRow: `span ${span.row}`, gridColumn: `span ${span.col}` }
          : {}),
        backgroundColor: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(item)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      animate={controls}
    >
      <div className="relative w-full h-full min-h-[180px] aspect-[4/3]">
        <Image
          src={item.url || "/placeholder.jpg"}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={item.url.startsWith("data:")}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
          }}
        />
        <div className="absolute bottom-2 left-2 right-10">
          <p className="text-white text-sm font-medium truncate drop-shadow-md">
            {item.title}
          </p>
          <p className="text-white/70 text-xs">{item.year}-{item.date}</p>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1">
          <WaveformIconStatic className="opacity-90" />
        </div>
      </div>
      {poeticPreview && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute inset-x-2 bottom-2 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-2 text-white/95 text-xs italic"
        >
          {poeticPreview}
        </motion.div>
      )}
    </motion.div>
  );
}
