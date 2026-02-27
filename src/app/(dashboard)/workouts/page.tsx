import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WorkoutManager } from "@/components/workouts/WorkoutManager";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";

export default async function WorkoutsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workouts = await api.workouts.list().catch(() => []);

  if (session.role === "TRAINER") {
    return (
      <div className="grid gap-6">
        <h1 className="text-2xl font-semibold">Gestão de treinos</h1>
        <WorkoutManager initialWorkouts={workouts} />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Treinos</h1>
      <Card>
        <ul className="grid gap-3">
          {workouts.length ? (
            workouts.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm">{item.description ?? "Sem descrição"}</p>
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
