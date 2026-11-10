import { api } from "@/lib/api/client";
import type { Cycle } from "@/lib/types/crm";

export type DashboardMetric = { label: string; value: string; sub?: string };

export async function getDashboardData() {
  return api<{
    metrics: DashboardMetric[];
    currentCycle: Cycle | null;
    currentCategory: string | null;
    weeklyProgress: Array<{ x: string; y: number }>;
    teamPerf: Array<{ teamId: string; teamName: string; points: number }>;
    locationPerf: Array<{ locationId: string; locationName: string; points: number }>;
    recentSubmissions: Array<{
      id: string;
      guardName: string;
      activityName: string;
      submittedDate: string;
      status: string;
      points: number;
      cycleName: string;
    }>;
    topPerformers: Array<{ userId: string; name: string; points: number; team: string }>;
  }>("/dashboard");
}
