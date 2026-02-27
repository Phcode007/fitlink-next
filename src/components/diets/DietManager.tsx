"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DietPlan } from "@/lib/types";

export function DietManager({ initialDiets }: { initialDiets: DietPlan[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dailyCalories, setDailyCalories] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Informe o titulo da dieta.");
      return;
    }

    const caloriesValue = dailyCalories ? Number(dailyCalories) : undefined;
    if (dailyCalories && !Number.isFinite(caloriesValue)) {
      setError("Calorias diarias invalidas.");
      return;
    }

    try {
      setLoadingCreate(true);
      const response = await fetch("/api/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          dailyCalories: caloriesValue,
          isActive: true,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Nao foi possivel criar dieta.");
        return;
      }

      setTitle("");
      setDescription("");
      setDailyCalories("");
      setSuccess("Dieta criada com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexao ao criar dieta.");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEdit(
    id: string,
    payload: { title: string; description: string; dailyCalories?: number; isActive: boolean },
  ) {
    setError("");
    setSuccess("");

    try {
      setSavingId(id);
      const response = await fetch(`/api/diets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Nao foi possivel atualizar dieta.");
        return;
      }

      setSuccess("Dieta atualizada com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexao ao atualizar dieta.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <h2 className="text-lg font-semibold">Criar nova dieta</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl border border-border bg-input px-3 text-base"
            placeholder="Titulo da dieta"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-xl border border-border bg-input px-3 py-2 text-base"
            rows={3}
            placeholder="Descricao"
          />
          <input
            value={dailyCalories}
            onChange={(event) => setDailyCalories(event.target.value)}
            className="h-11 rounded-xl border border-border bg-input px-3 text-base"
            placeholder="Calorias diarias"
            type="number"
            min={0}
          />
          <Button type="submit" variant="primary" loading={loadingCreate} aria-label="Criar dieta">
            Criar dieta
          </Button>
        </form>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-primary">{success}</p> : null}

      <div className="grid gap-4">
        {initialDiets.map((diet) => (
          <DietEditor key={diet.id} diet={diet} onSave={handleEdit} loading={savingId === diet.id} />
        ))}
      </div>
    </div>
  );
}

function DietEditor({
  diet,
  onSave,
  loading,
}: {
  diet: DietPlan;
  onSave: (id: string, payload: { title: string; description: string; dailyCalories?: number; isActive: boolean }) => Promise<void>;
  loading: boolean;
}) {
  const [title, setTitle] = useState(diet.title);
  const [description, setDescription] = useState(diet.description ?? "");
  const [dailyCalories, setDailyCalories] = useState(diet.dailyCalories?.toString() ?? "");
  const [isActive, setIsActive] = useState(diet.isActive);

  return (
    <Card className="grid gap-3">
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-xl border border-border bg-input px-3 text-base" />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="rounded-xl border border-border bg-input px-3 py-2 text-base"
        rows={3}
      />
      <input
        value={dailyCalories}
        onChange={(event) => setDailyCalories(event.target.value)}
        className="h-11 rounded-xl border border-border bg-input px-3 text-base"
        type="number"
        min={0}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Dieta ativa
      </label>
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        onClick={() =>
          void onSave(diet.id, {
            title,
            description,
            dailyCalories: dailyCalories ? Number(dailyCalories) : undefined,
            isActive,
          })
        }
        aria-label="Salvar dieta"
      >
        Salvar alteracoes
      </Button>
    </Card>
  );
}
