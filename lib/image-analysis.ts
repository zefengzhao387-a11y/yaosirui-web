/**
 * 客户端图像分析：主色（Color Thief）+ 场景标签（Transformers.js image-to-text）
 * 在浏览器中运行，减轻服务端负载。
 */

export type ImageAnalysisResult = {
  dominantColor: { r: number; g: number; b: number };
  dominantColorHex: string;
  tags: string[];
  /** 冷暖倾向：warm | cool | neutral */
  colorMood: "warm" | "cool" | "neutral";
};

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

/** 根据 RGB 粗略判断冷暖 */
function getColorMood(r: number, g: number, b: number): "warm" | "cool" | "neutral" {
  const warmth = r * 1.2 - b * 0.8 + g * 0.3;
  if (warmth > 40) return "warm";
  if (warmth < -30) return "cool";
  return "neutral";
}

/** 从图片 URL 或 data URL 提取主色（Color Thief） */
export async function getDominantColor(source: string): Promise<{ r: number; g: number; b: number; hex: string }> {
  const { getColor } = await import("colorthief");
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = source;
  });
  const color = await getColor(img);
  if (!color) return { r: 128, g: 128, b: 128, hex: "#808080" };
  const rgb = color.rgb?.() ?? { r: 128, g: 128, b: 128 };
  const r = rgb.r ?? 128;
  const g = rgb.g ?? 128;
  const b = rgb.b ?? 128;
  const hex = typeof color.hex === "function" ? color.hex() : rgbToHex(r, g, b);
  return { r, g, b, hex };
}

/** 使用 Transformers.js 的 image-to-text 获取图像描述，再抽成简短标签 */
export async function getImageTags(source: string): Promise<string[]> {
  try {
    const { pipeline } = await import("@xenova/transformers");
    const pipe = await pipeline("image-to-text", "Xenova/vit-gpt2-image-captioning", {
      progress_callback: () => {},
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = source;
    });
    const out = await pipe(source, { max_new_tokens: 30 });
    const text = Array.isArray(out) ? (out[0]?.generated_text ?? out[0] ?? "") : (out?.generated_text ?? String(out ?? ""));
    if (!text || typeof text !== "string") return [];
    // 英文描述转成简短中文标签（可后续用 LLM 或简单映射）
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const tagMap: Record<string, string> = {
      sun: "落日",
      sunset: "落日",
      beach: "海滩",
      sea: "大海",
      ocean: "大海",
      sky: "天空",
      flower: "花朵",
      tree: "树木",
      person: "人物",
      people: "人物",
      city: "城市",
      street: "街道",
      food: "美食",
      dog: "小狗",
      cat: "猫",
      mountain: "山峦",
      water: "水面",
      night: "夜晚",
      day: "白天",
      indoor: "室内",
      outdoor: "户外",
    };
    const tags: string[] = [];
    const seen = new Set<string>();
    for (const w of words) {
      const t = tagMap[w] ?? w;
      if (!seen.has(t)) {
        seen.add(t);
        tags.push(t);
      }
    }
    return tags.slice(0, 6);
  } catch {
    return [];
  }
}

/** 一次性分析：主色 + 标签 + 冷暖 */
export async function analyzeImage(source: string): Promise<ImageAnalysisResult> {
  const { r, g, b, hex } = await getDominantColor(source);
  const tags = await getImageTags(source);
  return {
    dominantColor: { r, g, b },
    dominantColorHex: hex,
    tags: tags.length > 0 ? tags : ["画面"],
    colorMood: getColorMood(r, g, b),
  };
}
