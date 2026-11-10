"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { listLeaderboard } from "@/lib/services/progressService";

export default function LeaderboardPage() {
  const query = useQuery({ queryKey: ["leaderboard"], queryFn: listLeaderboard });
  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    toast.error("Failed to load leaderboard.");
    return null;
  }
  if (!query.data) return null;

  const rows = query.data;
  const chartData = rows.slice(0, 8).map(r => ({ name: r.name.split(" ")[0], points: r.points }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Rankings</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Leaderboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Top performers</div>
            <Badge variant="muted">Live</Badge>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="points" fill="#651244" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Rank table</div>
          <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Guard</Th>
                  <Th>Team</Th>
                  <Th>Participation</Th>
                  <Th>Consistency</Th>
                  <Th className="text-right">Points</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.userId}>
                    <Td>{r.rank}</Td>
                    <Td>{r.name}</Td>
                    <Td>{r.team}</Td>
                    <Td>{r.participationPercent}%</Td>
                    <Td>{r.consistencyPercent}%</Td>
                    <Td className="text-right font-bold">{r.points}</Td>
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
