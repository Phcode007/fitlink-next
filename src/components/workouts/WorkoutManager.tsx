"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { WorkoutPlan } from "@/lib/types";

export function WorkoutManager({ initialWorkouts }: { initialWorkouts: WorkoutPlan[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Informe o título do treino.");
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
        setError(body.message || "Não foi possível criar treino.");
        return;
      }

      setTitle("");
      setDescription("");
      setSuccess("Treino criado com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao criar treino.");
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
        setError(body.message || "Não foi possível atualizar treino.");
        return;
      }

      setSuccess("Treino atualizado com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao atualizar treino.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    const confirmed = window.confirm("Tem certeza que deseja excluir este treino?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Não foi possível excluir treino.");
        return;
      }

      setSuccess("Treino excluído com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao excluir treino.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <h2 className="text-lg font-semibold">Criar novo treino</h2>
          <Input
            label="Título do treino"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Treino A — Peito e Tríceps"
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Descreva os exercícios, séries e repetições"
          />
          <Button type="submit" variant="primary" loading={loadingCreate} aria-label="Criar treino">
            Criar treino
          </Button>
        </form>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}

      {initialWorkouts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30" aria-hidden="true">
              <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M3 12h1" /><path d="M20 12h1" /><rect width="4" height="8" x="1" y="8" rx="1" /><rect width="4" height="8" x="19" y="8" rx="1" />
            </svg>
            <p className="text-sm text-foreground/60">Nenhum treino cadastrado ainda.</p>
            <p className="text-xs text-foreground/40">Use o formulário acima para criar seu primeiro treino.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {initialWorkouts.map((workout) => (
            <WorkoutEditor
              key={workout.id}
              workout={workout}
              onSave={handleEdit}
              onDelete={handleDelete}
              loadingSave={savingId === workout.id}
              loadingDelete={deletingId === workout.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutEditor({
  workout,
  onSave,
  onDelete,
  loadingSave,
  loadingDelete,
}: {
  workout: WorkoutPlan;
  onSave: (id: string, payload: { title: string; description: string; isActive: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loadingSave: boolean;
  loadingDelete: boolean;
}) {
  const [title, setTitle] = useState(workout.title);
  const [description, setDescription] = useState(workout.description ?? "");
  const [isActive, setIsActive] = useState(workout.isActive);

  return (
    <Card className="grid gap-3">
      <Input
        label="Título"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Textarea
        label="Descrição"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Treino ativo
      </label>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          loading={loadingSave}
          onClick={() => void onSave(workout.id, { title, description, isActive })}
          aria-label="Salvar treino"
        >
          Salvar alterações
        </Button>
        <Button
          type="button"
          variant="destructive"
          loading={loadingDelete}
          onClick={() => void onDelete(workout.id)}
          aria-label="Excluir treino"
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
