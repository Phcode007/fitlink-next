"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email) ? "Informe um email valido." : "";
  const passwordError = password.length > 0 && password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }

    if (emailError || passwordError) {
      setError("Revise os campos do formulario.");
      return;
    }

    try {
      setLoading(true);
      const authResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const authBody = (await authResponse.json().catch(() => ({}))) as { accessToken?: string; message?: string };

      if (!authResponse.ok || !authBody.accessToken) {
        setError(authBody.message || "Credenciais invalidas.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: authBody.accessToken }),
      });

      if (!sessionResponse.ok) {
        setError("Nao foi possivel iniciar sessao.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Nao foi possivel fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-base text-foreground/80">Acesse sua conta FitLink para continuar sua jornada.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          error={emailError || undefined}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          error={passwordError || undefined}
        />

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="primary" loading={loading} className="w-full" aria-label="Entrar na plataforma">
          Entrar
        </Button>
      </form>

      <p className="text-sm">
        Ainda nao tem conta?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
