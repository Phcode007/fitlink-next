import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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
  } catch {
    return NextResponse.json({ message: "Falha de conexão com o servidor." }, { status: 502 });
  }
}
