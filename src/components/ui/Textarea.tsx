"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = {
  label: string;
  error?: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="grid gap-2">
      <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={cn(
          "rounded-xl border bg-input px-3 py-2 text-base text-foreground outline-none ring-0 placeholder:text-foreground/75 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          error ? "border-destructive" : "border-border",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="text-sm text-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type { TextareaProps };
