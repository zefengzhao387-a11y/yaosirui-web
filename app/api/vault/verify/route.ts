import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as { password?: string } | null;
    if (!body?.password) {
      return NextResponse.json({ ok: false, error: "请输入阁楼密码" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.vaultPasswordHash) {
      return NextResponse.json({ ok: false, error: "尚未设置阁楼密码" }, { status: 400 });
    }

    const ok = await bcrypt.compare(body.password, dbUser.vaultPasswordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "阁楼密码错误" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("verify vault password error", e);
    return NextResponse.json({ ok: false, error: "验证失败" }, { status: 500 });
  }
}

