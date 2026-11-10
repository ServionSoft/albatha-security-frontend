import { api } from "@/lib/api/client";
import type { ChallengeCategory } from "@/lib/types/crm";

export type ProgressRow = {
  id: string;
  userId: string;
  guardName: string;
  teamName: string | null;
  cycleId: string;
  cycleName: string;
  challengeId: string;
  challengeName: string;
  category: ChallengeCategory;
  percent: number;
  activitiesCompleted: number;
  activitiesRequired: number;
  weeksParticipated: number;
  weeksRequired: number;
  consecutiveWeeks: number;
  weekStatuses: string[];
  participationPercent: number;
  consistencyPercent: number;
};

export async function listProgress(filters?: { userId?: string; challengeId?: string; cycleId?: string }) {
  const params = new URLSearchParams();
  if (filters?.userId) params.set("userId", filters.userId);
  if (filters?.challengeId) params.set("challengeId", filters.challengeId);
  if (filters?.cycleId) params.set("cycleId", filters.cycleId);
  const qs = params.toString();
  return api<ProgressRow[]>(`/progress${qs ? `?${qs}` : ""}`);
}

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  team: string;
  points: number;
  participationPercent: number;
  consistencyPercent: number;
  progressPercent: number;
};

export async function listLeaderboard() {
  return api<LeaderboardRow[]>("/leaderboard");
}
