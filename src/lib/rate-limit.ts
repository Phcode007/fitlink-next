const requestMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function checkRateLimit(ip: string): { limited: boolean } {
  const now = Date.now();
  const entry = requestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false };
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    return { limited: true };
  }

  return { limited: false };
}
