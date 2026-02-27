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
  });

  if (!response.ok) {
    let message = "Não foi possível concluir a requisição.";
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
          cache: "no-store",
        },
        false,
      ),
    register: (dto: RegisterDto) =>
      request<{ accessToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(dto),
          cache: "no-store",
        },
        false,
      ),
  },
  users: {
    getMe: () => request<User>("/users/me", { next: { revalidate: 120 } } as RequestInit),
    updateMe: (dto: UpdateMeDto) =>
      request<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
    listUsers: () => request<User[]>("/users", { next: { revalidate: 120 } } as RequestInit),
  },
  trainers: {
    dashboard: () => request<Trainer>("/trainers/dashboard", { next: { revalidate: 120 } } as RequestInit),
    updateProfile: (dto: Partial<Trainer>) =>
      request<Trainer>("/trainers/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  nutritionists: {
    dashboard: () => request<Nutritionist>("/nutritionists/dashboard", { next: { revalidate: 120 } } as RequestInit),
    updateProfile: (dto: Partial<Nutritionist>) =>
      request<Nutritionist>("/nutritionists/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  workouts: {
    list: () => request<WorkoutPlan[]>("/workouts", { next: { revalidate: 60 } } as RequestInit),
    update: (id: string, dto: UpdateWorkoutDto) =>
      request<WorkoutPlan>(`/workouts/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  diets: {
    list: () => request<DietPlan[]>("/diets", { next: { revalidate: 60 } } as RequestInit),
    update: (id: string, dto: UpdateDietDto) =>
      request<DietPlan>(`/diets/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  progress: {
    list: () => request<BodyMetric[]>("/progress", { next: { revalidate: 30 } } as RequestInit),
    update: (id: string, dto: UpdateProgressDto) =>
      request<BodyMetric>(`/progress/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  subscriptions: {
    list: () => request<Subscription[]>("/subscriptions", { next: { revalidate: 30 } } as RequestInit),
    update: (id: string, dto: UpdateSubscriptionDto) =>
      request<Subscription>(`/subscriptions/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
        cache: "no-store",
      }),
  },
  health: {
    check: () => request<{ status: "ok"; service: string; timestamp: string }>("/health", {}, false),
  },
};

export { ApiError, API_BASE_URL };
