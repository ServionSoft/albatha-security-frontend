"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { getPointsSummary, listPointsTransactions } from "@/lib/services/pointsService";
import type { ChallengeCategory } from "@/lib/types/crm";

export default function GuardPointsPage() {
  const summaryQuery = useQuery({ queryKey: ["pointsSummary"], queryFn: getPointsSummary });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ChallengeCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const txQuery = useQuery({
    queryKey: ["pointsTx", { q, category, page }],
    queryFn: () => listPointsTransactions({ q, category, page, pageSize }),
  });

  if (summaryQuery.isLoading || txQuery.isLoading) {
    return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  }

  if (summaryQuery.isError) {
    toast.error("Failed to load points summary.");
    return null;
  }
  if (txQuery.isError) {
    toast.error("Failed to load point transactions.");
    return null;
  }

  const summary: any = summaryQuery.data;
  const txs: any[] = txQuery.data?.items ?? [];

  const chartData = (Object.entries(summary.byCategory) as Array<[ChallengeCategory, number]>).map(([k, v]) => ({
    name: k.charAt(0) + k.slice(1).toLowerCase(),
    value: v,
  }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme performance</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Guard points</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Points total</div>
              <div className="text-[32px] font-bold tracking-[-0.03em] mt-1">{summary.total}</div>
            </div>
            <Badge variant="muted">Auto-calculated</Badge>
          </div>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#651244" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">By category</div>
          <div className="mt-4 space-y-3">
            {chartData.map(item => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-[var(--text-secondary)]">{item.name}</div>
                <div className="text-sm font-bold">{item.value} pts</div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-sm text-[var(--text-secondary)]">
            Approved submissions generate points automatically.
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search by guard or reason..." />
          </div>
          <div className="flex gap-2">
            {(["ALL", "MOVE", "PROGRESS", "RECOGNITION"] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setCategory(s); setPage(1); }}
                className={[
                  "h-11 px-4 rounded-[var(--radius-sm)] border font-semibold text-sm",
                  category === s ? "border-primary/60 bg-[#F4E8EE] text-[var(--primary)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
                ].join(" ")}>
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setQ(""); setCategory("ALL"); setPage(1); }}>
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Guard</Th>
                <Th>Category</Th>
                <Th>Reason</Th>
                <Th>Date</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx.id}>
                  <Td>{tx.guardName}</Td>
                  <Td>{tx.category}</Td>
                  <Td>{tx.reason}</Td>
                  <Td>{new Date(tx.createdAt).toISOString().slice(0, 10)}</Td>
                  <Td className="text-right font-bold">{tx.amount}</Td>
                </tr>
              ))}
              {txs.length === 0 ? (
                <tr>
                  <Td colSpan={5} className="py-8 text-sm text-[var(--text-secondary)] text-center">
                    No transactions match your filters.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={txQuery.data?.total ?? 0} onPageChange={p => setPage(p)} />
      </Card>
    </div>
  );
}


