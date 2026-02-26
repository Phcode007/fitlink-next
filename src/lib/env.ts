export function getApiBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    return baseUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("API_BASE_URL nao configurada no ambiente de producao.");
}
