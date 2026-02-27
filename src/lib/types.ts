export type Role = "USER" | "TRAINER" | "NUTRITIONIST" | "ADMIN";

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  trainerId: string | null;
  userId: string | null;
  title: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface DietPlan {
  id: string;
  nutritionistId: string | null;
  userId: string | null;
  title: string;
  description: string | null;
  dailyCalories: number | null;
  isActive: boolean;
  updatedAt: string;
}

export interface BodyMetric {
  id: string;
  userId: string;
  measuredAt: string;
  weightKg: number | null;
  bodyFatPercent: number | null;
  muscleMassKg: number | null;
  bmi: number | null;
  notes: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  userId: string;
  bio: string | null;
  yearsExperience: number | null;
  approved: boolean;
  updatedAt: string;
}

export interface Nutritionist {
  id: string;
  userId: string;
  bio: string | null;
  yearsExperience: number | null;
  approved: boolean;
  updatedAt: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateMeDto {
  email?: string;
  password?: string;
}

export interface UpdateWorkoutDto {
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDietDto {
  title?: string;
  description?: string;
  dailyCalories?: number;
  isActive?: boolean;
}

export interface UpdateProgressDto {
  weightKg?: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  bmi?: number;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  planName?: string;
  status?: SubscriptionStatus;
}
