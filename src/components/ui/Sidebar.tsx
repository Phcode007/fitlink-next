"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

type SidebarProps = {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

const navItems: NavItem[] = [
  { label: "Painel", href: "/dashboard", roles: ["USER", "TRAINER", "NUTRITIONIST", "ADMIN"] },
  { label: "Profissionais", href: "/professionals", roles: ["USER", "TRAINER", "NUTRITIONIST", "ADMIN"] },
  { label: "Treinos", href: "/workouts", roles: ["USER", "TRAINER", "ADMIN"] },
  { label: "Dietas", href: "/diets", roles: ["USER", "NUTRITIONIST", "ADMIN"] },
  { label: "Progresso", href: "/progress", roles: ["USER", "TRAINER", "NUTRITIONIST", "ADMIN"] },
  { label: "Assinaturas", href: "/subscriptions", roles: ["USER", "ADMIN"] },
  { label: "Perfil", href: "/profile", roles: ["USER", "TRAINER", "NUTRITIONIST", "ADMIN"] },
];

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-foreground/40 lg:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-border bg-muted p-6 lg:static lg:z-auto lg:block lg:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="font-logo mb-8 text-2xl font-semibold text-primary">FitLink</div>
        <nav className="grid gap-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
