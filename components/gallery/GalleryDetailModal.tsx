"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WaveformIconStatic, WaveformIconActive } from "./WaveformIcon";
import type { GalleryItem } from "./GalleryCard";

type GalleryDetailModalProps = {
  item: GalleryItem | null;
  onClose: () => void;
};

export default function GalleryDetailModal({ item, onClose }: GalleryDetailModalProps) {
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    if (!item) return;
    setIsVoicePlaying(false);
  }, [item]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!item) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          layoutId={`gallery-card-${item.id}`}
          className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col bg-black/40 border border-white/20 shadow-2xl"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-video w-full flex-shrink-0">
            <Image
              src={item.url || "/placeholder.jpg"}
              alt={item.title}
              fill
              className="object-contain"
              unoptimized={item.url.startsWith("data:")}
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 px-4 py-2">
              {item.voiceUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsVoicePlaying((p) => !p)}
                    className="flex items-center gap-2 text-white/90 text-sm"
                  >
                    {isVoicePlaying ? (
                      <WaveformIconActive />
                    ) : (
                      <WaveformIconStatic />
                    )}
                    <span>{isVoicePlaying ? "播放中" : "语音旁白"}</span>
                  </button>
                  {/* 后续可挂载 HTML5 Audio 或 AudioContext 播放 item.voiceUrl */}
                </>
              ) : (
                <span className="flex items-center gap-2 text-white/60 text-sm">
                  <WaveformIconStatic />
                  暂无语音旁白
                </span>
              )}
            </div>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <p className="text-morandi-sage text-sm mb-1">
              {item.year}-{item.date}
              {item.location && ` · ${item.location}`}
            </p>
            <h2 className="text-2xl font-serif text-white mb-4">{item.title}</h2>
            {item.text && (
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {item.text}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
