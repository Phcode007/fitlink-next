"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type NavbarProps = {
  email: string;
  onMenuClick: () => void;
};

export function Navbar({ email, onMenuClick }: NavbarProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-border p-2 lg:hidden"
          aria-label="Abrir menu"
        >
          <span className="block h-0.5 w-5 bg-foreground" />
          <span className="mt-1 block h-0.5 w-5 bg-foreground" />
          <span className="mt-1 block h-0.5 w-5 bg-foreground" />
        </button>
        <div className="font-logo text-xl font-semibold text-primary">FitLink</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-medium text-foreground">
            {email.slice(0, 1).toUpperCase()}
          </div>
          <span className="max-w-48 truncate text-sm font-medium">{email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={logout} aria-label="Fazer logout">
          Sair
        </Button>
      </div>
    </header>
  );
}

