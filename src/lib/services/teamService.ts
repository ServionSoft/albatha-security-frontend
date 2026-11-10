import { api } from "@/lib/api/client";
import type { EntityStatus, Team } from "@/lib/types/crm";

export async function listTeams({
  q,
  status = "ALL",
  page,
  pageSize,
}: {
  q?: string;
  status?: EntityStatus | "ALL";
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  return api<{
    total: number;
    page: number;
    pageSize: number;
    items: Array<Team & { locationName: string; membersCount: number }>;
  }>(`/teams?${params}`);
}

export async function listAllTeams() {
  return api<Team[]>("/teams?all=true");
}

export async function getTeam(id: string) {
  return api<Team & { locationName: string; members: unknown[] }>(`/teams/${id}`);
}

export type TeamUpsert = {
  name: string;
  locationId: string | null;
  leaderUserId: string | null;
  status: EntityStatus;
};

export async function createTeam(payload: TeamUpsert) {
  return api<Team>("/teams", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateTeam(id: string, payload: Partial<TeamUpsert>) {
  return api<Team>(`/teams/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function setTeamStatus(id: string, status: EntityStatus) {
  if (status === "INACTIVE") {
    return api<Team>(`/teams/${id}/deactivate`, { method: "POST" });
  }
  return updateTeam(id, { status: "ACTIVE" });
}
