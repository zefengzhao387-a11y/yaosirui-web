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
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
