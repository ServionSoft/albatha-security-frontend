"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CrmRole, CrmUser } from "@/lib/auth/session";
import { canWrite, getSessionUser, setSessionUser } from "@/lib/auth/session";
import { api, setToken } from "@/lib/api/client";

type AuthContextValue = {
  user: CrmUser | null;
  ready: boolean;
  role: CrmRole | null;
  canWrite: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CrmUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSessionUser());
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      ready,
      role: user?.role ?? null,
      canWrite: user ? canWrite(user.role) : false,
      login: async (employeeId, password) => {
        const data = await api<{
          user: { id: string; name: string; employeeId: string; email: string | null; role: string; roles: string[] };
          session: { token: string; activeRole: CrmRole };
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ employeeId, password }),
        });
        const role = (data.session.activeRole || data.user.role) as CrmRole;
        if (!["HR_ADMIN", "MANAGEMENT", "SUPER_USER"].includes(role)) {
          throw new Error("This account cannot access the admin portal.");
        }
        const sessionUser: CrmUser = {
          id: data.user.id,
          name: data.user.name,
          employeeId: data.user.employeeId,
          role,
          email: data.user.email ?? "",
        };
        setToken(data.session.token);
        setSessionUser(sessionUser);
        setUser(sessionUser);
      },
      logout: async () => {
        try {
          await api("/auth/logout", { method: "POST" });
        } catch {
          // ignore
        }
        setToken(null);
        setSessionUser(null);
        setUser(null);
      },
    };
  }, [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
