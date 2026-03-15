import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const DEMO_USER_ID = "demo-local";

function getUserIdOrThrow(session: any) {
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") throw new Error("UNAUTHORIZED");
  return userId;
}

export async function GET() {
  const session = await getSession();
  let userId: string;
  try {
    userId = getUserIdOrThrow(session);
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 本地演示账号不连库，返回空列表
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID) {
    return NextResponse.json({ years: [] });
  }

  const summaries = await prisma.yearSummary.findMany({
    where: { userId },
    orderBy: { year: "asc" },
  });

  return NextResponse.json({
    years: summaries.map((s) => ({
      year: s.year,
      title: s.title,
      summary: s.summary,
      highlights: [s.highlight1, s.highlight2].filter(Boolean),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  let userId: string;
  try {
    userId = getUserIdOrThrow(session);
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const raw = await request.text();
  let body: any;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const year = String(body.year ?? "").trim();
  const title = String(body.title ?? "").trim();
  const summary = String(body.summary ?? "");
  const highlights = Array.isArray(body.highlights) ? body.highlights : [];
  const highlight1 = typeof highlights[0] === "string" ? highlights[0] : null;
  const highlight2 = typeof highlights[1] === "string" ? highlights[1] : null;

  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: "year 必须是 4 位数字" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  // 本地演示账号无法写入数据库，给出明确提示
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID) {
    return NextResponse.json(
      { error: "本地演示账号仅可浏览，无法创建或修改。请用真实账号登录或在公网注册后使用。" },
      { status: 400 }
    );
  }

  const saved = await prisma.yearSummary.upsert({
    where: { userId_year: { userId, year } },
    create: { userId, year, title, summary, highlight1, highlight2 },
    update: { title, summary, highlight1, highlight2 },
  });

  return NextResponse.json({
    year: {
      year: saved.year,
      title: saved.title,
      summary: saved.summary,
      highlights: [saved.highlight1, saved.highlight2].filter(Boolean),
    },
  });
}
