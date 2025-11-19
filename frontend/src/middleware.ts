// src/middleware.ts
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * JWT の署名と有効期限を検証する
 */
async function verifyToken(token: string): Promise<boolean> {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("[Middleware] JWT_SECRET_KEY is not defined in env");
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** 認証不要のパス（ログイン/新規登録など） */
const publicPaths = ["/auth/login", "/auth/signup"];

/** 認証が必要なパスのプレフィックス */
const protectedPrefixes = ["/home", "/meals", "/history", "/settings"];

/** 認証不要ページかどうか */
function isPublicPath(pathname: string): boolean {
  return publicPaths.includes(pathname);
}

/** 認証必須ページかどうか（/ と各プレフィックス配下） */
function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true; // トップページはログイン必須
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const loginUrl = new URL("/auth/login", request.url);
  const homeUrl = new URL("/home", request.url);

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isAccessTokenValid = accessToken ? await verifyToken(accessToken) : false;

  let isAuthenticated = false;

  if (isAccessTokenValid) {
    isAuthenticated = true;
  } else if (refreshToken) {
    const isRefreshTokenValid = await verifyToken(refreshToken);
    if (isRefreshTokenValid) {
      isAuthenticated = true;
      // 本当はここで新しい access_token を発行する API を叩くのがベスト
    }
  }

  // ログイン済みなのに /auth/login /auth/signup に来たら /home へ
  if (isAuthenticated && isPublicPath(pathname)) {
    return NextResponse.redirect(homeUrl);
  }

  // 未ログインで保護ページに来たら /auth/login へ
  if (!isAuthenticated && isProtectedPath(pathname)) {
    console.log("[Middleware] User is not authenticated. Redirecting to /auth/login.");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|\\.well-known|favicon.ico).*)"],
};
