import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 何も制御せず、そのまま通す
  return NextResponse.next();
}
