import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

/**
 * JWTの署名と有効期限を検証する
 * @param token 検証するJWT文字列
 * @returns トークンが有効であれば true, 無効であれば false
 */
async function verifyToken(token: string): Promise<boolean> {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("[Middleware] JWT_SECRET_KEY is not defined in .env file");
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

const protectedPaths = ["/", "/home"];
const publicPaths = ["/signup", "/signin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loginUrl = new URL("/signin", request.url);
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
    }
  }

  if (isAuthenticated && publicPaths.includes(pathname)) {
    return NextResponse.redirect(homeUrl);
  }

  if (!isAuthenticated && protectedPaths.includes(pathname)) {
    console.log("[Middleware] User is not authenticated. Redirecting to /signup.");
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
