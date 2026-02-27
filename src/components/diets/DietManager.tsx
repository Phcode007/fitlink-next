"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Informe o título da dieta.");
      return;
    }

    const caloriesValue = dailyCalories ? Number(dailyCalories) : undefined;
    if (dailyCalories && !Number.isFinite(caloriesValue)) {
      setError("Calorias diárias inválidas.");
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
        setError(body.message || "Não foi possível criar dieta.");
        return;
      }

      setTitle("");
      setDescription("");
      setDailyCalories("");
      setSuccess("Dieta criada com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao criar dieta.");
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
        setError(body.message || "Não foi possível atualizar dieta.");
        return;
      }

      setSuccess("Dieta atualizada com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao atualizar dieta.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    const confirmed = window.confirm("Tem certeza que deseja excluir esta dieta?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/diets/${id}`, {
        method: "DELETE",
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Não foi possível excluir dieta.");
        return;
      }

      setSuccess("Dieta excluída com sucesso.");
      router.refresh();
    } catch {
      setError("Falha de conexão ao excluir dieta.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <h2 className="text-lg font-semibold">Criar nova dieta</h2>
          <Input
            label="Título da dieta"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Dieta hipocalórica"
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Descreva as refeições e orientações gerais"
          />
          <Input
            label="Calorias diárias"
            value={dailyCalories}
            onChange={(event) => setDailyCalories(event.target.value)}
            placeholder="Ex: 2000"
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

      {initialDiets.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30" aria-hidden="true">
              <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-3 9H8c0-3-3-5-3-9a7 7 0 0 1 7-7Z" /><path d="M8.5 18h7" /><path d="M8 22h8" />
            </svg>
            <p className="text-sm text-foreground/60">Nenhuma dieta cadastrada ainda.</p>
            <p className="text-xs text-foreground/40">Use o formulário acima para criar sua primeira dieta.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {initialDiets.map((diet) => (
            <DietEditor
              key={diet.id}
              diet={diet}
              onSave={handleEdit}
              onDelete={handleDelete}
              loadingSave={savingId === diet.id}
              loadingDelete={deletingId === diet.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DietEditor({
  diet,
  onSave,
  onDelete,
  loadingSave,
  loadingDelete,
}: {
  diet: DietPlan;
  onSave: (id: string, payload: { title: string; description: string; dailyCalories?: number; isActive: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loadingSave: boolean;
  loadingDelete: boolean;
}) {
  const [title, setTitle] = useState(diet.title);
  const [description, setDescription] = useState(diet.description ?? "");
  const [dailyCalories, setDailyCalories] = useState(diet.dailyCalories?.toString() ?? "");
  const [isActive, setIsActive] = useState(diet.isActive);

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
      <Input
        label="Calorias diárias"
        value={dailyCalories}
        onChange={(event) => setDailyCalories(event.target.value)}
        type="number"
        min={0}
      />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Dieta ativa
      </label>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          loading={loadingSave}
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
          Salvar alterações
        </Button>
        <Button
          type="button"
          variant="destructive"
          loading={loadingDelete}
          onClick={() => void onDelete(diet.id)}
          aria-label="Excluir dieta"
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
