"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/lib/auth/AuthContext";
import { listLocations, createLocation } from "@/lib/services/locationService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LocationsPage() {
  const { canWrite } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const query = useQuery({
    queryKey: ["locations", q, status, page],
    queryFn: () => listLocations({ q, status, page, pageSize }),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nextStatus, setNextStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const onCreate = async () => {
    try {
      await createLocation({ name: name.trim(), status: nextStatus });
      toast.success("Location created.");
      setOpen(false);
      setName("");
      query.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create location.");
    }
  };

  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    toast.error("Failed to load locations.");
    return null;
  }

  const data: any = query.data;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Programme setup</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Locations</h1>
      </div>
      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex-1">
            <Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search by location name..." />
          </div>
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map(s => (
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
          {canWrite ? <Button onClick={() => setOpen(true)}>Create location</Button> : null}
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Location</Th>
                <Th>Guards</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {(data.items ?? []).map((l: any) => (
                <tr key={l.id}>
                  <Td className="font-semibold">{l.name}</Td>
                  <Td>{l.guardsCount}</Td>
                  <Td>{l.status === "ACTIVE" ? <Badge variant="success">ACTIVE</Badge> : <Badge variant="muted">{l.status}</Badge>}</Td>
                </tr>
              ))}
              {(data.items ?? []).length === 0 ? (
                <tr>
                  <Td colSpan={3} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No locations match your filters.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>

        <Pagination page={page} pageSize={pageSize} total={data.total ?? 0} onPageChange={p => setPage(p)} />
      </Card>

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create location</DialogTitle>
            <DialogDescription>Mock create (no hard delete).</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Location name</span>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Abu Dhabi HQ" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Status</span>
              <select
                value={nextStatus}
                onChange={e => setNextStatus(e.target.value as any)}
                className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

