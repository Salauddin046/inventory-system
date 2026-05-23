import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "");

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/seed"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};