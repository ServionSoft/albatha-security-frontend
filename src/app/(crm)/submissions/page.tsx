"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listSubmissions, verifySubmission } from "@/lib/services/submissionService";
import { useAuth } from "@/lib/auth/AuthContext";
import type { SubmissionStatus } from "@/lib/types/crm";

export default function SubmissionsPage() {
  const { canWrite, role } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SubmissionStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const query = useQuery({
    queryKey: ["submissions", { q, status, page }],
    queryFn: () => listSubmissions({ q, status, page, pageSize }),
  });

  const [actionDialog, setActionDialog] = useState<null | { id: string; action: "APPROVE" | "REJECT" }>(null);
  const [notes, setNotes] = useState("");

  const onPageChange = (p: number) => setPage(p);

  const onSubmitDecision = async () => {
    if (!actionDialog) return;
    try {
      if (!canWrite) return;
      await verifySubmission({
        id: actionDialog.id,
        action: actionDialog.action,
        reviewerId: "u5",
        notes: notes.trim() ? notes.trim() : undefined,
      });

      toast.success(actionDialog.action === "APPROVE" ? "Submission approved." : "Submission rejected.");
      setActionDialog(null);
      setNotes("");
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["points"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update submission.");
    }
  };

  const statusBadge = (s: SubmissionStatus) => {
    if (s === "APPROVED") return <Badge variant="success">APPROVED</Badge>;
    if (s === "REJECTED") return <Badge variant="danger">REJECTED</Badge>;
    return <Badge variant="muted">PENDING</Badge>;
  };

  const items = query.data?.items ?? [];

  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    toast.error("Failed to load submissions.");
    return null;
  }
  if (!query.data) return null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Operations</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Submissions</h1>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search guard/activity/date..." />
          </div>

          <div className="flex gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatus(s); setPage(1); }}
                className={[
                  "h-11 px-4 rounded-[var(--radius-sm)] border font-semibold text-sm",
                  status === s ? "border-primary/60 bg-[#F4E8EE] text-[var(--primary)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
                ].join(" ")}>
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Guard</Th>
                <Th>Activity</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Points</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((s: any) => (
                <tr key={s.id}>
                  <Td>{s.guardName}</Td>
                  <Td>{s.activityName}</Td>
                  <Td>{s.submittedDate}</Td>
                  <Td>{statusBadge(s.status)}</Td>
                  <Td className="text-right">{s.pointsIfApproved}</Td>
                  <Td className="text-right">
                    {canWrite && s.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => setActionDialog({ id: s.id, action: "APPROVE" })}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setNotes(""); setActionDialog({ id: s.id, action: "REJECT" }); }}>
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-secondary)]">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={query.data.total} onPageChange={onPageChange} />
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={o => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog?.action === "APPROVE" ? "Approve submission" : "Reject submission"}</DialogTitle>
            <DialogDescription>
              {actionDialog?.action === "APPROVE"
                ? "Approved submissions award the activity points to the guard immediately."
                : "Add an optional reason. Rejected submissions do not award points."}
            </DialogDescription>
          </DialogHeader>

          {actionDialog?.action === "REJECT" ? (
            <div className="mt-4">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Reason / notes</span>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[96px] rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 text-sm"
                  placeholder="e.g. Evidence not clear / incorrect activity."
                />
              </label>
            </div>
          ) : null}

          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={onSubmitDecision} disabled={!actionDialog}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


