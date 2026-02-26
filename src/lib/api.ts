import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/env";
import type {
  BodyMetric,
  DietPlan,
  LoginDto,
  RegisterDto,
  Subscription,
  Trainer,
  Nutritionist,
  UpdateDietDto,
  UpdateMeDto,
  UpdateProgressDto,
  UpdateSubscriptionDto,
  UpdateWorkoutDto,
  User,
  WorkoutPlan,
} from "@/lib/types";

const API_BASE_URL = getApiBaseUrl();

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

async function request<T>(path: string, init: RequestInit = {}, requiresAuth = true): Promise<T> {
  const token = requiresAuth ? await getAuthToken() : null;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Nao foi possivel concluir a requisicao.";
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // no-op: keep friendly fallback
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const api = {
  auth: {
    login: (dto: LoginDto) =>
      request<{ accessToken: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
        false,
      ),
    register: (dto: RegisterDto) =>
      request<{ accessToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
        false,
      ),
  },
  users: {
    getMe: () => request<User>("/users/me"),
    updateMe: (dto: UpdateMeDto) =>
      request<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    listUsers: () => request<User[]>("/users"),
  },
  trainers: {
    dashboard: () => request<Trainer>("/trainers/dashboard"),
    updateProfile: (dto: Partial<Trainer>) =>
      request<Trainer>("/trainers/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  nutritionists: {
    dashboard: () => request<Nutritionist>("/nutritionists/dashboard"),
    updateProfile: (dto: Partial<Nutritionist>) =>
      request<Nutritionist>("/nutritionists/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  workouts: {
    list: () => request<WorkoutPlan[]>("/workouts"),
    update: (id: string, dto: UpdateWorkoutDto) =>
      request<WorkoutPlan>(`/workouts/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  diets: {
    list: () => request<DietPlan[]>("/diets"),
    update: (id: string, dto: UpdateDietDto) =>
      request<DietPlan>(`/diets/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  progress: {
    list: () => request<BodyMetric[]>("/progress"),
    update: (id: string, dto: UpdateProgressDto) =>
      request<BodyMetric>(`/progress/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  subscriptions: {
    list: () => request<Subscription[]>("/subscriptions"),
    update: (id: string, dto: UpdateSubscriptionDto) =>
      request<Subscription>(`/subscriptions/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
  },
  health: {
    check: () => request<{ status: "ok"; service: string; timestamp: string }>("/health", {}, false),
  },
};

export { ApiError, API_BASE_URL };
