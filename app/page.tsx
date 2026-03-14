"use client";

import { useState, useEffect } from "react";

const images = [
  {
    src: "photo1.jpg",
    alt: "美女打球",
  },
  {
    src: "photo2.jpg",
    alt: "美女自恋",
  },
  {
    src: "photo3.jpg",
    alt: "美女摸狗",
  },
  {
    src: "/photo4.jpg",
    alt: "美女写真",
  },
];

export default function Home() {
  const [message, setMessage] = useState<string>("加载中...");
  const [time, setTime] = useState<string>("");
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("请求失败"));

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("zh-CN"));
    }, 1000);

    const auto = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(auto);
    };
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const SLIDE_WIDTH = 380;
  const STEP = 300;
  const VIEWPORT_WIDTH = 900;
  const OFFSET_CENTER = (VIEWPORT_WIDTH - SLIDE_WIDTH) / 2;
  const translateX = -(current * STEP) + OFFSET_CENTER;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide text-slate-900 dark:text-slate-50 drop-shadow-sm">
            Hi! 姚思睿
          </h1>
        </div>
        <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            欢迎
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Next.js 15 · React 19 · TypeScript · Tailwind CSS
          </p>
          <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            {message}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            当前时间：{time || "—"}
          </p>
        </div>

        <div
          className="relative flex items-center justify-center overflow-hidden mx-auto w-full max-w-[900px]"
          style={{ width: VIEWPORT_WIDTH, height: 280 }}
        >
          <div
            className="absolute flex items-center"
            style={{
              height: 280,
              left: 0,
              transform: `translateX(${translateX}px)`,
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {images.map((img, index) => {
              const diff = index - current;
              const isCenter = diff === 0;
              const scale = isCenter ? 1 : 0.72;
              const opacity = isCenter ? 1 : 0.5;
              const z = isCenter ? 20 : 10;
              return (
                <div
                  key={img.src}
                  className="absolute rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-xl transition-all duration-500 ease-out cursor-pointer"
                  onClick={() => {
                    if (diff === -1) {
                      handlePrev();
                    } else if (diff === 1) {
                      handleNext();
                    }
                  }}
                  style={{
                    left: index * STEP,
                    width: SLIDE_WIDTH,
                    height: 280,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    opacity,
                    zIndex: z,
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
