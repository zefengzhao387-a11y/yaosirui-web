import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";
import path from "path";
import { config as loadEnv } from "dotenv";

// 本地 dev 下若 process.env 未注入，则直接从 .env.local 读取
function getApiKey(): string {
  let raw = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  try {
    loadEnv({ path: path.join(process.cwd(), ".env.local") });
    raw = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  } catch {
    // ignore
  }
  return "";
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "未配置 GOOGLE_GENERATIVE_AI_API_KEY",
        hint: "请在项目根目录 .env.local 中添加该变量并重启 npm run dev",
      },
      { status: 503 }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });

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
      model: google("gemini-1.5-flash"),
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
