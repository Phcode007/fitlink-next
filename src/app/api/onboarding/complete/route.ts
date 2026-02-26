import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/env";

const API_BASE_URL = getApiBaseUrl();

type OnboardingBody = {
  heightCm?: number;
  weightKg?: number;
  plan?: "GRATUITO" | "PREMIUM";
  bio?: string;
  yearsExperience?: number;
};

async function apiRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(errorBody.message) ? errorBody.message.join(", ") : errorBody.message || `Erro ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Token de autenticacao ausente." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as OnboardingBody;
  const heightCm = Number(body.heightCm);
  const weightKg = Number(body.weightKg);

  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    return NextResponse.json({ message: "Altura e peso sao obrigatorios." }, { status: 400 });
  }

  const warnings: string[] = [];

  const bmi = Number((weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(2));

  try {
    const progressList = await apiRequest<Array<{ id: string }>>("/progress", token);
    if (progressList.length > 0) {
      await apiRequest(`/progress/${progressList[0].id}`, token, {
        method: "PUT",
        body: JSON.stringify({
          weightKg,
          bmi,
          notes: `Altura: ${heightCm} cm`,
        }),
      });
    } else {
      warnings.push("Nao foi encontrado registro de progresso para atualizar altura e peso.");
    }
  } catch {
    warnings.push("Nao foi possivel salvar altura e peso agora.");
  }

  try {
    const subscriptions = await apiRequest<Array<{ id: string }>>("/subscriptions", token);
    if (subscriptions.length > 0) {
      const planName = body.plan === "PREMIUM" ? "Premium" : "Gratuito";
      const status = body.plan === "PREMIUM" ? "ACTIVE" : "TRIALING";

      await apiRequest(`/subscriptions/${subscriptions[0].id}`, token, {
        method: "PUT",
        body: JSON.stringify({ planName, status }),
      });
    } else {
      warnings.push("Nao foi encontrada assinatura para atualizar o plano.");
    }
  } catch {
    warnings.push("Nao foi possivel atualizar o plano agora.");
  }

  if (session.role === "TRAINER") {
    try {
      await apiRequest("/trainers/profile", token, {
        method: "PUT",
        body: JSON.stringify({
          bio: body.bio,
          yearsExperience: body.yearsExperience,
        }),
      });
    } catch {
      warnings.push("Nao foi possivel salvar os dados profissionais de trainer.");
    }
  }

  if (session.role === "NUTRITIONIST") {
    try {
      await apiRequest("/nutritionists/profile", token, {
        method: "PUT",
        body: JSON.stringify({
          bio: body.bio,
          yearsExperience: body.yearsExperience,
        }),
      });
    } catch {
      warnings.push("Nao foi possivel salvar os dados profissionais de nutricionista.");
    }
  }

  cookieStore.set({
    name: "fitlink_onboarding_done",
    value: "true",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, warnings }, { status: 200 });
}
