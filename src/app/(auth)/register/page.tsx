"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Role } from "@/lib/types";

const roles: Role[] = ["USER", "TRAINER", "NUTRITIONIST"];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email) ? "Informe um email valido." : "";
  const passwordError = password.length > 0 && password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : "";
  const confirmError = confirmPassword.length > 0 && confirmPassword !== password ? "As senhas nao coincidem." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (emailError || passwordError || confirmError) {
      setError("Revise os campos do formulario.");
      return;
    }

    try {
      setLoading(true);
      const authResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const authBody = (await authResponse.json().catch(() => ({}))) as { accessToken?: string; message?: string };

      if (!authResponse.ok || !authBody.accessToken) {
        setError(authBody.message || "Nao foi possivel criar a conta.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: authBody.accessToken }),
      });

      if (!sessionResponse.ok) {
        setError("Conta criada, mas nao foi possivel iniciar sessao.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-base">Cadastre-se para acessar a plataforma.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          error={emailError || undefined}
        />

        <Input
          label="Senha"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          error={passwordError || undefined}
        />

        <Input
          label="Confirmar senha"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          error={confirmError || undefined}
        />

        <div className="grid gap-2">
          <label htmlFor="role" className="text-sm font-medium">
            Perfil
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="h-11 rounded-xl border border-border bg-input px-3 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" variant="primary" loading={loading} className="w-full" aria-label="Criar conta">
          Criar conta
        </Button>
      </form>

      <p className="text-sm">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Entrar
        </Link>
      </p>
    </div>
  );
}


