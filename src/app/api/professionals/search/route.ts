import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/env";
import type { Role } from "@/lib/types";

const API_BASE_URL = getApiBaseUrl();

type SearchRole = "TRAINER" | "NUTRITIONIST" | "ALL";

type SearchUser = {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  isActive: boolean;
};

type UsersResponseShape =
  | SearchUser[]
  | { data?: SearchUser[]; users?: SearchUser[]; items?: SearchUser[]; results?: SearchUser[]; message?: string | string[] };

type ProfileWithUser = {
  id: string;
  user?: {
    id: string;
    name?: string | null;
    fullName?: string | null;
    email: string;
    role: Role;
    isActive: boolean;
  };
};

function normalizeRole(value: string | null): SearchRole {
  if (value === "TRAINER" || value === "NUTRITIONIST") return value;
  return "ALL";
}

function normalizeName(name: unknown, fullName: unknown): string | null {
  if (typeof name === "string" && name.trim()) return name.trim();
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  return null;
}

function extractUsers(body: UsersResponseShape): SearchUser[] {
  if (Array.isArray(body)) return body;

  const candidates = [body.data, body.users, body.items, body.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function extractErrorMessage(body: UsersResponseShape): string {
  const message = typeof body === "object" && !Array.isArray(body) ? body.message : undefined;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Não foi possível consultar profissionais.";
}

async function fallbackFromProfiles(token: string): Promise<SearchUser[]> {
  const endpoints: Array<{ path: string; role: Role }> = [
    { path: "/trainers", role: "TRAINER" },
    { path: "/nutritionists", role: "NUTRITIONIST" },
  ];

  const results = await Promise.all(
    endpoints.map(async ({ path, role }) => {
      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!response.ok) return [] as SearchUser[];

        const body = (await response.json().catch(() => [])) as ProfileWithUser[] | { data?: ProfileWithUser[]; items?: ProfileWithUser[] };
        const list = Array.isArray(body) ? body : body.data ?? body.items ?? [];

        return list
          .filter((item) => item?.user?.email)
          .map((item) => ({
            id: item.user?.id ?? item.id,
            name: normalizeName(item.user?.name, item.user?.fullName),
            email: item.user?.email ?? "",
            role,
            isActive: item.user?.isActive ?? true,
          }));
      } catch {
        return [] as SearchUser[];
      }
    }),
  );

  return results.flat();
}

function normalizeIncomingUsers(users: SearchUser[]): SearchUser[] {
  return users.map((user) => ({
    ...user,
    name: normalizeName((user as unknown as { name?: unknown }).name, (user as unknown as { fullName?: unknown }).fullName),
  }));
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Sessão inválida." }, { status: 401 });
  }

  if (session.role !== "USER") {
    return NextResponse.json({ message: "A busca de profissionais é exclusiva para usuários." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessão inválida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = normalizeRole(searchParams.get("role"));
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  try {
    // Primeiro tentamos buscar pela rota de usuarios,
    // filtrando apenas quem tem papel de profissional.
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => ({}))) as UsersResponseShape;

    let users: SearchUser[] = [];

    if (response.ok) {
      users = normalizeIncomingUsers(extractUsers(body));
    } else if (response.status === 403 || response.status === 404) {
      // Se a API nao expor /users para o usuario atual,
      // fazemos o fallback direto nas rotas de profissionais.
      users = await fallbackFromProfiles(token);
    } else {
      return NextResponse.json({ message: extractErrorMessage(body) }, { status: response.status });
    }

    const normalized = normalizeIncomingUsers(users);

    const filtered = normalized.filter((user) => {
      const roleMatch = role === "ALL" ? user.role === "TRAINER" || user.role === "NUTRITIONIST" : user.role === role;
      const baseName = (user.name || "").toLowerCase();
      const emailFallback = user.email.toLowerCase();
      const queryMatch = query.length === 0 ? true : baseName.includes(query) || (!user.name && emailFallback.includes(query));
      return roleMatch && queryMatch;
    });

    return NextResponse.json({ professionals: filtered }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Falha de conexão com o servidor." }, { status: 502 });
  }
}
