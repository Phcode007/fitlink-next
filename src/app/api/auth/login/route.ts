import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/env";

const API_BASE_URL = getApiBaseUrl();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as { message?: string | string[]; accessToken?: string };

    if (!response.ok) {
      const message = Array.isArray(data.message) ? data.message.join(", ") : data.message || "Falha ao autenticar.";
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json({ accessToken: data.accessToken }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de conexao com o servidor.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
