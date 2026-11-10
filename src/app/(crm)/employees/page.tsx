"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listEmployees } from "@/lib/services/employeeService";
import { EmployeeFormDialog } from "@/components/crm/EmployeeFormDialog";
import { useAuth } from "@/lib/auth/AuthContext";
import type { User } from "@/lib/types/crm";
import { toast } from "sonner";

export default function EmployeesPage() {
  const { canWrite } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [createOpen, setCreateOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["employees", q, page],
    queryFn: () => listEmployees({ q, page, pageSize }),
  });

  const statusPill = (status: string) => {
    if (status === "ACTIVE") return <Badge variant="success">ACTIVE</Badge>;
    return <Badge variant="muted">{status}</Badge>;
  };

  const items = query.data?.items ?? [];

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="h-9 bg-white/60 rounded animate-pulse w-64" />
        </Card>
        <Card className="p-6">
          <div className="h-60 bg-white/60 rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : "Failed to load employees.";
    toast.error(msg);
    return <div className="text-sm font-semibold text-[var(--danger)]">{msg}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">People management</div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Employees</h1>
        </div>
        {canWrite ? <Button onClick={() => setCreateOpen(true)}>Create employee</Button> : null}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Input
            value={q}
            onChange={e => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or employee ID..."
          />
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setPage(1);
            }}>
            Reset
          </Button>
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Employee ID</Th>
                <Th>Role</Th>
                <Th>Team</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((u: User & { teamName?: string | null; locationName?: string | null }) => (
                <tr key={u.id}>
                  <Td>
                    <Link href={`/employees/${u.id}`} className="font-semibold text-[var(--primary)] hover:underline">
                      {u.name}
                    </Link>
                  </Td>
                  <Td>{u.employeeId}</Td>
                  <Td>{u.role}</Td>
                  <Td>{u.teamName ?? "—"}</Td>
                  <Td>{u.locationName ?? "—"}</Td>
                  <Td>{statusPill(u.status)}</Td>
                  <Td className="text-right">
                    <Link href={`/employees/${u.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={query.data?.total ?? 0} onPageChange={setPage} />
      </Card>

      <EmployeeFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={result => {
          setCreateOpen(false);
          query.refetch();
          if (result?.temporaryPassword) setTempPassword(result.temporaryPassword);
        }}
      />

      <Dialog open={!!tempPassword} onOpenChange={o => !o && setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Share this password once. The employee must change it on first sign-in.
          </p>
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
