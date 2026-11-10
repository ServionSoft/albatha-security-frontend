import { api } from "@/lib/api/client";
import type { ChallengeCategory, EntityStatus } from "@/lib/types/crm";

export type ChallengeStatus = "UPCOMING" | "ACTIVE" | "CLOSED";

export type Activity = {
  id: string;
  challengeId: string;
  name: string;
  category: ChallengeCategory;
  objective?: string;
  requirement?: string;
  unit?: "MINUTES" | "COUNT" | "NONE";
  points: number;
  evidenceRequired: boolean;
  verificationRequired: boolean;
  status: EntityStatus;
};

export type Challenge = {
  id: string;
  cycleId: string;
  name: string;
  category: ChallengeCategory;
  objective: string;
  tagline?: string | null;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  activities: Activity[];
};

export async function listChallenges(cycleId?: string) {
  const qs = cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : "";
  return api<Challenge[]>(`/challenges${qs}`);
}

export async function createChallenge(payload: {
  cycleId: string;
  name: string;
  category: ChallengeCategory;
  objective?: string;
  startDate: string;
  endDate: string;
  status?: ChallengeStatus;
}) {
  return api<Challenge>("/challenges", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateChallenge(
  id: string,
  payload: Partial<{ name: string; objective: string; tagline: string; status: ChallengeStatus }>,
) {
  return api<Challenge>(`/challenges/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function listActivities(challengeId?: string) {
  const qs = challengeId ? `?challengeId=${encodeURIComponent(challengeId)}` : "";
  return api<Activity[]>(`/activities${qs}`);
}

export async function createActivity(payload: {
  challengeId: string;
  name: string;
  category: ChallengeCategory;
  points: number;
  evidenceRequired: boolean;
  requirement?: string;
  verificationRequired?: boolean;
  unit?: Activity["unit"];
}) {
  return api<Activity>("/activities", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateActivity(
  id: string,
  payload: Partial<{
    name: string;
    points: number;
    evidenceRequired: boolean;
    requirement: string;
    unit: Activity["unit"];
    verificationRequired: boolean;
    status: EntityStatus;
  }>,
) {
  return api<Activity>(`/activities/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function setActivityStatus(id: string, status: EntityStatus) {
  const path = status === "ACTIVE" ? "activate" : "deactivate";
  return api<Activity>(`/activities/${id}/${path}`, { method: "POST" });
}
