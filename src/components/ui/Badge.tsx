import type { ReactNode } from "react";

type BadgeProps = {
  variant: "default" | "success" | "warning" | "error" | "outline";
  children: ReactNode;
};

const variantClasses: Record<BadgeProps["variant"], string> = {
  default: "bg-accent text-foreground",
  success: "bg-primary text-white",
  warning: "bg-accent text-foreground",
  error: "bg-destructive text-white",
  outline: "border border-border bg-transparent text-foreground",
};

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-medium ${variantClasses[variant]}`}>{children}</span>;
}

export type { BadgeProps };
