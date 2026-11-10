import { api } from "@/lib/api/client";
import type { Notification } from "@/lib/types/crm";

export async function listNotifications({ userId, unreadOnly }: { userId: string | null; unreadOnly?: boolean }) {
  const params = new URLSearchParams();
  if (unreadOnly) params.set("unreadOnly", "true");
  const qs = params.toString();
  return api<Notification[]>(`/notifications${qs ? `?${qs}` : ""}`);
}

export async function markAllRead({ userId }: { userId: string | null }) {
  void userId;
  return api<{ ok: boolean }>("/notifications/read-all", { method: "POST" });
}
