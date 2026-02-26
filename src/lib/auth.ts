import { cookies } from "next/headers";
import type { JwtPayload, Role } from "@/lib/types";

const SESSION_COOKIE = "fitlink_session";

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export async function getToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return getClientCookie(SESSION_COOKIE);
  }

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<JwtPayload | null> {
  const token = await getToken();
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;

  if (payload.exp && payload.exp * 1000 < Date.now()) return null;

  return payload;
}

export async function setSession(token: string): Promise<void> {
  if (typeof window !== "undefined") {
    document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; samesite=lax`;
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  if (typeof window !== "undefined") {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function hasRole(role: Role): Promise<boolean> {
  const session = await getSession();
  return session?.role === role;
}

export { SESSION_COOKIE, decodeJwt };
