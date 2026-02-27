import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "fitlink_session";
const protectedPaths = ["/dashboard", "/professionals", "/clients", "/workouts", "/diets", "/progress", "/subscriptions", "/profile", "/onboarding"];

function hasValidJwt(token: string | undefined): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    if (!payload.exp) return true;

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = hasValidJwt(token);

  const isProtectedRoute = protectedPaths.some((basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`));

  if (isProtectedRoute && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/professionals/:path*",
    "/clients/:path*",
    "/workouts/:path*",
    "/diets/:path*",
    "/progress/:path*",
    "/subscriptions/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
