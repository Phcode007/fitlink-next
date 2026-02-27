import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/env";
import type { Role } from "@/lib/types";

const API_BASE_URL = getApiBaseUrl();

type SearchRole = "TRAINER" | "NUTRITIONIST" | "ALL";

type SearchUser = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
};

function normalizeRole(value: string | null): SearchRole {
  if (value === "TRAINER" || value === "NUTRITIONIST") return value;
  return "ALL";
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (session.role !== "USER") {
    return NextResponse.json({ message: "A busca de profissionais e exclusiva para usuarios." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = normalizeRole(searchParams.get("role"));
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => ({}))) as { message?: string | string[] } | SearchUser[];

    if (!response.ok) {
      const message = Array.isArray((body as { message?: string | string[] }).message)
        ? ((body as { message?: string[] }).message || []).join(", ")
        : (body as { message?: string }).message || "Nao foi possivel consultar profissionais.";

      return NextResponse.json({ message }, { status: response.status });
    }

    const users = Array.isArray(body) ? body : [];
    const filtered = users.filter((user) => {
      const roleMatch = role === "ALL" ? user.role === "TRAINER" || user.role === "NUTRITIONIST" : user.role === role;
      const queryMatch = query.length === 0 ? true : user.email.toLowerCase().includes(query);
      return roleMatch && queryMatch;
    });

    return NextResponse.json({ professionals: filtered }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Falha de conexao com o servidor." }, { status: 502 });
  }
}
