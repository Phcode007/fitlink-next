import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/env";
import { withAuth } from "@/lib/with-auth";

const API_BASE_URL = getApiBaseUrl();

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withAuth<Ctx>(async (request, token, context) => {
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
    return NextResponse.json({ message: "Falha de conexão com o servidor." }, { status: 502 });
  }
});

export const DELETE = withAuth<Ctx>(async (_request, token, context) => {
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
    return NextResponse.json({ message: "Falha de conexão com o servidor." }, { status: 502 });
  }
});
