import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "fitlink_session";
const protectedPaths = ["/dashboard", "/professionals", "/clients", "/workouts", "/diets", "/progress", "/subscriptions", "/profile", "/onboarding"];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function hasValidJwt(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await hasValidJwt(token);

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
