"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Table, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listNotifications, markAllRead } from "@/lib/services/notificationService";
import { useAuth } from "@/lib/auth/AuthContext";

export default function NotificationsPage() {
  const { canWrite } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const query = useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: () => listNotifications({ userId: null, unreadOnly }),
  });

  const items = query.data ?? [];

  const onMarkAllRead = async () => {
    try {
      await markAllRead({ userId: null });
      toast.success("Marked all as read.");
      setConfirm(false);
      query.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark all read.");
    }
  };

  if (query.isLoading) return <div className="h-20 rounded-[var(--radius-lg)] bg-white/60 animate-pulse" />;
  if (query.isError) {
    toast.error("Failed to load notifications.");
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)]">Alerts</div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] mt-1">Notifications</h1>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className={[
                "h-11 px-4 rounded-[var(--radius-sm)] border font-semibold text-sm",
                !unreadOnly ? "border-primary/60 bg-[#F4E8EE] text-[var(--primary)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
              ].join(" ")}>
              All
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              className={[
                "h-11 px-4 rounded-[var(--radius-sm)] border font-semibold text-sm",
                unreadOnly ? "border-primary/60 bg-[#F4E8EE] text-[var(--primary)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
              ].join(" ")}>
              Unread
            </button>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={() => setConfirm(true)}
              disabled={!canWrite}>
              Mark all read
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-auto rounded-[var(--radius-md)]">
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((n: any) => (
                <tr key={n.id}>
                  <Td>
                    <div className="font-semibold">{n.title}</div>
                  </Td>
                  <Td className="text-[var(--text-secondary)]">{n.body}</Td>
                  <Td>{n.readAt ? <Badge variant="muted">Read</Badge> : <Badge variant="default">Unread</Badge>}</Td>
                  <Td>{new Date(n.createdAt).toISOString().slice(0, 10)}</Td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <Td colSpan={4} className="py-10 text-center text-sm text-[var(--text-secondary)]">
                    No notifications.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Card>

      <Dialog open={confirm} onOpenChange={o => !o && setConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
            <DialogDescription>Mark all notifications as read.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={onMarkAllRead}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


