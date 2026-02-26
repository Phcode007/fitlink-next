"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type FilterRole = "ALL" | "TRAINER" | "NUTRITIONIST";

type Professional = {
  id: string;
  email: string;
  role: "TRAINER" | "NUTRITIONIST" | "USER" | "ADMIN";
  isActive: boolean;
};

function roleLabel(role: Professional["role"]): string {
  if (role === "TRAINER") return "Educacao Fisica";
  if (role === "NUTRITIONIST") return "Nutricao";
  return role;
}

export function ProfessionalSearch() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<FilterRole>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("role", role);
    if (query.trim()) params.set("q", query.trim());
    return `/api/professionals/search?${params.toString()}`;
  }, [query, role]);

  const search = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { message?: string; professionals?: Professional[] };

      if (!response.ok) {
        setError(body.message || "Nao foi possivel buscar profissionais.");
        setProfessionals([]);
        return;
      }

      setProfessionals(body.professionals || []);
    } catch {
      setError("Falha de conexao. Tente novamente.");
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void search();
  }, [search]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
        <Input
          label="Pesquisar por email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite parte do email"
        />

        <div className="grid gap-2">
          <label htmlFor="roleFilter" className="text-sm font-medium text-foreground">
            Tipo de profissional
          </label>
          <select
            id="roleFilter"
            value={role}
            onChange={(event) => setRole(event.target.value as FilterRole)}
            className="h-11 rounded-xl border border-border bg-input px-3 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="ALL">Todos</option>
            <option value="TRAINER">Educacao Fisica</option>
            <option value="NUTRITIONIST">Nutricao</option>
          </select>
        </div>

        <Button type="button" variant="primary" onClick={() => void search()} loading={loading} aria-label="Buscar profissionais">
          Buscar
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-3">
        {professionals.length ? (
          professionals.map((professional) => (
            <Card key={professional.id} className="flex items-center justify-between" padding="sm">
              <div>
                <p className="font-medium">{professional.email}</p>
                <p className="text-sm">{roleLabel(professional.role)}</p>
              </div>
              <span className={`rounded-xl px-3 py-1 text-sm ${professional.isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {professional.isActive ? "Ativo" : "Inativo"}
              </span>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm">Nenhum profissional encontrado para este filtro.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
