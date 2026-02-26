"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-xl border bg-input px-3 text-base text-foreground outline-none ring-0 placeholder:text-foreground/75 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          error ? "border-destructive" : "border-border",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type { InputProps };
