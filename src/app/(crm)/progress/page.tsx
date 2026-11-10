"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { listCycles } from "@/lib/services/cycleService";
import { listProgress } from "@/lib/services/progressService";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-[13px] font-semibold text-[var(--text-secondary)]">{label}</div>
      <div className="mt-2 text-[28px] font-bold tracking-[-0.03em]">{value}</div>
    </Card>
  );
}

export default function ProgressPage() {
  const [cycleId, setCycleId] = useState("ALL");
  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: listCycles });
  const progressQuery = useQuery({
    queryKey: ["progress", cycleId],
    queryFn: () => listProgress(cycleId === "ALL" ? undefined : { cycleId }),
  });

  const rows = progressQuery.data ?? [];
  const cycles = cyclesQuery.data ?? [];

  const metrics = useMemo(() => {
    const n = rows.length;
    const avg = (key: "percent" | "participationPercent" | "consistencyPercent") =>
      n ? Math.round(rows.reduce((sum, r) => sum + (r[key] ?? 0), 0) / n) : 0;
    return {
      count: n,
      percent: avg("percent"),
      participation: avg("participationPercent"),
      consistency: avg("consistencyPercent"),
    };
  }, [rows]);

  const chartData = useMemo(
    () =>
      rows.slice(0, 8).map(r => ({
        name: (r.guardName ?? "Guard").split(" ")[0],
        percent: r.percent,
      })),
    [rows],
  );

  if (progressQuery.isLoading) return <div className="h-24 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (progressQuery.isError) {
    const msg = progressQuery.error instanceof Error ? progressQuery.error.message : "Failed to load progress.";
    toast.error(msg);
    return <div className="text-sm font-semibold text-[var(--danger)]">{msg}</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme analytics</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Progress</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Guards tracked" value={String(metrics.count)} />
        <MetricCard label="Avg completion" value={`${metrics.percent}%`} />
        <MetricCard label="Avg participation" value={`${metrics.participation}%`} />
        <MetricCard label="Avg consistency" value={`${metrics.consistency}%`} />
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
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm text-[var(--text-secondary)]">
            Participation is activities completed. Consistency is weeks participated in the 3-week cycle.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Completion snapshot</div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="percent" fill="#651244" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Guard progress</div>
          <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
            <Table>
              <thead>
                <tr>
                  <Th>Guard</Th>
                  <Th>Team</Th>
                  <Th>Challenge</Th>
                  <Th>Participation</Th>
                  <Th>Consistency</Th>
                  <Th className="text-right">%</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <Td className="font-semibold">{r.guardName}</Td>
                    <Td>{r.teamName ?? "—"}</Td>
                    <Td>
                      <Badge variant="muted">{r.category}</Badge>
                    </Td>
                    <Td>
                      {r.activitiesCompleted}/{r.activitiesRequired}
                    </Td>
                    <Td>
                      {r.weeksParticipated}/{r.weeksRequired}w
                    </Td>
                    <Td className="text-right font-bold">{r.percent}%</Td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <Td colSpan={6} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                      No progress records yet.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
