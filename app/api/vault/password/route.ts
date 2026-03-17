import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; // 假设已有获取当前用户的工具

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ hasPassword: false }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { vaultPasswordHash: true },
    });
    return NextResponse.json({ hasPassword: !!dbUser?.vaultPasswordHash });
  } catch (e) {
    console.error("get vault password status error", e);
    return NextResponse.json({ hasPassword: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as { oldPassword?: string; newPassword?: string } | null;
    if (!body?.newPassword || body.newPassword.length < 4) {
      return NextResponse.json({ error: "新阁楼密码至少 4 位" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (dbUser.vaultPasswordHash) {
      if (!body.oldPassword) {
        return NextResponse.json({ error: "请提供旧阁楼密码" }, { status: 400 });
      }
      const ok = await bcrypt.compare(body.oldPassword, dbUser.vaultPasswordHash);
      if (!ok) {
        return NextResponse.json({ error: "旧阁楼密码错误" }, { status: 400 });
      }
    }

    const saltRounds = 12;
    const hash = await bcrypt.hash(body.newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        vaultPasswordHash: hash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("set vault password error", e);
    return NextResponse.json({ error: "设置阁楼密码失败" }, { status: 500 });
  }
}

