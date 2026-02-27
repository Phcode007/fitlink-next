import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "fitlink_session";
const protectedPaths = ["/dashboard", "/professionals", "/clients", "/workouts", "/diets", "/progress", "/subscriptions", "/profile", "/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasToken = Boolean(token);

  const isProtectedRoute = protectedPaths.some((basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`));

  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && hasToken) {
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
