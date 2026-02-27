"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BodyMetric } from "@/lib/types";

type Props = {
  metrics: BodyMetric[];
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

export function ProgressChart({ metrics }: Props) {
  const data = [...metrics]
    .sort((a, b) => +new Date(a.measuredAt) - +new Date(b.measuredAt))
    .map((m) => ({
      date: dateFormatter.format(new Date(m.measuredAt)),
      "Peso (kg)": m.weightKg ?? undefined,
      "Gordura (%)": m.bodyFatPercent ?? undefined,
    }));

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold">Evolução</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: "0.75rem", fontSize: "0.875rem" }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
          <Line
            type="monotone"
            dataKey="Peso (kg)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Gordura (%)"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
