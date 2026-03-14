"use client";

import React, { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Music } from "lucide-react";
import Link from "next/link";

const mockMemories = [
  { id: 1, type: "image", url: "/photo1.jpg", title: "春日漫步", date: "04-12", location: "中央公园", text: "那是我们第一次一起看樱花。" },
  { id: 2, type: "image", url: "/photo2.jpg", title: "生日派对", date: "06-25", location: "秘密花园", text: "吹灭蜡烛那一刻，许下的愿望现在实现了吗？" },
  { id: 3, type: "image", url: "/photo3.jpg", title: "海边日落", date: "08-15", location: "黄金海岸", text: "夕阳把海面染成了金色。" },
  { id: 4, type: "image", url: "/photo4.jpg", title: "冬日暖阳", date: "12-24", location: "书店一角", text: "一杯热咖啡，一本书，和你。" },
  { id: 5, type: "text", title: "深夜随笔", date: "11-02", text: "时间过得好快，转眼又是一年。这一年的成长，比过去十年都要多。" },
  { id: 6, type: "image", url: "/photo1.jpg", title: "老照片", date: "02-14", location: "家中", text: "翻出了以前的照片，感触良多。" },
];

export default function ClusterPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = use(params);

  return (
    <main className="min-h-screen bg-morandi-cream dark:bg-morandi-midnightBlue p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/timeline" className="flex items-center gap-2 text-morandi-sage hover:text-morandi-midnightBlue transition-colors group">
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            返回星空
          </Link>
          <div className="text-right">
            <h1 className="text-6xl font-serif text-morandi-midnightBlue dark:text-morandi-cream">{year}</h1>
            <p className="text-morandi-sage uppercase tracking-widest text-sm">Memory Cluster</p>
          </div>
        </div>

        {/* Memory Grid (Bento Style) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {mockMemories.map((memory, idx) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid glass rounded-3xl overflow-hidden border border-morandi-sage/20 hover:shadow-2xl transition-all group"
            >
              {memory.type === "image" && (
                <div className="relative aspect-auto overflow-hidden">
                  <img src={memory.url} alt={memory.title} className="w-full group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-morandi-midnightBlue shadow-sm">
                      {memory.date}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif text-morandi-midnightBlue dark:text-morandi-cream">{memory.title}</h3>
                  <div className="flex gap-2">
                    <MapPin size={14} className="text-morandi-sage" />
                    <span className="text-xs text-morandi-sage">{memory.location || "未知地点"}</span>
                  </div>
                </div>
                
                <p className="text-sm text-morandi-midnightBlue/70 dark:text-morandi-cream/70 leading-relaxed italic">
                  "{memory.text}"
                </p>

                <div className="pt-4 flex items-center gap-4 border-t border-morandi-sage/10">
                  <button className="flex items-center gap-2 text-xs font-bold text-morandi-sage hover:text-morandi-midnightBlue transition-colors">
                    <Music size={14} /> 播放旁白
                  </button>
                  <button className="text-xs font-bold text-morandi-sage hover:text-morandi-midnightBlue transition-colors">
                    详情
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
