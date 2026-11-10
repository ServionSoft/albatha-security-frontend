"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { getDashboardData } from "@/lib/services/dashboardService";
import { toast } from "sonner";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-[13px] font-semibold text-[var(--text-secondary)]">{label}</div>
      <div className="mt-2 text-[28px] font-bold tracking-[-0.03em]">{value}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[120px] rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />
        <div className="h-[320px] rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />
      </div>
    );
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Failed to load dashboard.";
    toast.error(msg);
    return <div className="text-sm text-[var(--danger)] font-semibold">{msg}</div>;
  }

  if (!query.data) {
    return <div className="text-sm font-semibold text-[var(--danger)]">No dashboard data.</div>;
  }
  const data = query.data;

  const teamChartData = data.teamPerf.map(t => ({ name: t.teamName, points: t.points }));

  const topUsers = data.topPerformers;

  const recent = data.recentSubmissions;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme overview</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.metrics.map((m: any) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[var(--text-secondary)]">Team performance</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Points totals by team</div>
            </div>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="points" fill="#651244" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[13px] font-semibold text-[var(--text-secondary)]">Current 3-week cycle</div>
          <div className="mt-2 text-sm text-[var(--text)] font-semibold">
            {data.currentCycle ? data.currentCycle.name : "No active cycle"}
          </div>
          <div className="mt-1">
            <Badge variant="muted">{data.currentCategory ?? "—"}</Badge>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyProgress?.length ? data.weeklyProgress : [{ x: "W1", y: 0 }, { x: "W2", y: 0 }, { x: "W3", y: 0 }]}>
                <XAxis dataKey="x" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#B75F32" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[var(--text-secondary)]">Top performers</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Based on awarded points</div>
            </div>
          </div>
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Guard</Th>
                  <Th>Team</Th>
                  <Th className="text-right">Points</Th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u: any) => (
                  <tr key={u.userId}>
                    <Td>{u.name}</Td>
                    <Td>{u.team}</Td>
                    <Td className="text-right">{u.points}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[var(--text-secondary)]">Recent submissions</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Latest verification queue</div>
            </div>
          </div>
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Guard</Th>
                  <Th>Activity</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s: any) => (
                  <tr key={s.id}>
                    <Td>{s.guardName}</Td>
                    <Td>{s.activityName}</Td>
                    <Td>{s.submittedDate}</Td>
                    <Td>
                      <Badge
                        variant={
                          s.status === "APPROVED"
                            ? "success"
                            : s.status === "REJECTED"
                              ? "danger"
                              : "muted"
                        }>
                        {s.status}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

