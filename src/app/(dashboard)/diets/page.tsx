import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default async function DietsPage() {
  const diets = await api.diets.list().catch(() => []);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Dietas</h1>
      <Card>
        <ul className="grid gap-3">
          {diets.length ? (
            diets.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm">{item.description ?? "Sem descricao"}</p>
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhuma dieta encontrada.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
