import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const DEMO_USER_ID = "demo-local";

function getUserIdOrThrow(session: any) {
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") throw new Error("UNAUTHORIZED");
  return userId;
}

function toMonthDay(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function parseMonthDay(year: string, monthDay: string) {
  const [mStr, dStr] = monthDay.split("-");
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Number(year), m - 1, d, 12, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}


export async function GET(request: Request) {
  const session = await getSession();
  let userId: string;
  try {
    userId = getUserIdOrThrow(session);
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 本地演示账号：不连库，直接返回空列表；公网不受影响
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID) {
    return NextResponse.json({ memories: [] });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year") ?? "";
  const monthDay = url.searchParams.get("date");
  const all = url.searchParams.get("all") === "1";

  // 情感气泡用：拉取全部记忆（不限年份）
  if (all) {
    const list = await prisma.memory.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 100,
    });
    return NextResponse.json({
      memories: list.map((m) => ({
        id: m.id,
        type: m.imageUrl ? "image" : "text",
        url: m.imageUrl ?? "",
        title: m.title,
        date: toMonthDay(m.date),
        year: String(m.date.getFullYear()),
        location: m.location ?? "",
        text: m.content ?? "",
      })),
    });
  }

  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: "缺少 year" }, { status: 400 });
  }

  const start = new Date(Number(year), 0, 1, 0, 0, 0);
  const end = new Date(Number(year) + 1, 0, 1, 0, 0, 0);

  const where: any = {
    userId,
    date: {
      gte: start,
      lt: end,
    },
  };

  if (monthDay) {
    const dt = parseMonthDay(year, monthDay);
    if (!dt) {
      return NextResponse.json({ error: "date 格式应为 MM-DD" }, { status: 400 });
    }
    const next = new Date(dt);
    next.setDate(next.getDate() + 1);
    where.date = { gte: dt, lt: next };
  }

  const list = await prisma.memory.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    memories: list.map((m) => ({
      id: m.id,
      type: m.imageUrl ? "image" : "text",
      url: m.imageUrl ?? "",
      title: m.title,
      date: toMonthDay(m.date),
      location: m.location ?? "",
      text: m.content ?? "",
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
  const date = String(body.date ?? "").trim();
  const title = String(body.title ?? "").trim();
  const text = typeof body.text === "string" ? body.text : "";
  const location = typeof body.location === "string" ? body.location : null;
  const url = typeof body.url === "string" ? body.url : "";

  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: "year 必须是 4 位数字" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  const dt = parseMonthDay(year, date);
  if (!dt) {
    return NextResponse.json({ error: "date 格式应为 MM-DD" }, { status: 400 });
  }

  // 本地演示账号：不写库，返回假数据供前端展示；公网不受影响
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID) {
    const fakeId = `demo-mem-${Date.now()}`;
    return NextResponse.json(
      {
        memory: {
          id: fakeId,
          type: url ? "image" : "text",
          url: url || "",
          title,
          date,
          location: location ?? "",
          text,
        },
      },
      { status: 201 }
    );
  }

  const created = await prisma.memory.create({
    data: {
      title,
      content: text,
      date: dt,
      imageUrl: url || null,
      location,
      userId,
    },
  });

  return NextResponse.json(
    {
      memory: {
        id: created.id,
        type: created.imageUrl ? "image" : "text",
        url: created.imageUrl ?? "",
        title: created.title,
        date: toMonthDay(created.date),
        location: created.location ?? "",
        text: created.content ?? "",
      },
    },
    { status: 201 }
  );
}
