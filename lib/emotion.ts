/**
 * 情感气泡：从文本到视觉的映射
 * 可后续替换为 Transformers.js 或 API 做情感识别
 */

export type EmotionKey = "joy" | "sadness" | "nostalgia" | "calm" | "excitement" | "neutral";

export interface EmotionTheme {
  color: string;
  glowColor: string;
  speed: number;
  scale: [number, number, number];
  label: string;
}

/** 情感与视觉/动画的映射 */
export const emotionThemes: Record<EmotionKey, EmotionTheme> = {
  joy: {
    color: "rgba(255, 223, 0, 0.55)",
    glowColor: "rgba(255, 223, 0, 0.4)",
    speed: 2,
    scale: [1, 1.12, 1],
    label: "欢快",
  },
  sadness: {
    color: "rgba(147, 161, 183, 0.5)",
    glowColor: "rgba(147, 161, 183, 0.35)",
    speed: 0.5,
    scale: [1, 1.04, 1],
    label: "忧郁",
  },
  nostalgia: {
    color: "rgba(173, 216, 230, 0.55)",
    glowColor: "rgba(173, 216, 230, 0.4)",
    speed: 0.7,
    scale: [1, 1.06, 1],
    label: "怀念",
  },
  calm: {
    color: "rgba(155, 176, 165, 0.55)",
    glowColor: "rgba(155, 176, 165, 0.4)",
    speed: 0.6,
    scale: [1, 1.05, 1],
    label: "宁静",
  },
  excitement: {
    color: "rgba(255, 182, 193, 0.6)",
    glowColor: "rgba(255, 182, 193, 0.45)",
    speed: 2.5,
    scale: [1, 1.15, 1],
    label: "激昂",
  },
  neutral: {
    color: "rgba(255, 255, 255, 0.12)",
    glowColor: "rgba(255, 255, 255, 0.15)",
    speed: 1,
    scale: [1, 1.08, 1],
    label: "平和",
  },
};

/** 简单关键词 → 情感得分（轻量，可替换为模型/API） */
const KEYWORDS: Record<EmotionKey, string[]> = {
  joy: ["开心", "快乐", "高兴", "幸福", "笑", "哈哈", "愉快", "欢", "喜", "乐"],
  sadness: ["难过", "伤心", "哭", "泪", "失落", "沮丧", "忧郁", "愁", "悲"],
  nostalgia: ["回忆", "想起", "以前", "当年", "曾经", "怀念", "旧", "老照片", "那年"],
  calm: ["安静", "平静", "宁静", "放松", "舒服", "惬意", "慢", "微风", "午后"],
  excitement: ["激动", "兴奋", "燃", "冲", "棒", "厉害", "爽", "嗨", "狂欢"],
  neutral: [],
};

/**
 * 将日记文本转化为主导情感（简单关键词匹配，可换为 Transformers.js / API）
 */
export function getEmotionFromText(text: string): EmotionKey {
  if (!text || !text.trim()) return "neutral";
  const t = text.trim().toLowerCase();
  const scores: Record<EmotionKey, number> = {
    joy: 0,
    sadness: 0,
    nostalgia: 0,
    calm: 0,
    excitement: 0,
    neutral: 0,
  };
  for (const [emotion, words] of Object.entries(KEYWORDS)) {
    if (emotion === "neutral") continue;
    for (const w of words) {
      if (t.includes(w)) scores[emotion as EmotionKey] += 1;
    }
  }
  const entries = Object.entries(scores) as [EmotionKey, number][];
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), ["neutral", 0] as [EmotionKey, number]);
  return best[1] > 0 ? best[0] : "neutral";
}

export function getTheme(emotion: EmotionKey): EmotionTheme {
  return emotionThemes[emotion];
}
