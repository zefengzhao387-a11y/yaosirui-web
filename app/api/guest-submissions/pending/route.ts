import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * 获取当前用户待审核的亲友投递数量。
 * 后续可在 Prisma 中增加 GuestSubmission 等模型，按 userId 统计 status === 'pending' 的数量。
 */
export async function GET() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 暂无亲友投递表时返回 0；后续可改为：prisma.guestSubmission.count({ where: { targetUserId: userId, status: 'pending' } })
  const count = 0;

  return NextResponse.json({ count });
}
