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
  if (role === "USER") return "Visao do usuario";
  if (role === "TRAINER") return "Visao do personal trainer";
  if (role === "NUTRITIONIST") return "Visao do nutricionista";
  return "Visao administrativa";
}

export default async function DashboardPage() {
  const session = await getSession();

  const [workoutsResult, dietsResult, progressResult, subscriptionsResult] = await Promise.allSettled([
    api.workouts.list(),
    api.diets.list(),
    api.progress.list(),
    api.subscriptions.list(),
  ]);

  const workouts = workoutsResult.status === "fulfilled" ? workoutsResult.value.filter((item) => item.isActive) : [];
  const diets = dietsResult.status === "fulfilled" ? dietsResult.value.filter((item) => item.isActive) : [];
  const metrics = progressResult.status === "fulfilled" ? progressResult.value : [];
  const subscriptions = subscriptionsResult.status === "fulfilled" ? subscriptionsResult.value : [];

  const latestMetric = [...metrics].sort((a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt))[0];
  const currentSubscription = [...subscriptions].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="text-base">{session ? roleLabel(session.role) : "Sessao nao encontrada."}</p>
      </section>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Treinos ativos</h2>
          <ul className="grid gap-3">
            {workouts.length ? (
              workouts.slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm">{item.description ?? "Sem descricao"}</p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-border bg-muted p-4 text-sm">Nenhum treino ativo disponivel.</li>
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold">Dietas ativas</h2>
          <ul className="grid gap-3">
            {diets.length ? (
              diets.slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm">{item.description ?? "Sem descricao"}</p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-border bg-muted p-4 text-sm">Nenhuma dieta ativa disponivel.</li>
            )}
          </ul>
        </Card>
      </section>

      <section>
        <Card>
          <h2 className="mb-4 text-base font-semibold">Assinatura</h2>
          {currentSubscription ? (
            <div className="flex items-center gap-4">
              <span className="font-medium">{currentSubscription.planName}</span>
              <Badge variant={statusVariant(currentSubscription.status)}>{statusLabel(currentSubscription.status)}</Badge>
            </div>
          ) : (
            <p className="text-sm">Nenhuma assinatura encontrada.</p>
          )}
        </Card>
      </section>

      {(workoutsResult.status === "rejected" ||
        dietsResult.status === "rejected" ||
        progressResult.status === "rejected" ||
        subscriptionsResult.status === "rejected") && (
        <p className="text-sm text-destructive">Alguns dados nao puderam ser carregados agora. Tente novamente em instantes.</p>
      )}
    </div>
  );
}
