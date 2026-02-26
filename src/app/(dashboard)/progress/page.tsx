import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default async function ProgressPage() {
  const metrics = await api.progress.list().catch(() => []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Progresso</h1>
      <Card>
        <ul className="grid gap-3">
          {metrics.length ? (
            metrics.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted p-4 text-sm">
                <p>Peso: {item.weightKg ?? "-"} kg</p>
                <p>Gordura: {item.bodyFatPercent ?? "-"}%</p>
                <p>Massa muscular: {item.muscleMassKg ?? "-"} kg</p>
                <p>IMC: {item.bmi ?? "-"}</p>
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhuma medicao registrada.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
