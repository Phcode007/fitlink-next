import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default async function WorkoutsPage() {
  const workouts = await api.workouts.list().catch(() => []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Treinos</h1>
      <Card>
        <ul className="grid gap-3">
          {workouts.length ? (
            workouts.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm">{item.description ?? "Sem descricao"}</p>
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhum treino encontrado.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
