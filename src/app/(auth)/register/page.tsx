"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Role } from "@/lib/types";

type RoleOption = { value: Role; label: string; description: string };

const roleOptions: RoleOption[] = [
  { value: "USER", label: "Aluno", description: "Acompanhe treinos, dietas e seu progresso." },
  { value: "TRAINER", label: "Personal Trainer", description: "Gerencie alunos e planos de treino." },
  { value: "NUTRITIONIST", label: "Nutricionista", description: "Gerencie pacientes e planos alimentares." },
];

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
  const emailError = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email) ? "Informe um e-mail válido." : "";
  const passwordError = password.length > 0 && password.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." : "";
  const confirmError = confirmPassword.length > 0 && confirmPassword !== password ? "As senhas não coincidem." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (nameError || emailError || passwordError || confirmError) {
      setError("Revise os campos do formulário.");
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
        setError(authBody.message || "Não foi possível criar a conta.");
        return;
      }

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: authBody.accessToken }),
      });

      if (!sessionResponse.ok) {
        setError("Conta criada, mas não foi possível iniciar sessão.");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
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
          label="E-mail"
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
          <p className="text-sm font-medium">Perfil</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                  role === option.value ? "border-primary bg-muted" : "border-border bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                <p className="font-semibold text-sm">{option.label}</p>
                <p className="text-xs text-foreground/70 mt-1">{option.description}</p>
              </label>
            ))}
          </div>
          <p className="text-xs text-foreground/70">
            Escolha se você entra como aluno, personal trainer ou nutricionista. Isso ajuda a personalizar sua experiência.
          </p>
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
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Entrar
        </Link>
      </p>
    </div>
  );
}
