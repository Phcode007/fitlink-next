import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "fitlink_session";
const protectedPaths = ["/dashboard", "/professionals", "/clients", "/workouts", "/diets", "/progress", "/subscriptions", "/profile", "/onboarding"];

function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every(p => p.length > 0);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  
  const hasValidToken = token && isValidJwtFormat(token);

  const isProtectedRoute = protectedPaths.some((basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`));

  if (isProtectedRoute && !hasValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && hasValidToken) {
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
