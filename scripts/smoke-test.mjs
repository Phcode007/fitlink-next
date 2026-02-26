#!/usr/bin/env node

const baseUrl = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://fitlink-api.onrender.com").replace(/\/$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

function randomEmail() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `smoke.${Date.now()}.${suffix}@fitlink.test`;
}

async function request(path, { method = "GET", token, body, expected = [200] } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!expected.includes(response.status)) {
      throw new Error(
        `Request ${method} ${path} failed: status ${response.status}, body: ${JSON.stringify(data)}`,
      );
    }

    return { status: response.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForHealth(maxAttempts = 8) {
  let lastError = null;

  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      const health = await request("/health", { expected: [200] });
      if (health.data?.status === "ok") return health.data;
      lastError = new Error(`Unexpected health payload: ${JSON.stringify(health.data)}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw lastError || new Error("Health check failed");
}

async function run() {
  console.log(`\n[smoke] Base URL: ${baseUrl}`);

  const health = await waitForHealth();
  console.log(`[smoke] /health ok -> ${JSON.stringify(health)}`);

  const email = randomEmail();
  const password = "SmokeTest123!";

  const register = await request("/auth/register", {
    method: "POST",
    body: { email, password, role: "USER" },
    expected: [201, 200],
  });

  if (!register.data?.accessToken) {
    throw new Error("Register did not return accessToken");
  }
  console.log("[smoke] /auth/register ok");

  const login = await request("/auth/login", {
    method: "POST",
    body: { email, password },
    expected: [200, 201],
  });

  const token = login.data?.accessToken;
  if (!token) {
    throw new Error("Login did not return accessToken");
  }
  console.log("[smoke] /auth/login ok");

  const protectedEndpoints = [
    "/users/me",
    "/workouts",
    "/diets",
    "/progress",
    "/subscriptions",
  ];

  for (const endpoint of protectedEndpoints) {
    await request(endpoint, { token, expected: [200] });
    console.log(`[smoke] ${endpoint} ok`);
  }

  console.log("\n[smoke] All smoke tests passed.");
}

run().catch((error) => {
  console.error("\n[smoke] FAILED");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
