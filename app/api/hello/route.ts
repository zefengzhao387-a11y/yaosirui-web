import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "你好，这是后端 API 返回的数据！",
    timestamp: new Date().toISOString(),
  });
}
