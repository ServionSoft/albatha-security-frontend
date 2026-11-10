"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createEmployee, updateEmployee } from "@/lib/services/employeeService";
import { listAllTeams } from "@/lib/services/teamService";
import { listAllLocations } from "@/lib/services/locationService";
import type { User } from "@/lib/types/crm";

const fieldRoles: Array<User["role"]> = ["GUARD", "TEAM_LEADER"];
const selectClass = "h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm";

type Props = {
  open: boolean;
  employee?: User | null;
  onClose: () => void;
  onSaved: (result?: { temporaryPassword?: string }) => void;
};

export function EmployeeFormDialog({ open, employee, onClose, onSaved }: Props) {
  const isEdit = Boolean(employee?.id);
  const teamsQuery = useQuery({ queryKey: ["allTeams"], queryFn: listAllTeams, enabled: open });
  const locationsQuery = useQuery({ queryKey: ["allLocations"], queryFn: listAllLocations, enabled: open });

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<User["role"]>("GUARD");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const teams = teamsQuery.data ?? [];
  const locations = locationsQuery.data ?? [];

  useEffect(() => {
    if (!open) return;
    setName(employee?.name ?? "");
    setEmployeeId(employee?.employeeId ?? "");
    setEmail(employee?.email ?? "");
    setRole(employee?.role === "TEAM_LEADER" ? "TEAM_LEADER" : "GUARD");
    setTeamId(employee?.teamId ?? null);
    setLocationId(employee?.locationId ?? null);
  }, [open, employee]);

  const onTeamChange = (nextTeamId: string | null) => {
    setTeamId(nextTeamId);
    const team = teams.find(t => t.id === nextTeamId);
    if (team?.locationId) setLocationId(team.locationId);
  };

  const submit = async () => {
    if (!name.trim() || !employeeId.trim()) {
      toast.error("Name and employee ID are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        email: email.trim(),
        role,
        teamId,
        locationId,
        status: "ACTIVE" as const,
      };
      if (isEdit && employee) {
        await updateEmployee(employee.id, payload);
        toast.success("Employee updated.");
        onSaved();
      } else {
        const created = await createEmployee(payload);
        toast.success("Employee created.");
        onSaved({ temporaryPassword: created.temporaryPassword });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Create employee"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Full name</span>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ahmed Khan" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Employee ID</span>
            <Input
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder="e.g. ABRE-00130"
              disabled={isEdit}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Email</span>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="optional" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Role</span>
            <select className={selectClass} value={role} onChange={e => setRole(e.target.value as User["role"])}>
              {fieldRoles.map(r => (
                <option key={r} value={r}>
                  {r === "TEAM_LEADER" ? "Team Leader" : "Guard"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Team</span>
            <select
              className={selectClass}
              value={teamId ?? ""}
              onChange={e => onTeamChange(e.target.value || null)}>
              <option value="">Unassigned</option>
              {teams
                .filter(t => t.status === "ACTIVE" || t.id === teamId)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Location</span>
            <select
              className={selectClass}
              value={locationId ?? ""}
              onChange={e => setLocationId(e.target.value || null)}>
              <option value="">Unassigned</option>
              {locations
                .filter(l => l.status === "ACTIVE" || l.id === locationId)
                .map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
