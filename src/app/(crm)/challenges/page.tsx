"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listCycles } from "@/lib/services/cycleService";
import {
  createActivity,
  createChallenge,
  listChallenges,
  setActivityStatus,
  updateActivity,
  type Activity,
  type Challenge,
} from "@/lib/services/challengeService";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ChallengeCategory } from "@/lib/types/crm";

const categories: ChallengeCategory[] = ["MOVE", "PROGRESS", "RECOGNITION"];

function statusBadge(status: string) {
  if (status === "ACTIVE") return <Badge variant="success">ACTIVE</Badge>;
  if (status === "CLOSED" || status === "INACTIVE") return <Badge variant="danger">{status}</Badge>;
  return <Badge variant="muted">{status}</Badge>;
}

export default function ChallengesPage() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [cycleId, setCycleId] = useState<string>("ALL");
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [activityDialog, setActivityDialog] = useState<null | { challenge: Challenge; activity?: Activity }>(null);

  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: listCycles });
  const challengesQuery = useQuery({
    queryKey: ["challenges", cycleId],
    queryFn: () => listChallenges(cycleId === "ALL" ? undefined : cycleId),
  });

  const cycles = cyclesQuery.data ?? [];
  const challenges = challengesQuery.data ?? [];

  const onSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
  };

  if (cyclesQuery.isLoading || challengesQuery.isLoading) {
    return <div className="h-24 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  }
  if (challengesQuery.isError) {
    const msg = challengesQuery.error instanceof Error ? challengesQuery.error.message : "Failed to load challenges.";
    return <div className="text-sm font-semibold text-[var(--danger)]">{msg}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">Programme setup</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Challenges & Activities</h1>
        </div>
        {canWrite ? <Button onClick={() => setChallengeDialog(true)}>New challenge</Button> : null}
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <label className="grid gap-2 min-w-[240px]">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Cycle</span>
            <select
              className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm"
              value={cycleId}
              onChange={e => setCycleId(e.target.value)}>
              <option value="ALL">All cycles</option>
              {cycles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm text-[var(--text-secondary)]">
            Move, Progress, and Recognition challenges for the selected cycle.
          </div>
        </div>
      </Card>

      {challenges.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-[var(--text-secondary)]">No challenges found for this cycle.</div>
        </Card>
      ) : (
        challenges.map(challenge => (
          <Card key={challenge.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-lg font-bold">{challenge.name}</div>
                  <Badge>{challenge.category}</Badge>
                  {statusBadge(challenge.status)}
                </div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  {cycles.find(c => c.id === challenge.cycleId)?.name ?? challenge.cycleId} · {challenge.startDate} →{" "}
                  {challenge.endDate}
                </div>
                {challenge.objective ? (
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">{challenge.objective}</div>
                ) : null}
              </div>
              {canWrite ? (
                <Button variant="outline" size="sm" onClick={() => setActivityDialog({ challenge })}>
                  Add activity
                </Button>
              ) : null}
            </div>

            <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
              <Table>
                <thead>
                  <tr>
                    <Th>Activity</Th>
                    <Th>Description</Th>
                    <Th>Points</Th>
                    <Th>Evidence</Th>
                    <Th>Duration</Th>
                    <Th>Status</Th>
                    {canWrite ? <Th className="text-right">Actions</Th> : null}
                  </tr>
                </thead>
                <tbody>
                  {(challenge.activities ?? []).map(activity => (
                    <tr key={activity.id}>
                      <Td className="font-semibold">{activity.name}</Td>
                      <Td className="max-w-[280px] text-[var(--text-secondary)]">
                        {activity.requirement?.trim() ? activity.requirement : "—"}
                      </Td>
                      <Td>{activity.points}</Td>
                      <Td>{activity.evidenceRequired ? "Required" : "Optional"}</Td>
                      <Td>{activity.unit === "MINUTES" ? "Selectable" : "—"}</Td>
                      <Td>{statusBadge(activity.status)}</Td>
                      {canWrite ? (
                        <Td className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setActivityDialog({ challenge, activity })}>
                              Edit
                            </Button>
                            <Button
                              variant={activity.status === "ACTIVE" ? "danger" : "outline"}
                              size="sm"
                              onClick={async () => {
                                try {
                                  await setActivityStatus(activity.id, activity.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
                                  toast.success("Activity updated.");
                                  onSaved();
                                } catch (e) {
                                  toast.error(e instanceof Error ? e.message : "Failed to update activity.");
                                }
                              }}>
                              {activity.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </Td>
                      ) : null}
                    </tr>
                  ))}
                  {(challenge.activities ?? []).length === 0 ? (
                    <tr>
                      <Td colSpan={canWrite ? 7 : 6} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                        No activities yet.
                      </Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </Card>
        ))
      )}

      <ChallengeDialog
        open={challengeDialog}
        cycles={cycles}
        onClose={() => setChallengeDialog(false)}
        onSaved={() => {
          setChallengeDialog(false);
          onSaved();
        }}
      />
      <ActivityDialog
        state={activityDialog}
        onClose={() => setActivityDialog(null)}
        onSaved={() => {
          setActivityDialog(null);
          onSaved();
        }}
      />
    </div>
  );
}

function ChallengeDialog({
  open,
  cycles,
  onClose,
  onSaved,
}: {
  open: boolean;
  cycles: Array<{ id: string; name: string; startDate: string; endDate: string; status: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const active = cycles.find(c => c.status === "ACTIVE") ?? cycles[0];
  const [name, setName] = useState("");
  const [cycleId, setCycleId] = useState(active?.id ?? "");
  const [category, setCategory] = useState<ChallengeCategory>("MOVE");
  const [objective, setObjective] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => cycles.find(c => c.id === cycleId) ?? active, [cycles, cycleId, active]);

  const submit = async () => {
    if (!selected) {
      toast.error("Create a cycle first.");
      return;
    }
    if (!name.trim()) {
      toast.error("Challenge name is required.");
      return;
    }
    setSaving(true);
    try {
      await createChallenge({
        cycleId: selected.id,
        name: name.trim(),
        category,
        objective,
        startDate: selected.startDate,
        endDate: selected.endDate,
        status: selected.status === "ACTIVE" ? "ACTIVE" : "UPCOMING",
      });
      toast.success("Challenge created.");
      setName("");
      setObjective("");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create challenge.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New challenge</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Cycle</span>
            <select
              className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm"
              value={cycleId || selected?.id || ""}
              onChange={e => setCycleId(e.target.value)}>
              {cycles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Name</span>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q3 Move Challenge" />
          </label>
          <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-[var(--cream-muted)] p-2">
            {categories.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={[
                  "rounded-[12px] px-3 py-2 text-sm font-semibold",
                  category === key ? "bg-white shadow-[var(--shadow-sm)] text-[var(--text)]" : "text-[var(--text-secondary)]",
                ].join(" ")}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Objective</span>
            <Input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Optional" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDialog({
  state,
  onClose,
  onSaved,
}: {
  state: null | { challenge: Challenge; activity?: Activity };
  onClose: () => void;
  onSaved: () => void;
}) {
  const activity = state?.activity;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("100");
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [trackDuration, setTrackDuration] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMove = state?.challenge.category === "MOVE";

  useEffect(() => {
    if (!state) return;
    setName(state.activity?.name ?? "");
    setDescription(state.activity?.requirement ?? "");
    setPoints(String(state.activity?.points ?? 100));
    setEvidenceRequired(state.activity?.evidenceRequired ?? true);
    setTrackDuration(state.activity ? state.activity.unit === "MINUTES" : state.challenge.category === "MOVE");
  }, [state]);

  const open = !!state;
  const title = activity ? "Edit activity" : "Add activity";

  const submit = async () => {
    if (!state) return;
    if (!name.trim()) {
      toast.error("Activity name is required.");
      return;
    }
    setSaving(true);
    try {
      const unit = isMove ? (trackDuration ? "MINUTES" : "NONE") : undefined;
      if (activity) {
        await updateActivity(activity.id, {
          name: name.trim(),
          points: Number(points) || 0,
          evidenceRequired,
          requirement: description.trim(),
          ...(unit ? { unit } : {}),
        });
        toast.success("Activity updated.");
      } else {
        await createActivity({
          challengeId: state.challenge.id,
          name: name.trim(),
          category: state.challenge.category,
          points: Number(points) || 0,
          evidenceRequired,
          requirement: description.trim(),
          unit: unit ?? "NONE",
        });
        toast.success("Activity created.");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) onClose();
        else if (state) {
          setName(state.activity?.name ?? "");
          setDescription(state.activity?.requirement ?? "");
          setPoints(String(state.activity?.points ?? 100));
          setEvidenceRequired(state.activity?.evidenceRequired ?? true);
          setTrackDuration(state.activity ? state.activity.unit === "MINUTES" : state.challenge.category === "MOVE");
        }
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Name</span>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Walking" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Description</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Shown with this activity on the mobile app"
              className="min-h-[88px] w-full resize-y rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] placeholder:text-text-muted/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Points</span>
            <Input type="number" min={0} value={points} onChange={e => setPoints(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={evidenceRequired} onChange={e => setEvidenceRequired(e.target.checked)} />
            Evidence required
          </label>
          {isMove ? (
            <label className="grid gap-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={trackDuration} onChange={e => setTrackDuration(e.target.checked)} />
                Duration
              </span>
              {trackDuration ? (
                <span className="pl-6 text-xs text-[var(--text-secondary)]">
                  Guards choose 15, 30, 45 or 60 minutes on the app.
                </span>
              ) : null}
            </label>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
