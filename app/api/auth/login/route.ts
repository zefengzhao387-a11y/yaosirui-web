import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let parsed: any;
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      return NextResponse.json(
        { error: "请求体不是合法 JSON" },
        { status: 400 }
      );
    }

    const { email, password } = parsed;

    if (!email || !password) {
      return NextResponse.json(
        { error: "请输入邮箱和密码" },
        { status: 400 }
      );
    }

    // 仅本地开发：虚拟账号，不连数据库；公网部署不会走这里
    if (process.env.NODE_ENV !== "production" && email === "demo@local" && password === "demo123") {
      await createSession({
        id: "demo-local",
        email: "demo@local",
        name: "本地演示",
      });
      return NextResponse.json({
        message: "登录成功（本地演示账号）",
        user: { id: "demo-local", email: "demo@local", name: "本地演示" },
      });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在或密码错误" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "用户不存在或密码错误" },
        { status: 401 }
      );
    }

    // Create session cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: "登录成功",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Missing JWT_SECRET")) {
      return NextResponse.json(
        { error: "服务端缺少 JWT_SECRET 环境变量，无法创建会话" },
        { status: 500 }
      );
    }
    if (
      message.includes("P1000") ||
      message.includes("P1001") ||
      message.includes("P1002") ||
      message.includes("P1012") ||
      message.includes("P2021") ||
      message.toLowerCase().includes("database") ||
      message.toLowerCase().includes("sqlite") ||
      message.toLowerCase().includes("postgres")
    ) {
      return NextResponse.json(
        { error: "服务端数据库不可用：请检查 DATABASE_URL / 迁移 / 数据库服务" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
