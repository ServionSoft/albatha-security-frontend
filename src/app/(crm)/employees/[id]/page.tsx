"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEmployee, resetPassword, setEmployeeStatus } from "@/lib/services/employeeService";
import { listPointsTransactions } from "@/lib/services/pointsService";
import { listProgress } from "@/lib/services/progressService";
import { listSubmissions } from "@/lib/services/submissionService";
import { EmployeeFormDialog } from "@/components/crm/EmployeeFormDialog";
import { useAuth } from "@/lib/auth/AuthContext";
import { Table, Th, Td } from "@/components/ui/table";
import type { User } from "@/lib/types/crm";

export default function EmployeeDetailPage() {
  const { canWrite } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const [editOpen, setEditOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
  });
  const pointsQuery = useQuery({
    queryKey: ["employee-points", id],
    queryFn: () => listPointsTransactions({ page: 1, pageSize: 8, userId: id }),
    enabled: !!id,
  });
  const progressQuery = useQuery({
    queryKey: ["employee-progress", id],
    queryFn: () => listProgress({ userId: id }),
    enabled: !!id,
  });
  const submissionsQuery = useQuery({
    queryKey: ["employee-submissions", id],
    queryFn: () => listSubmissions({ page: 1, pageSize: 8, userId: id }),
    enabled: !!id,
  });

  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Failed to load employee.";
    toast.error(msg);
    return <div className="text-sm font-semibold text-[var(--danger)]">{msg}</div>;
  }

  const u = query.data as User & { teamName?: string | null; locationName?: string | null };
  const points = pointsQuery.data?.items ?? [];
  const progress = progressQuery.data ?? [];
  const submissions = submissionsQuery.data?.items ?? [];

  const onToggleStatus = async () => {
    try {
      const next = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await setEmployeeStatus(u.id, next);
      toast.success(next === "ACTIVE" ? "Employee reactivated." : "Employee deactivated.");
      query.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    }
  };

  const onResetPassword = async () => {
    try {
      const result = await resetPassword(u.id);
      setTempPassword(result.temporaryPassword || result.tempPassword);
      toast.success("Password reset.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset password.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">Employee detail</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">{u.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/employees">
            <Button variant="outline">Back</Button>
          </Link>
          {canWrite ? (
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="outline" onClick={onResetPassword}>
                Reset password
              </Button>
              <Button variant={u.status === "ACTIVE" ? "danger" : "outline"} onClick={onToggleStatus}>
                {u.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-xs font-semibold text-[var(--text-muted)]">Identity</div>
          <div className="mt-2 text-lg font-bold">{u.employeeId}</div>
          <div className="mt-2 text-sm text-[var(--text-secondary)]">{u.email || "No email"}</div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge variant="muted">{u.role}</Badge>
            {u.status === "ACTIVE" ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="muted">{u.status}</Badge>}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="text-xs font-semibold text-[var(--text-muted)]">Assignment</div>
          <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
            <Table>
              <thead>
                <tr>
                  <Th>Team</Th>
                  <Th>Location</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>{u.teamName ?? "—"}</Td>
                  <Td>{u.locationName ?? "—"}</Td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Progress</div>
          <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
            <Table>
              <thead>
                <tr>
                  <Th>Challenge</Th>
                  <Th>Participation</Th>
                  <Th className="text-right">%</Th>
                </tr>
              </thead>
              <tbody>
                {progress.map(row => (
                  <tr key={row.id}>
                    <Td>{row.challengeName}</Td>
                    <Td>
                      {row.activitiesCompleted}/{row.activitiesRequired}
                    </Td>
                    <Td className="text-right font-bold">{row.percent}%</Td>
                  </tr>
                ))}
                {progress.length === 0 ? (
                  <tr>
                    <Td colSpan={3} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                      No progress yet.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Recent points</div>
          <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
            <Table>
              <thead>
                <tr>
                  <Th>Reason</Th>
                  <Th>Category</Th>
                  <Th className="text-right">Pts</Th>
                </tr>
              </thead>
              <tbody>
                {points.map(tx => (
                  <tr key={tx.id}>
                    <Td>{tx.reason}</Td>
                    <Td>{tx.category}</Td>
                    <Td className="text-right font-bold">{tx.amount}</Td>
                  </tr>
                ))}
                {points.length === 0 ? (
                  <tr>
                    <Td colSpan={3} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                      No points yet.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold">Submissions</div>
        <div className="mt-4 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Activity</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Points</Th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id}>
                  <Td>{s.activityName}</Td>
                  <Td>{s.submittedDate}</Td>
                  <Td>
                    <Badge variant={s.status === "APPROVED" ? "success" : s.status === "REJECTED" ? "danger" : "muted"}>
                      {s.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">{s.pointsIfApproved}</Td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <Td colSpan={4} className="py-8 text-center text-sm text-[var(--text-secondary)]">
                    No submissions yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Card>

      <EmployeeFormDialog
        open={editOpen}
        employee={u}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          query.refetch();
        }}
      />

      <Dialog open={!!tempPassword} onOpenChange={o => !o && setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Share this password once.</p>
          <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--cream-muted)] px-4 py-3 font-mono text-sm font-semibold">
            {tempPassword}
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setTempPassword(null)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
