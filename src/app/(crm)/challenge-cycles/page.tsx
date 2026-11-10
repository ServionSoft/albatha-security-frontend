"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { setCycleStatus, listCycles } from "@/lib/services/cycleService";
import { useAuth } from "@/lib/auth/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function ChallengeCyclesPage() {
  const { canWrite } = useAuth();
  const query = useQuery({ queryKey: ["cycles"], queryFn: listCycles });
  const [confirm, setConfirm] = useState<null | { id: string; next: "ACTIVE" | "CLOSED" }>(null);

  const onConfirm = async () => {
    if (!confirm) return;
    try {
      await setCycleStatus(confirm.id, confirm.next);
      setConfirm(null);
      toast.success("Cycle updated.");
      // refresh handled by react-query staleTime; force refetch
      query.refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update cycle.";
      toast.error(msg);
    }
  };

  if (query.isLoading) return <div className="h-24 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Failed to load cycles.";
    return <div className="text-sm font-semibold text-[var(--danger)]">{msg}</div>;
  }

  if (!query.data) {
    return <div className="text-sm font-semibold text-[var(--text-secondary)]">No cycles found.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme setup</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Challenge cycles</h1>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-[var(--text-secondary)]">3-week cycles. Only one cycle can be active at a time.</div>
          {canWrite ? (
            <Link href="/challenge-cycles/new">
              <Button>New cycle</Button>
            </Link>
          ) : null}
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Cycle</Th>
                <Th>Dates</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {query.data.map(c => (
                <tr key={c.id}>
                  <Td>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{c.category}</div>
                  </Td>
                  <Td>
                    {c.startDate} → {c.endDate}
                  </Td>
                  <Td>
                    {c.status === "ACTIVE" ? (
                      <Badge variant="success">ACTIVE</Badge>
                    ) : c.status === "CLOSED" ? (
                      <Badge variant="danger">CLOSED</Badge>
                    ) : (
                      <Badge variant="muted">DRAFT</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/challenge-cycles/${c.id}`}>
                        <Button variant="outline" size="sm" disabled={!canWrite}>
                          Edit
                        </Button>
                      </Link>
                      {canWrite ? (
                        c.status === "DRAFT" ? (
                          <Button size="sm" onClick={() => setConfirm({ id: c.id, next: "ACTIVE" })}>
                            Publish
                          </Button>
                        ) : c.status === "ACTIVE" ? (
                          <Button variant="danger" size="sm" onClick={() => setConfirm({ id: c.id, next: "CLOSED" })}>
                            Close
                          </Button>
                        ) : null
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!confirm} onOpenChange={o => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            This will publish or close the cycle. Only one cycle can be active.
          </div>
          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={!confirm}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

