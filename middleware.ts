import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path === "/timeline" || path.startsWith("/timeline/");
  const isLoginRoute = path === "/login";

  const hasSession = Boolean(request.cookies.get("session")?.value);

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isLoginRoute && hasSession) {
    return NextResponse.redirect(new URL("/timeline", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
