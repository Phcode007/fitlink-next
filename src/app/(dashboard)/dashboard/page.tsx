import { Suspense } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Role, SubscriptionStatus } from "@/lib/types";

function statusVariant(status: SubscriptionStatus): "success" | "warning" | "error" | "default" {
  if (status === "ACTIVE") return "success";
  if (status === "TRIALING") return "warning";
  if (status === "PAST_DUE" || status === "CANCELED") return "error";
  return "default";
}

function statusLabel(status: SubscriptionStatus): string {
  if (status === "ACTIVE") return "Ativa";
  if (status === "TRIALING") return "Em teste";
  if (status === "PAST_DUE") return "Pagamento pendente";
  return "Cancelada";
}

function roleLabel(role: Role): string {
  if (role === "USER") return "Visão do usuário";
  if (role === "TRAINER") return "Visão do personal trainer";
  if (role === "NUTRITIONIST") return "Visão do nutricionista";
  return "Visão administrativa";
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-muted p-6">
      <div className="mb-3 h-4 w-1/3 rounded bg-foreground/10" />
      <div className="h-8 w-1/2 rounded bg-foreground/10" />
    </div>
  );
}

async function MetricsSection() {
  const metrics = await api.progress.list().catch(() => []);
  const latestMetric = [...metrics].sort((a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt))[0];

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <Card>
        <h2 className="mb-3 text-base font-semibold">Peso</h2>
        <p className="text-2xl font-semibold">{latestMetric?.weightKg ? `${latestMetric.weightKg} kg` : "-"}</p>
      </Card>
      <Card>
        <h2 className="mb-3 text-base font-semibold">Gordura corporal</h2>
        <p className="text-2xl font-semibold">{latestMetric?.bodyFatPercent ? `${latestMetric.bodyFatPercent}%` : "-"}</p>
      </Card>
      <Card>
        <h2 className="mb-3 text-base font-semibold">Massa muscular</h2>
        <p className="text-2xl font-semibold">{latestMetric?.muscleMassKg ? `${latestMetric.muscleMassKg} kg` : "-"}</p>
      </Card>
    </section>
  );
}

async function WorkoutsSection() {
  const workouts = await api.workouts.list().catch(() => []);
  const active = workouts.filter((item) => item.isActive);

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Treinos ativos</h2>
      <ul className="grid gap-3">
        {active.length ? (
          active.slice(0, 6).map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm">{item.description ?? "Sem descrição"}</p>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-border bg-muted p-4 text-sm">Nenhum treino ativo disponível.</li>
        )}
      </ul>
    </Card>
  );
}

async function DietsSection() {
  const diets = await api.diets.list().catch(() => []);
  const active = diets.filter((item) => item.isActive);

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Dietas ativas</h2>
      <ul className="grid gap-3">
        {active.length ? (
          active.slice(0, 6).map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm">{item.description ?? "Sem descrição"}</p>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-border bg-muted p-4 text-sm">Nenhuma dieta ativa disponível.</li>
        )}
      </ul>
    </Card>
  );
}

async function SubscriptionSection() {
  const subscriptions = await api.subscriptions.list().catch(() => []);
  const current = [...subscriptions].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0];

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Assinatura</h2>
      {current ? (
        <div className="flex items-center gap-4">
          <span className="font-medium">{current.planName}</span>
          <Badge variant={statusVariant(current.status)}>{statusLabel(current.status)}</Badge>
        </div>
      ) : (
        <p className="text-sm">Nenhuma assinatura encontrada.</p>
      )}
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="text-base">{session ? roleLabel(session.role) : "Sessão não encontrada."}</p>
      </section>

      <Suspense fallback={
        <section className="grid gap-6 md:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </section>
      }>
        <MetricsSection />
      </Suspense>

      <section className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<SkeletonCard />}>
          <WorkoutsSection />
        </Suspense>
        <Suspense fallback={<SkeletonCard />}>
          <DietsSection />
        </Suspense>
      </section>

      <section>
        <Suspense fallback={<SkeletonCard />}>
          <SubscriptionSection />
        </Suspense>
      </section>
    </div>
  );
}
