"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Role } from "@/lib/types";

type PlanOption = "GRATUITO" | "PREMIUM";

export function OnboardingForm({ role }: { role: Role }) {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [plan, setPlan] = useState<PlanOption>("GRATUITO");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [professionalRegistration, setProfessionalRegistration] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isSpecialist = role === "TRAINER" || role === "NUTRITIONIST";
  const registrationLabel = role === "TRAINER" ? "Registro profissional (CREF)" : "Registro profissional (CRN)";
  const registrationHint = role === "TRAINER" ? "Ex: CREF 123456-G/SP" : "Ex: CRN 12345";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setWarnings([]);

    if (!heightCm || !weightKg) {
      setError("Informe altura e peso para continuar.");
      return;
    }

    if (isSpecialist && !professionalRegistration.trim()) {
      setError("Informe seu registro profissional para continuar.");
      return;
    }

    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (!Number.isFinite(height) || height < 100 || height > 250) {
      setError("Altura invalida. Use um valor entre 100 e 250 cm.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 30 || weight > 400) {
      setError("Peso invalido. Use um valor entre 30 e 400 kg.");
      return;
    }

    if (isSpecialist && yearsExperience) {
      const years = Number(yearsExperience);
      if (!Number.isFinite(years) || years < 0 || years > 80) {
        setError("Experiencia invalida. Use um valor entre 0 e 80 anos.");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: height,
          weightKg: weight,
          plan,
          bio: bio || undefined,
          yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
          professionalRegistration: professionalRegistration || undefined,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string; warnings?: string[] };

      if (!response.ok) {
        setError(body.message || "Nao foi possivel concluir o onboarding.");
        return;
      }

      if (body.warnings?.length) {
        setWarnings(body.warnings);
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexao ao concluir onboarding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-7" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Complete seu perfil inicial</h1>
        <p className="text-base text-foreground/80">
          Preencha os dados para personalizar sua experiencia no FitLink de acordo com seu objetivo e perfil.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Dados corporais</h2>
            <p className="text-sm text-foreground/70">Essas informacoes ajudam a ajustar treinos e recomendacoes.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Altura (cm)"
            name="heightCm"
            type="number"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            placeholder="Ex: 175"
            required
            min={100}
            max={250}
            hint="Informe sua altura em centimetros."
          />
          <Input
            label="Peso (kg)"
            name="weightKg"
            type="number"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            placeholder="Ex: 78"
            required
            min={30}
            max={400}
            step="0.1"
            hint="Informe seu peso atual em quilogramas."
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Plano de uso</h2>
            <p className="text-sm text-foreground/70">Selecione como voce deseja comecar na plataforma.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${
              plan === "GRATUITO" ? "border-primary bg-muted" : "border-border bg-card"
            }`}
          >
            <input
              type="radio"
              name="plan"
              value="GRATUITO"
              checked={plan === "GRATUITO"}
              onChange={() => setPlan("GRATUITO")}
              className="sr-only"
            />
            <p className="font-semibold">Gratuito</p>
            <p className="text-sm text-foreground/80">Acesso basico para comecar a registrar seu progresso.</p>
          </label>

          <label
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${
              plan === "PREMIUM" ? "border-primary bg-muted" : "border-border bg-card"
            }`}
          >
            <input
              type="radio"
              name="plan"
              value="PREMIUM"
              checked={plan === "PREMIUM"}
              onChange={() => setPlan("PREMIUM")}
              className="sr-only"
            />
            <p className="font-semibold">Premium</p>
            <p className="text-sm text-foreground/80">
              Recursos avancados, acompanhamento completo e mais insights sobre sua evolucao.
            </p>
          </label>
        </div>
      </section>

      {isSpecialist ? (
        <section className="grid gap-4 rounded-2xl border border-primary/40 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Dados profissionais</h2>
              <p className="text-sm text-foreground/70">
                Essas informacoes sao exibidas para alunos e pacientes quando voce se conecta a eles.
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Perfil profissional
            </span>
          </div>

          <Input
            label={registrationLabel}
            name="professionalRegistration"
            value={professionalRegistration}
            onChange={(event) => setProfessionalRegistration(event.target.value)}
            placeholder={registrationHint}
            required
            hint="Use o numero completo do seu registro oficial."
          />
          <Input
            label="Anos de experiencia"
            name="yearsExperience"
            type="number"
            value={yearsExperience}
            onChange={(event) => setYearsExperience(event.target.value)}
            placeholder="Ex: 5"
            min={0}
            max={80}
            hint="Opcional, mas ajuda os usuarios a entenderem seu nivel de experiencia."
          />
          <div className="grid gap-2">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">
              Bio profissional
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className="rounded-xl border border-border bg-input px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Fale sobre sua experiencia, metodos de trabalho e especialidades."
            />
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {warnings.length ? (
        <div className="rounded-xl border border-border bg-muted p-4 text-sm">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <Button type="submit" variant="primary" loading={loading} className="w-full" aria-label="Concluir onboarding">
        Concluir e entrar
      </Button>
    </form>
  );
}
