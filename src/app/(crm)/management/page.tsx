"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardData } from "@/lib/services/dashboardService";

export default function ManagementDashboardPage() {
  const query = useQuery({ queryKey: ["managementDashboard"], queryFn: getDashboardData });
  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    toast.error("Failed to load management dashboard.");
    return null;
  }
  if (!query.data) return null;

  const data: any = query.data;
  const teamChart = data.teamPerf.map((t: any) => ({ name: t.teamName, points: t.points }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Management visibility</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Management dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.metrics.map((m: any) => (
          <Card key={m.label} className="p-5">
            <div className="text-xs font-semibold text-[var(--text-secondary)]">{m.label}</div>
            <div className="mt-2 text-[28px] font-bold tracking-[-0.03em]">{m.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Team performance</div>
            <Badge variant="muted">Read-only</Badge>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamChart}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="points" fill="#651244" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Top performers</div>
          <div className="mt-3 overflow-auto rounded-[var(--radius-md)]">
            <div className="space-y-2">
              {data.topPerformers.map((r: any, idx: number) => (
                <div key={r.userId} className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-3">
                  <div className="text-sm font-semibold">
                    #{idx + 1} {r.name}
                  </div>
                  <div className="text-sm font-bold">{r.points} pts</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm text-[var(--text-secondary)]">Read-only programme totals from live data.</div>
        </Card>
      </div>
    </div>
  );
}

