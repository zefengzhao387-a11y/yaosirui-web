import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const DEMO_USER_ID = "demo-local";

function getUserIdOrThrow(session: any) {
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") throw new Error("UNAUTHORIZED");
  return userId;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  let userId: string;
  try {
    userId = getUserIdOrThrow(session);
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const raw = await request.text();
  let body: any;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  // 本地演示账号：对 demo-mem-* 只做前端生效，不写库
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID && id.startsWith("demo-mem-")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.text === "string" ? body.text : "";
    const location = typeof body.location === "string" ? body.location : "";
    const url = typeof body.url === "string" ? body.url : "";
    if (!title) return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    return NextResponse.json({
      memory: { id, type: url ? "image" : "text", url, title, date: "", location, text },
    });
  }

  const existing = await prisma.memory.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : existing.title;
  const text = typeof body.text === "string" ? body.text : existing.content ?? "";
  const location = typeof body.location === "string" ? body.location : existing.location;
  const url = typeof body.url === "string" ? body.url : existing.imageUrl ?? "";

  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const updated = await prisma.memory.update({
    where: { id },
    data: {
      title,
      content: text,
      location: location || null,
      imageUrl: url || null,
    },
  });

  return NextResponse.json({
    memory: {
      id: updated.id,
      type: updated.imageUrl ? "image" : "text",
      url: updated.imageUrl ?? "",
      title: updated.title,
      date: updated.date.toISOString(),
      location: updated.location ?? "",
      text: updated.content ?? "",
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  let userId: string;
  try {
    userId = getUserIdOrThrow(session);
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  if (process.env.NODE_ENV !== "production" && userId === DEMO_USER_ID && id.startsWith("demo-mem-")) {
    return NextResponse.json({ ok: true });
  }
  const existing = await prisma.memory.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }
  await prisma.memory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

