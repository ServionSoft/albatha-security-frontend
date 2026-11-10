import { api } from "@/lib/api/client";
import type { ChallengeCategory } from "@/lib/types/crm";

export async function getPointsSummary() {
  return api<{
    total: number;
    byCategory: Record<ChallengeCategory, number>;
    top: Array<{ userId: string; name: string; points: number; team: string }>;
  }>("/points/summary");
}

export async function listPointsTransactions({
  q,
  category = "ALL",
  page,
  pageSize,
  userId,
}: {
  q?: string;
  category?: ChallengeCategory | "ALL";
  page: number;
  pageSize: number;
  userId?: string;
}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) params.set("q", q);
  if (category && category !== "ALL") params.set("category", category);
  if (userId) params.set("userId", userId);
  return api<{
    total: number;
    items: Array<{
      id: string;
      userId: string;
      submissionId: string | null;
      category: ChallengeCategory;
      amount: number;
      reason: string;
      createdAt: string;
      guardName: string;
    }>;
    page: number;
    pageSize: number;
  }>(`/points?${params}`);
}
