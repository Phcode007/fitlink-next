"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { JwtPayload } from "@/lib/types";

type AuthContextValue = {
  session: JwtPayload | null;
  setSession: (session: JwtPayload | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: JwtPayload | null;
}) {
  const [session, setSession] = useState<JwtPayload | null>(initialSession);

  const value = useMemo(() => ({ session, setSession }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
