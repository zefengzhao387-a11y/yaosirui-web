import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import path from "path";
import { config as loadEnv } from "dotenv";

// 使用 OpenAI 兼容 API（国内可用 DeepSeek / Moonshot 等），不再依赖 Gemini
function getEnv(name: string): string {
  let raw = process.env[name];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  try {
    loadEnv({ path: path.join(process.cwd(), ".env.local") });
    raw = process.env[name];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  } catch {
    // ignore
  }
  return "";
}

export async function POST(request: Request) {
  const apiKey = getEnv("OPENAI_API_KEY");
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "未配置 OPENAI_API_KEY",
        hint: "在 .env.local 中添加 OPENAI_API_KEY。可用 DeepSeek / Moonshot / OpenAI 等，见本地调试.md",
      },
      { status: 503 }
    );
  }

  const baseURL = getEnv("OPENAI_BASE_URL") || undefined;
  const model = getEnv("AI_POETIC_MODEL") || (baseURL?.includes("deepseek") ? "deepseek-chat" : "gpt-4o-mini");
  const openai = createOpenAI({ apiKey, baseURL: baseURL || undefined });

  let body: { colors?: string[]; tags?: string[]; mood?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const colors = body.colors ?? [];
  const tags = body.tags ?? [];
  const mood = body.mood ?? "怀旧";
  const elements = [...colors, ...tags].filter(Boolean);
  const elementStr = elements.length > 0 ? elements.join("、") : "时光与记忆";

  const prompt = `你是一位诗人。根据以下画面元素：${elementStr}，生成一段 20 字以内的${mood}诗意引言。只输出这一句话，不要引号、不要解释、不要换行。`;

  try {
    const { text } = await generateText({
      model: openai(model as "gpt-4o-mini"),
      prompt,
    });
    const quote = (text || "").trim().replace(/^[""]|[""]$/g, "");
    return NextResponse.json({ quote });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("poetic-quote error:", e);
    return NextResponse.json(
      {
        error: "生成失败",
        detail: message,
      },
      { status: 500 }
    );
  }
}
