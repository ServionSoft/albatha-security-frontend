"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/AuthContext";
import { mockAccounts, roleLabel } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const defaults = useMemo(() => mockAccounts.find(a => a.role === "HR_ADMIN") ?? mockAccounts[0], []);
  const [employeeId, setEmployeeId] = useState(defaults.employeeId);
  const [password, setPassword] = useState(defaults.password);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(employeeId, password);
      toast.success("Signed in");
      router.replace("/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign in failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-6">
      <Card className="w-full max-w-[520px] p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-[16px] bg-[#F4E8EE] text-[var(--primary)] grid place-items-center">
            <Icon name="shield" size={20} />
          </div>
          <div>
            <div className="font-bold text-lg">ABRE Guard</div>
            <div className="text-xs text-[var(--text-secondary)]">Admin Portal</div>
          </div>
        </div>

        <h1 className="text-[28px] font-bold tracking-[-0.03em]">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          HR Admin / HHR has full programme administration. Management is read-only.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Employee ID</span>
            <Input
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              autoComplete="username"
              onKeyDown={e => {
                if (e.key === "Enter") void onSignIn();
              }}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Password</span>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={e => {
                if (e.key === "Enter") void onSignIn();
              }}
            />
          </label>
        </div>

        {error ? <div className="mt-3 text-sm text-[var(--danger)] font-semibold">{error}</div> : null}

        <div className="mt-6">
          <Button className="w-full" onClick={onSignIn} disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <div className="mt-7 pt-5 border-t border-[rgba(231,225,228,0.75)]">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Quick test accounts</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockAccounts.map(a => (
              <button
                key={a.id}
                type="button"
                className="text-left rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3 hover:bg-[var(--cream-muted)]"
                onClick={() => {
                  setEmployeeId(a.employeeId);
                  setPassword(a.password);
                  setError(null);
                }}>
                <div className="font-semibold text-sm">{a.name}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{roleLabel(a.role)}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

