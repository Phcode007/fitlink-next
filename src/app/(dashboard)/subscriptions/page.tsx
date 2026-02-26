import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Ativa";
  if (status === "TRIALING") return "Em teste";
  if (status === "PAST_DUE") return "Pagamento pendente";
  return "Cancelada";
}

function badgeVariant(status: string): "success" | "warning" | "error" {
  if (status === "ACTIVE") return "success";
  if (status === "TRIALING") return "warning";
  return "error";
}

export default async function SubscriptionsPage() {
  const subscriptions = await api.subscriptions.list().catch(() => []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Assinaturas</h1>
      <Card>
        <ul className="grid gap-3">
          {subscriptions.length ? (
            subscriptions.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted p-4">
                <div>
                  <p className="font-medium">{item.planName}</p>
                  <p className="text-sm">Atualizado em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <Badge variant={badgeVariant(item.status)}>{statusLabel(item.status)}</Badge>
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhuma assinatura encontrada.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
