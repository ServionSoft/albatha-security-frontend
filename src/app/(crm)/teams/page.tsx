"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { listTeams, createTeam, updateTeam, setTeamStatus } from "@/lib/services/teamService";
import { listAllLocations } from "@/lib/services/locationService";
import { listAllFieldEmployees } from "@/lib/services/employeeService";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EntityStatus, Team } from "@/lib/types/crm";

const selectClass = "h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm";

type TeamRow = Team & { locationName: string; membersCount: number };

export default function TeamsPage() {
  const { canWrite } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [confirm, setConfirm] = useState<TeamRow | null>(null);

  const teamsQuery = useQuery({
    queryKey: ["teams", q, status, page],
    queryFn: () => listTeams({ q, status, page, pageSize }),
  });
  const locationsQuery = useQuery({ queryKey: ["allLocations"], queryFn: listAllLocations });
  const employeesQuery = useQuery({ queryKey: ["allFieldEmployees"], queryFn: listAllFieldEmployees });

  const data = teamsQuery.data;
  const locations = locationsQuery.data ?? [];
  const employees = employeesQuery.data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (team: TeamRow) => {
    setEditing(team);
    setFormOpen(true);
  };

  const onToggleStatus = async (team: TeamRow) => {
    try {
      const next: EntityStatus = team.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await setTeamStatus(team.id, next);
      toast.success(next === "ACTIVE" ? "Team activated." : "Team deactivated.");
      setConfirm(null);
      teamsQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update team.");
    }
  };

  if (teamsQuery.isLoading || locationsQuery.isLoading) {
    return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  }
  if (teamsQuery.isError) {
    toast.error("Failed to load teams.");
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme setup</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Teams</h1>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              value={q}
              onChange={e => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by team name..."
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={[
                  "h-11 px-4 rounded-[var(--radius-sm)] border font-semibold text-sm",
                  status === s
                    ? "border-primary/60 bg-[#F4E8EE] text-[var(--primary)]"
                    : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
                ].join(" ")}>
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>
          {canWrite ? <Button onClick={openCreate}>Create team</Button> : null}
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Team</Th>
                <Th>Location</Th>
                <Th>Members</Th>
                <Th>Status</Th>
                {canWrite ? <Th className="text-right">Actions</Th> : null}
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map(t => (
                <tr key={t.id}>
                  <Td className="font-semibold">{t.name}</Td>
                  <Td>{t.locationName}</Td>
                  <Td>{t.membersCount}</Td>
                  <Td>{t.status === "ACTIVE" ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="muted">{t.status}</Badge>}</Td>
                  {canWrite ? (
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                          Edit
                        </Button>
                        <Button
                          variant={t.status === "ACTIVE" ? "danger" : "outline"}
                          size="sm"
                          onClick={() => setConfirm(t)}>
                          {t.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </Td>
                  ) : null}
                </tr>
              ))}
              {(data?.items ?? []).length === 0 ? (
                <tr>
                  <Td colSpan={canWrite ? 5 : 4} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No teams match your filters.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} />
      </Card>

      <TeamFormDialog
        open={formOpen}
        team={editing}
        locations={locations}
        employees={employees}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          teamsQuery.refetch();
        }}
      />

      <Dialog open={!!confirm} onOpenChange={o => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.status === "ACTIVE" ? "Deactivate team" : "Activate team"}</DialogTitle>
            <DialogDescription>
              {confirm?.status === "ACTIVE"
                ? `${confirm?.name} will be marked inactive. Members stay assigned.`
                : `${confirm?.name} will be marked active again.`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm?.status === "ACTIVE" ? "danger" : "default"}
              onClick={() => confirm && onToggleStatus(confirm)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamFormDialog({
  open,
  team,
  locations,
  employees,
  onClose,
  onSaved,
}: {
  open: boolean;
  team: TeamRow | null;
  locations: Array<{ id: string; name: string; status: string }>;
  employees: Array<{ id: string; name: string; teamId: string | null }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [leaderUserId, setLeaderUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<EntityStatus>("ACTIVE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(team?.name ?? "");
    setLocationId(team?.locationId ?? null);
    setLeaderUserId(team?.leaderUserId ?? null);
    setStatus(team?.status ?? "ACTIVE");
  }, [open, team]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), locationId, leaderUserId, status };
      if (team) {
        await updateTeam(team.id, payload);
        toast.success("Team updated.");
      } else {
        await createTeam(payload);
        toast.success("Team created.");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save team.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team ? "Edit team" : "Create team"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Team name</span>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gold Guards" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Location</span>
            <select className={selectClass} value={locationId ?? ""} onChange={e => setLocationId(e.target.value || null)}>
              <option value="">Unassigned</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Team leader</span>
            <select
              className={selectClass}
              value={leaderUserId ?? ""}
              onChange={e => setLeaderUserId(e.target.value || null)}>
              <option value="">Unassigned</option>
              {employees.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </label>
          {team ? (
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Status</span>
              <select className={selectClass} value={status} onChange={e => setStatus(e.target.value as EntityStatus)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : team ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
