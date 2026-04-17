import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT without a library in Edge Runtime
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access auth pages and already logged in (except forgot/reset password)
  const isForgotOrReset = pathname.startsWith("/auth/forgot-password") || pathname.startsWith("/auth/reset-password");
  if (pathname.startsWith("/auth") && token && !isForgotOrReset) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Define protected routes
  const isProtectedRoute = pathname.startsWith("/properties/create") || pathname.startsWith("/profile");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/auth/sign-in", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Role-based check
    if (isAdminRoute) {
      const payload = parseJwt(token);
      if (!payload || payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Config to specify which routes this middleware applies to
export const config = {
  matcher: ["/auth/:path*", "/properties/create/:path*", "/admin/:path*", "/profile/:path*"],
};
