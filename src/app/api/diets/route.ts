import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/env";
import { withAuth } from "@/lib/with-auth";

const API_BASE_URL = getApiBaseUrl();

export const POST = withAuth(async (request, token) => {
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    dailyCalories?: number;
    isActive?: boolean;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ message: "Título obrigatório." }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/diets`, {
      method: "POST",
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

    return NextResponse.json(responseBody, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Falha de conexão com o servidor." }, { status: 502 });
  }
});
