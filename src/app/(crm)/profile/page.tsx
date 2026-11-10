"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { roleLabel } from "@/lib/auth/session";
import { getEmployee } from "@/lib/services/employeeService";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getEmployee(user!.id),
    enabled: Boolean(user?.id),
  });

  const profile = query.data as
    | (NonNullable<typeof query.data> & { teamName?: string | null; locationName?: string | null })
    | undefined;
  const name = profile?.name ?? user?.name ?? "";
  const employeeId = profile?.employeeId ?? user?.employeeId ?? "";
  const email = profile?.email ?? user?.email ?? "";
  const role = user?.role;
  const status = profile?.status ?? "ACTIVE";

  const onSignOut = async () => {
    await logout();
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Account</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Profile</h1>
      </div>

      <Card className="p-6 space-y-5">
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Name</div>
          <div className="mt-1 text-lg font-bold">{name}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Employee ID</div>
          <div className="mt-1 text-sm font-semibold">{employeeId}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Email</div>
          <div className="mt-1 text-sm">{email || "—"}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="muted">{role ? roleLabel(role) : "—"}</Badge>
          {status === "ACTIVE" ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="muted">{status}</Badge>}
        </div>
        {profile ? (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Team</div>
              <div className="mt-1 text-sm font-semibold">{profile.teamName ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Location</div>
              <div className="mt-1 text-sm font-semibold">{profile.locationName ?? "—"}</div>
            </div>
          </div>
        ) : null}
        <div className="pt-2">
          <Button variant="danger" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
