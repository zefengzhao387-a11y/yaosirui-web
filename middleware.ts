import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path === "/timeline" ||
    path.startsWith("/timeline/") ||
    path === "/dashboard" ||
    path === "/gallery";
  const hasSession = Boolean(request.cookies.get("session")?.value);

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // 已登录时也允许访问 /login，方便在登录页点「退出登录」
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
