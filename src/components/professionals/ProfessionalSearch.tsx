"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type FilterRole = "ALL" | "TRAINER" | "NUTRITIONIST";

type Professional = {
  id: string;
  name?: string | null;
  email: string;
  role: "TRAINER" | "NUTRITIONIST" | "USER" | "ADMIN";
  isActive: boolean;
};

function roleLabel(role: Professional["role"]): string {
  if (role === "TRAINER") return "Educação Física";
  if (role === "NUTRITIONIST") return "Nutrição";
  return role;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function ProfessionalSearch() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<FilterRole>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const debouncedQuery = useDebounce(query, 350);

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("role", role);
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    return `/api/professionals/search?${params.toString()}`;
  }, [debouncedQuery, role]);

  const search = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { message?: string; professionals?: Professional[] };

      if (!response.ok) {
        setError(body.message || "Não foi possível buscar profissionais.");
        setProfessionals([]);
        return;
      }

      setProfessionals(body.professionals || []);
    } catch {
      setError("Falha de conexão. Tente novamente.");
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
          label="Pesquisar por nome"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite o nome do profissional"
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
            <option value="TRAINER">Educação Física</option>
            <option value="NUTRITIONIST">Nutrição</option>
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
                <p className="font-medium">{professional.name || "Nome não informado"}</p>
                <p className="text-sm">{professional.email}</p>
                <p className="text-sm">{roleLabel(professional.role)}</p>
              </div>
              <span className={`rounded-xl px-3 py-1 text-sm ${professional.isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {professional.isActive ? "Ativo" : "Inativo"}
              </span>
            </Card>
          ))
        ) : (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/30" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-sm text-foreground/60">Nenhum profissional encontrado para este filtro.</p>
              <button
                type="button"
                onClick={() => { setQuery(""); setRole("ALL"); }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
