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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nameError = name.length > 0 && name.trim().length < 3 ? "Informe seu nome completo." : "";
  const emailError = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email) ? "Informe um email valido." : "";
  const passwordError = password.length > 0 && password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : "";
  const confirmError = confirmPassword.length > 0 && confirmPassword !== password ? "As senhas nao coincidem." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (nameError || emailError || passwordError || confirmError) {
      setError("Revise os campos do formulario.");
      return;
    }

    try {
      setLoading(true);
      const authResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
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
        <p className="text-base text-foreground/80">
          Cadastre-se para conectar treino, dieta e acompanhamento profissional em um só lugar.
        </p>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <Input
          label="Nome completo"
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          error={nameError || undefined}
        />

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
          <div className="grid gap-2 rounded-2xl border border-border bg-muted/40 p-3">
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
            <p className="text-xs text-foreground/70">
              Escolha se voce entra como aluno, personal trainer ou nutricionista. Isso ajuda a personalizar sua
              experiencia.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

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


