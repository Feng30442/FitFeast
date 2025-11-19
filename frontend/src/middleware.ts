// src/middleware.ts
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

/**
 * JWT の署名と有効期限を検証する
 * @param token 検証する JWT 文字列
 * @returns 有効なら true, 無効なら false
 */
async function verifyToken(token: string): Promise<boolean> {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("[Middleware] JWT_SECRET_KEY is not defined in .env");
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    await jwtVerify(token, secret);
    return true;
  } catch {
    // 署名不正・有効期限切れなど
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
  if (pathname === "/") return true; // トップページはログイン必須とする
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ここにリダイレクト先の URL を定義
  const loginUrl = new URL("/auth/login", request.url);
  const dashboardUrl = new URL("/home", request.url);

  // Cookie からトークンを取得
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // アクセストークンの検証
  const isAccessTokenValid = accessToken
    ? await verifyToken(accessToken)
    : false;

  let isAuthenticated = false;

  if (isAccessTokenValid) {
    isAuthenticated = true;
  } else if (refreshToken) {
    // アクセストークンが無効でも、リフレッシュトークンが有効なら「ログイン済み」とみなす
    const isRefreshTokenValid = await verifyToken(refreshToken);
    if (isRefreshTokenValid) {
      isAuthenticated = true;
      // 本当はここで新しい access_token を発行する API を叩くのがベスト
    }
  }

  // すでにログイン済みなのに /auth/login や /auth/signup に来た → ダッシュボードへ
  if (isAuthenticated && isPublicPath(pathname)) {
    return NextResponse.redirect(dashboardUrl);
  }

  // ログインしていないのに保護ページに来た → ログインページへ
  if (!isAuthenticated && isProtectedPath(pathname)) {
    console.log(
      "[Middleware] User is not authenticated. Redirecting to /auth/login.",
    );
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  // それ以外のパスはそのまま通す
  return NextResponse.next();
}

/**
 * どのパスで middleware を有効にするかの設定
 * api / _next / 画像 / favicon などは除外
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|\\.well-known|favicon.ico).*)"],
};
