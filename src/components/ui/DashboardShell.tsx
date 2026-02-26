"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import type { Role } from "@/lib/types";

export function DashboardShell({
  children,
  role,
  email,
}: {
  children: React.ReactNode;
  role: Role;
  email: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <Sidebar role={role} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar email={email} onMenuClick={() => setIsOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
