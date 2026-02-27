import { Card } from "@/components/ui/Card";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { api } from "@/lib/api";

export default async function ProgressPage() {
  const metrics = await api.progress.list().catch(() => []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Progresso</h1>

      <ProgressChart metrics={metrics} />

      <Card>
        {metrics.length ? (
          <ul className="grid gap-3">
            {metrics.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted p-4 text-sm">
                <p>Peso: {item.weightKg ?? "-"} kg</p>
                <p>Gordura: {item.bodyFatPercent ?? "-"}%</p>
                <p>Massa muscular: {item.muscleMassKg ?? "-"} kg</p>
                <p>IMC: {item.bmi ?? "-"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30" aria-hidden="true">
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <p className="text-sm text-foreground/60">Nenhuma medição registrada ainda.</p>
            <p className="text-xs text-foreground/40">As medições aparecerão aqui conforme forem lançadas pelo seu profissional.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
