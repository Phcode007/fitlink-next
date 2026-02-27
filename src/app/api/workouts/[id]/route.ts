import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/env";

const API_BASE_URL = getApiBaseUrl();

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    isActive?: boolean;
  };

  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(responseBody, { status: response.status });
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Falha de conexao com o servidor." }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(responseBody, { status: response.status });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Falha de conexao com o servidor." }, { status: 502 });
  }
}
