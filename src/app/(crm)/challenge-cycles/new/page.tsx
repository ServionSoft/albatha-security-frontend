"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth/AuthContext";
import { createCycle } from "@/lib/services/cycleService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { GripVertical, Plus, X } from "lucide-react";
import type { ChallengeCategory } from "@/lib/types/crm";

const schema = z.object({
  name: z.string().min(3, "Cycle name is required."),
  startDate: z.string().min(1, "Start date is required."),
  category: z.enum(["MOVE", "PROGRESS", "RECOGNITION"] as [ChallengeCategory, ChallengeCategory, ChallengeCategory]),
});

type FormValues = z.infer<typeof schema>;

type ActivityDraft = {
  id: string;
  name: string;
  points: number;
  evidenceRequired: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function computeEndDate(startDate: string) {
  const d = new Date(`${startDate}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return startDate;
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 20);
  const yyyy = end.getUTCFullYear();
  const mm = String(end.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(end.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateCyclePage() {
  const { canWrite } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<ActivityDraft[]>([
    { id: uid(), name: "Walking route", points: 10, evidenceRequired: true },
    { id: uid(), name: "Health club", points: 10, evidenceRequired: true },
    { id: uid(), name: "Stair climbing", points: 50, evidenceRequired: true },
  ]);
  const totalPoints = useMemo(() => activities.reduce((sum, a) => sum + (Number(a.points) || 0), 0), [activities]);
  const [statusHint, setStatusHint] = useState<"ACTIVE" | "DRAFT">("ACTIVE");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      startDate: "2026-09-01",
      category: "MOVE",
    },
  });

  const endDate = computeEndDate(form.watch("startDate"));

  const updateActivity = (id: string, patch: Partial<ActivityDraft>) => {
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  };
  const removeActivity = (id: string) => setActivities(prev => prev.filter(a => a.id !== id));
  const addActivity = () =>
    setActivities(prev => [...prev, { id: uid(), name: "", points: 10, evidenceRequired: true }]);

  const submitAs = (nextStatus: "ACTIVE" | "DRAFT") => {
    if (!canWrite) return;
    setStatusHint(nextStatus);
    form.handleSubmit(async values => {
      try {
        await createCycle({
          name: values.name,
          startDate: values.startDate,
          category: values.category,
          status: nextStatus,
          activities: activities.map(a => ({
            name: a.name.trim(),
            points: Number(a.points),
            evidenceRequired: a.evidenceRequired,
          })),
        });
        toast.success(nextStatus === "ACTIVE" ? "Cycle published." : "Draft saved.");
        router.replace("/challenge-cycles");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save cycle.";
        toast.error(msg);
      }
    })();
  };

  if (!canWrite) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">Read-only</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Create challenge cycle</h1>
        </div>
        <Card className="p-6">
          <div className="text-sm text-[var(--text-secondary)]">Management accounts can view cycles but cannot edit them.</div>
          <div className="mt-4">
            <Link href="/challenge-cycles">
              <Button variant="outline">Back to cycles</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">Challenges</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Create challenge cycle</h1>
        </div>
        <Link href="/challenge-cycles">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--text-secondary)]">Cycle details</div>
                <div className="grid grid-cols-1 gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Cycle name</span>
                    <Input {...form.register("name")} placeholder="e.g. Q3 Fitness Push" />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">Start date</span>
                      <Input type="date" {...form.register("startDate")} />
                    </label>
                    <div className="grid gap-2">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">End date</span>
                      <Input type="date" value={endDate} disabled />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Category</span>
                    <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-[var(--cream-muted)] p-2">
                      {(["MOVE", "PROGRESS", "RECOGNITION"] as ChallengeCategory[]).map(key => {
                        const active = form.watch("category") === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => form.setValue("category", key, { shouldValidate: true })}
                            className={[
                              "rounded-[12px] px-3 py-2 text-sm font-semibold",
                              active ? "bg-white shadow-[var(--shadow-sm)] text-[var(--text)]" : "text-[var(--text-secondary)]",
                            ].join(" ")}>
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[var(--text-muted)]">Activity options</div>
                <div className="mt-2 text-sm font-semibold text-[var(--text)]">Configure required activities and points.</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {activities.map((a, idx) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[28px_1fr_120px_auto_28px] gap-3 items-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-white px-3 py-2">
                  <div className="text-[var(--text-muted)]">
                    <GripVertical size={16} />
                  </div>
                  <input
                    className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm"
                    value={a.name}
                    onChange={e => updateActivity(a.id, { name: e.target.value })}
                    placeholder={`Activity ${idx + 1} name`}
                    disabled={!canWrite}
                  />
                  <input
                    className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm text-center"
                    type="number"
                    min={0}
                    value={a.points}
                    onChange={e => updateActivity(a.id, { points: Number(e.target.value) })}
                  />
                  <span className="text-sm text-[var(--text-muted)] font-semibold">pts</span>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full hover:bg-[var(--cream-muted)] grid place-items-center text-[var(--text-muted)]"
                    onClick={() => removeActivity(a.id)}
                    aria-label="Remove activity">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addActivity} className="mt-5 w-full h-12 rounded-[var(--radius-md)] border border-primary/60 bg-white flex items-center justify-center gap-2 font-semibold text-sm hover:bg-[var(--cream-muted)]">
              <Plus size={16} />
              Add activity option
            </button>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky top-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="text-sm font-semibold">Cycle summary</div>
              <Badge variant="muted">{statusHint === "ACTIVE" ? "Draft" : "Draft"}</Badge>
            </div>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-[var(--text-secondary)]">Duration</dt>
                <dd className="text-sm font-semibold">3 weeks</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-[var(--text-secondary)]">Activities</dt>
                <dd className="text-sm font-semibold">{activities.length} Configured</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-[var(--text-secondary)]">Target Audience</dt>
                <dd className="text-sm font-semibold">3 Teams</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-[var(--text-secondary)]">Max Points/Week</dt>
                <dd className="text-sm font-semibold">{totalPoints} pts</dd>
              </div>
            </dl>
          </Card>

          <Button className="w-full" onClick={() => submitAs("ACTIVE")}>
            Publish cycle
          </Button>
          <Button className="w-full" variant="outline" onClick={() => submitAs("DRAFT")}>
            Save as draft
          </Button>
          <div className="text-xs text-[var(--text-secondary)] text-center pt-2">
            Cycle dates are 3 weeks. Publishing makes it the active programme cycle.
          </div>
        </aside>
      </div>
    </div>
  );
}

