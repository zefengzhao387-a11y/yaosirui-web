"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutGrid, Rows3 } from "lucide-react";
import Starfield from "@/components/Starfield";
import GalleryCard, { type GalleryItem } from "@/components/gallery/GalleryCard";
import GalleryDetailModal from "@/components/gallery/GalleryDetailModal";
import MiniTimeline from "@/components/gallery/MiniTimeline";

function toMonthDay(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/** Bento：前几项大格（2x2），其余 1x1 */
function getBentoSpan(index: number, total: number): { row: number; col: number } {
  if (total <= 4) return { row: 1, col: 1 };
  if (index < 2) return { row: 2, col: 2 };
  return { row: 1, col: 1 };
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [layoutMode, setLayoutMode] = useState<"bento" | "waterfall">("bento");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/memories?all=1")
      .then((r) => (r.ok ? r.json() : { memories: [] }))
      .then((data: { memories?: { id: string; title: string; date: string; location?: string; text?: string; url: string; type?: string }[] }) => {
        if (!isMounted) return;
        const memories = data.memories ?? [];
        const imageOnly = memories.filter((m) => m.type === "image" || m.url);
        const list: GalleryItem[] = imageOnly.map((m: { id: string; title: string; date: string; year?: string; location?: string; text?: string; url: string }) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          location: m.location,
          text: m.text,
          url: m.url,
          voiceUrl: null,
          year: m.year ?? new Date().getFullYear().toString(),
        }));
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const years = Array.from(new Set(items.map((i) => i.year))).sort();

  return (
    <main className="relative min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <Starfield />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-morandi-sage hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <h1 className="text-xl font-serif">时空影廊</h1>
          <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setLayoutMode("bento")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                layoutMode === "bento" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
              title="大尺寸 Bento 模式"
            >
              <LayoutGrid className="w-4 h-4" />
              Bento
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("waterfall")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                layoutMode === "waterfall" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
              title="紧凑瀑布流"
            >
              <Rows3 className="w-4 h-4" />
              瀑布流
            </button>
          </div>
        </header>

        <div className="px-4 py-4">
          {years.length > 0 && (
            <MiniTimeline
              years={years}
              activeYear={null}
              scrollContainerRef={scrollContainerRef}
            />
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="px-4 pb-24 overflow-y-auto"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24 text-white/50">
              加载中…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-white/60">
              <p className="mb-4">暂无照片记忆</p>
              <Link
                href="/timeline"
                className="text-morandi-sage hover:text-white transition-colors"
              >
                去时空轴添加记忆
              </Link>
            </div>
          ) : layoutMode === "bento" ? (
            <div
              className="grid gap-4 max-w-6xl mx-auto"
              style={{
                gridTemplateColumns: "repeat(4, 1fr)",
                gridAutoRows: "minmax(160px, auto)",
              }}
            >
              {items
                .filter((item) => item.id !== selectedItem?.id)
                .map((item, i) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    layoutMode="bento"
                    span={getBentoSpan(i, items.length)}
                    onOpen={setSelectedItem}
                    onLongPressPoetic={() => {}}
                  />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {items.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  layoutMode="waterfall"
                  onOpen={setSelectedItem}
                  onLongPressPoetic={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <GalleryDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
