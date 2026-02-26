import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-foreground shadow-soft", paddingClasses[padding], className)}>
      {children}
    </div>
  );
}

export type { CardProps };
