/**
 * 氛围匹配：根据画面色调与情感生成的关键词匹配音乐风格
 * 预设情感-曲风映射，可后续接入 Spotify / FreeSound API
 */

export type BGMGenre =
  | "lofi"
  | "folk"
  | "ambient"
  | "piano"
  | "acoustic"
  | "jazz"
  | "cinematic"
  | "nature";

export interface BGMRecommendation {
  genre: BGMGenre;
  label: string;
  description: string;
}

const GENRES: Record<BGMGenre, { label: string; description: string }> = {
  lofi: { label: "Lo-fi 轻快", description: "温暖、颗粒感、适合回忆" },
  folk: { label: "轻快民谣", description: "自然、清新、叙事感" },
  ambient: { label: "环境音", description: "氛围、空间感" },
  piano: { label: "极简钢琴", description: "安静、独处、沉思" },
  acoustic: { label: "原声吉他", description: "温暖、私密" },
  jazz: { label: "爵士", description: "城市、夜晚、松弛" },
  cinematic: { label: "电影感", description: "宏大、叙事" },
  nature: { label: "自然白噪音", description: "海浪、森林、雨声" },
};

/** 颜色冷暖 + 标签关键词 → 推荐曲风 */
export function recommendBGM(
  colorMood: "warm" | "cool" | "neutral",
  tags: string[]
): BGMRecommendation {
  const tagStr = tags.join(" ").toLowerCase();
  const hasNature =
    /落日|海滩|大海|天空|花朵|树木|山峦|水面|户外|自然|sun|beach|sea|sky|flower|tree|mountain|water|outdoor/i.test(
      tagStr
    );
  const hasLonely =
    /夜晚|独处|孤独|夜|night|alone|empty/i.test(tagStr) ||
    tags.some((t) => /夜|独|空/i.test(t));
  const hasCity = /城市|街道|室内|city|street|indoor/i.test(tagStr);

  if (colorMood === "warm" && hasNature) {
    return { genre: "lofi", ...GENRES.lofi };
  }
  if (colorMood === "warm" && (hasNature || tags.length > 0)) {
    return { genre: "folk", ...GENRES.folk };
  }
  if (colorMood === "cool" && hasLonely) {
    return { genre: "ambient", ...GENRES.ambient };
  }
  if (colorMood === "cool" || hasLonely) {
    return { genre: "piano", ...GENRES.piano };
  }
  if (hasCity) {
    return { genre: "jazz", ...GENRES.jazz };
  }
  if (hasNature) {
    return { genre: "nature", ...GENRES.nature };
  }
  if (colorMood === "warm") {
    return { genre: "acoustic", ...GENRES.acoustic };
  }
  return { genre: "ambient", ...GENRES.ambient };
}
