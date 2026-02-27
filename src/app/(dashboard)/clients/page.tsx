import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Role } from "@/lib/types";

type PersonItem = {
  id: string;
  email: string;
  role?: string;
  isActive?: boolean;
};

function extractFromAny(input: unknown): PersonItem[] {
  const seen = new Set<string>();
  const output: PersonItem[] = [];

  function addCandidate(record: Record<string, unknown>) {
    const user = typeof record.user === "object" && record.user ? (record.user as Record<string, unknown>) : null;
    const email =
      (typeof record.email === "string" ? record.email : null) ||
      (user && typeof user.email === "string" ? user.email : null);

    if (!email) return;

    const id =
      (typeof record.id === "string" ? record.id : null) ||
      (user && typeof user.id === "string" ? user.id : null) ||
      email;

    if (seen.has(id)) return;
    seen.add(id);

    output.push({
      id,
      email,
      role:
        (typeof record.role === "string" ? record.role : null) ||
        (user && typeof user.role === "string" ? user.role : undefined) ||
        undefined,
      isActive:
        (typeof record.isActive === "boolean" ? record.isActive : null) ||
        (user && typeof user.isActive === "boolean" ? user.isActive : undefined) ||
        undefined,
    });
  }

  function visit(node: unknown, depth = 0) {
    if (depth > 5 || node == null) return;

    if (Array.isArray(node)) {
      for (const item of node) {
        if (item && typeof item === "object") {
          addCandidate(item as Record<string, unknown>);
          visit(item, depth + 1);
        }
      }
      return;
    }

    if (typeof node === "object") {
      const record = node as Record<string, unknown>;
      addCandidate(record);

      for (const value of Object.values(record)) {
        visit(value, depth + 1);
      }
    }
  }

  visit(input);
  return output;
}

function titleByRole(role: Role): string {
  if (role === "TRAINER") return "Meus alunos";
  return "Meus pacientes";
}

function subtitleByRole(role: Role): string {
  if (role === "TRAINER") {
    return "Visualize os alunos vinculados ao seu acompanhamento.";
  }
  return "Visualize os pacientes vinculados ao seu acompanhamento nutricional.";
}

export default async function ClientsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "TRAINER" && session.role !== "NUTRITIONIST") {
    redirect("/dashboard");
  }

  const rawDashboard =
    session.role === "TRAINER"
      ? await api.trainers.dashboard().catch(() => null)
      : await api.nutritionists.dashboard().catch(() => null);

  const people = rawDashboard ? extractFromAny(rawDashboard) : [];

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">{titleByRole(session.role)}</h1>
        <p className="text-base">{subtitleByRole(session.role)}</p>
      </div>

      <Card>
        <ul className="grid gap-3">
          {people.length ? (
            people.map((person) => (
              <li key={person.id} className="flex items-center justify-between rounded-xl border border-border bg-muted p-4">
                <div>
                  <p className="font-medium">{person.email}</p>
                  {person.role ? <p className="text-sm">Perfil: {person.role}</p> : null}
                </div>
                <span className={`rounded-xl px-3 py-1 text-sm ${person.isActive === false ? "bg-destructive text-white" : "bg-primary text-primary-foreground"}`}>
                  {person.isActive === false ? "Inativo" : "Ativo"}
                </span>
              </li>
            ))
          ) : (
            <li className="text-sm">Nenhum registro encontrado no momento.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
