function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getApiBaseUrl(): string {
  const raw = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (raw) {
    return normalizeBaseUrl(raw);
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("API_BASE_URL não configurada no ambiente de produção.");
}
