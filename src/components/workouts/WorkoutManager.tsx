"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WorkoutPlan } from "@/lib/types";

export function WorkoutManager({ initialWorkouts }: { initialWorkouts: WorkoutPlan[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Informe o titulo do treino.");
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || undefined, isActive: true }),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Nao foi possivel criar treino.");
        return;
      }

      setTitle("");
      setDescription("");
      setSuccess("Treino criado com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexao ao criar treino.");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEdit(id: string, payload: { title: string; description: string; isActive: boolean }) {
    setError("");
    setSuccess("");

    try {
      setSavingId(id);
      const response = await fetch(`/api/workouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Nao foi possivel atualizar treino.");
        return;
      }

      setSuccess("Treino atualizado com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexao ao atualizar treino.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <h2 className="text-lg font-semibold">Criar novo treino</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl border border-border bg-input px-3 text-base"
            placeholder="Titulo do treino"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-xl border border-border bg-input px-3 py-2 text-base"
            rows={3}
            placeholder="Descricao"
          />
          <Button type="submit" variant="primary" loading={loadingCreate} aria-label="Criar treino">
            Criar treino
          </Button>
        </form>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}

      <div className="grid gap-4">
        {initialWorkouts.map((workout) => (
          <WorkoutEditor key={workout.id} workout={workout} onSave={handleEdit} loading={savingId === workout.id} />
        ))}
      </div>
    </div>
  );
}

function WorkoutEditor({
  workout,
  onSave,
  loading,
}: {
  workout: WorkoutPlan;
  onSave: (id: string, payload: { title: string; description: string; isActive: boolean }) => Promise<void>;
  loading: boolean;
}) {
  const [title, setTitle] = useState(workout.title);
  const [description, setDescription] = useState(workout.description ?? "");
  const [isActive, setIsActive] = useState(workout.isActive);

  return (
    <Card className="grid gap-3">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-xl border border-border bg-input px-3 text-base" />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="rounded-xl border border-border bg-input px-3 py-2 text-base"
        rows={3}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Treino ativo
      </label>
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        onClick={() => void onSave(workout.id, { title, description, isActive })}
        aria-label="Salvar treino"
      >
        Salvar alteracoes
      </Button>
    </Card>
  );
}
