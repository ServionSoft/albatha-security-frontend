import { api } from "@/lib/api/client";
import type { ChallengeCategory, Cycle, CycleStatus } from "@/lib/types/crm";

export async function listCycles() {
  return api<Cycle[]>("/cycles");
}

export async function getCycle(id: string) {
  return api<Cycle>(`/cycles/${id}`);
}

export type CycleUpsert = {
  name: string;
  startDate: string;
  category: ChallengeCategory;
  activities: Array<{ id?: string; name: string; points: number; evidenceRequired: boolean }>;
  status?: CycleStatus;
};

export async function createCycle(payload: CycleUpsert) {
  return api<Cycle>("/cycles", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateCycle(id: string, payload: CycleUpsert) {
  return api<Cycle>(`/cycles/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function setCycleStatus(id: string, status: CycleStatus) {
  if (status === "ACTIVE") return api<Cycle>(`/cycles/${id}/activate`, { method: "POST" });
  if (status === "CLOSED") return api<Cycle>(`/cycles/${id}/close`, { method: "POST" });
  return updateCycle(id, { name: "", startDate: "", category: "MOVE", activities: [], status });
}
