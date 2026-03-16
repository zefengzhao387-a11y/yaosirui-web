"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getEmotionFromText, getTheme } from "@/lib/emotion";
import Starfield from "@/components/Starfield";

function formatToday() {
  const d = new Date();
  const year = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { year, md: `${mm}-${dd}` };
}

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState<string>(() => {
    const { md } = formatToday();
    return md;
  });
  const [stampPressKey, setStampPressKey] = useState(0);
  const [inlineImages, setInlineImages] = useState<string[]>([]);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const emotionKey = getEmotionFromText(content || title);
  const theme = getTheme(emotionKey);

  useEffect(() => {
    if (!savedToast) return;
    const id = setTimeout(() => setSavedToast(null), 2500);
    return () => clearTimeout(id);
  }, [savedToast]);

  const handleSave = async () => {
    const trimmedTitle = title.trim() || "无题心语";
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      alert("请先写一点心语再保存。");
      return;
    }
    const { year } = formatToday();
    const md = /^\d{2}-\d{2}$/.test(dateInput.trim()) ? dateInput.trim() : formatToday().md;
    setDateInput(md);
    setSaving(true);
    // 触发印章按压动画
    setStampPressKey((k) => k + 1);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          date: md,
          title: trimmedTitle,
          text: trimmedContent,
          location: null,
          url: "",
        }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // ignore non-JSON
      }
      if (!res.ok) {
        alert(data?.error || `保存失败 (${res.status})`);
        return;
      }
      setSavedToast("已保存到你的时空记忆中。");
    } catch {
      alert("网络异常，保存失败，请稍后再试。");
    } finally {
      setSaving(false);
    }
  };

  // 左侧纸张背景也跟随情绪明显变化
  const cardBg = (() => {
    switch (emotionKey) {
      case "joy":
        return "#fdf2d8"; // 暖黄
      case "sadness":
        return "#d6dde8"; // 冷蓝灰
      case "nostalgia":
        return "#d8e6f0"; // 淡蓝
      case "calm":
        return "#e3f0e8"; // 淡绿
      case "excitement":
        return "#fbe0ea"; // 粉红
      case "neutral":
      default:
        return "#f9f4e8"; // 原始纸色
    }
  })();

  return (
    <main className="relative min-h-screen bg-[#050514] text-white overflow-hidden">
      {/* 使用与主页一致的星空背景 */}
      <Starfield />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16 flex flex-col gap-8">
        <header className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-morandi-sage hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回我的主页
          </Link>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Heart Bottle</p>
            <h1 className="text-2xl font-serif">心语瓶 · 纸上密语</h1>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 左：编辑区（纸质手账） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-black/20"
            style={{ backgroundColor: cardBg, transition: "background-color 0.6s ease" }}
          >
            <div
              className="absolute inset-0 opacity-25 pointer-events-none mix-blend-multiply"
              style={{
                backgroundImage: "url(/textures/paper-fiber.png)",
                backgroundSize: "600px 600px",
                backgroundColor: "rgba(0,0,0,0.03)",
              }}
            />
            <div className="relative px-6 pt-6 pb-4 flex items-center justify-between">
              <input
                className="bg-transparent border-none outline-none text-lg font-serif text-black placeholder:text-black/40 flex-1"
                placeholder="给这页心语起个标题…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span
                className="ml-3 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: theme.color, color: "rgba(0,0,0,0.8)" }}
              >
                {theme.label}
              </span>
            </div>
            <div className="relative px-6 pb-6">
              <textarea
                className="w-full h-64 md:h-72 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-black/90 placeholder:text-black/35 font-sans"
                placeholder={
                  "像在纸质手账上写字那样，把今天的心声留在这里…\n\n支持 Markdown：# 标题、**加粗**、> 引用 等。"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] text-black/60 rotate-[-8deg] select-none">
                <span
                  className="px-3 py-1 rounded-full border border-black/20 bg-black/5 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                >
                  <input
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    maxLength={5}
                    className="bg-transparent border-none outline-none text-[10px] tracking-[0.3em] text-black/70 w-16 text-center"
                    placeholder="MM-DD"
                  />
                </span>
                <span className="text-[10px] tracking-[0.2em] text-black/40">
                  18°C · 阴
                </span>
              </div>
              <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] text-black/60">
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const url = String(reader.result || "");
                      setInlineImages((prev) => {
                        const index = prev.length;
                        const token = `inline-image-${index}`;
                        const mdImage = `\n![心语插图](${token})`;
                        setContent((prevContent) =>
                          prevContent.includes(mdImage) ? prevContent : prevContent + mdImage
                        );
                        return [...prev, url];
                      });
                    };
                    reader.readAsDataURL(file);
                    // 允许重复选择同一文件
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-black/20 bg-black/5 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] hover:bg-black/10 transition-colors"
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  + 添加图片
                </button>
                <span className="text-[10px] tracking-[0.15em] text-black/45">
                  （添加图片到正文）
                </span>
              </div>
            </div>
          </motion.div>

          {/* 右：Markdown 预览 + 印章区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Preview</p>
              <motion.div
                key={stampPressKey}
                initial={{ scale: 0.8, rotate: -8, opacity: 0.6, y: -4 }}
                animate={{ scale: 1, y: 0, rotate: -5, opacity: 1 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 20 }}
                className="px-4 py-1 rounded-full border border-red-500/60 text-[10px] text-red-400/90 bg-red-500/10 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              >
                {dateInput || formatToday().md} · 心情印章
              </motion.div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 max-h-80 text-sm leading-relaxed text-white/90 text-left">
              {content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-serif mb-3 border-b border-white/10 pb-1" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-serif mb-2 mt-3" {...props} />
                    ),
                    p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-white/90" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="relative border-l-4 border-morandi-sage/70 pl-3 py-2 my-3 bg-white/5 rounded-r-xl text-white/80 italic before:absolute before:-top-2 before:left-2 before:h-4 before:w-10 before:bg-morandi-sage/20 before:rotate-[-8deg] before:rounded-sm before:shadow-sm"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                    code: ({ node, ...props }) => (
                      <code
                        className="px-1 py-0.5 rounded bg-white/10 text-[0.8em]"
                        {...props}
                      />
                    ),
                    img: ({ node, ...props }) => {
                      const rawSrc = (props as any).src as string | undefined;
                      if (!rawSrc) return null;

                      let src = rawSrc;
                      if (rawSrc.startsWith("inline-image-")) {
                        const index = Number(rawSrc.replace("inline-image-", ""));
                        if (Number.isFinite(index) && inlineImages[index]) {
                          src = inlineImages[index];
                        } else {
                          return null;
                        }
                      }

                      // 使用 span 而不是 div，避免成为 <p> 的非法子元素
                      return (
                        <span className="inline-block my-3">
                          <span className="relative inline-block rounded-2xl border border-white/15 bg-black/40 overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.5)] before:absolute before:-top-2 before:left-4 before:h-5 before:w-12 before:bg-morandi-warmBeige/60 before:rotate-[-12deg] before:shadow-md before:rounded-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="max-h-72 object-contain" src={src} alt={(props as any).alt || ""} />
                          </span>
                        </span>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-white/40 text-xs">右侧将实时展示你的 Markdown 排版效果。</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-morandi-cream disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_18px_rgba(255,255,255,0.25)]"
            >
              <Save className="w-4 h-4" />
              {saving ? "保存中…" : "保存心语"}
            </button>
          </motion.div>
        </section>

        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/80 border border-white/15 text-sm text-white/90 backdrop-blur-xl shadow-lg"
            >
              {savedToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

