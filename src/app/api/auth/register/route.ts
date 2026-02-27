import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/env";
import type { RegisterDto } from "@/lib/types";
import { checkRateLimit } from "@/lib/rate-limit";

const API_BASE_URL = getApiBaseUrl();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const { limited } = checkRateLimit(ip);
  if (limited) {
    return NextResponse.json({ message: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Partial<RegisterDto>;

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as { message?: string | string[]; accessToken?: string };

    if (!response.ok) {
      const message = Array.isArray(data.message) ? data.message.join(", ") : data.message || "Falha ao registrar conta.";
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json({ accessToken: data.accessToken }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de conexão com o servidor.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
