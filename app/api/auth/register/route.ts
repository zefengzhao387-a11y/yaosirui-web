import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  return NextResponse.json({ message: "Register API is working" });
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

    const { email, password, name } = parsed;

    if (!email || !password) {
      return NextResponse.json(
        { error: "请输入邮箱和密码" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "密码至少 6 位" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    await createSession({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json(
      { 
        message: "注册成功", 
        user: { id: user.id, email: user.email, name: user.name } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "注册失败，请检查数据库连接" },
      { status: 500 }
    );
  }
}
