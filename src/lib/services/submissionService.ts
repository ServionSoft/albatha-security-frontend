import { api } from "@/lib/api/client";
import type { ChallengeCategory, Submission, SubmissionStatus } from "@/lib/types/crm";

export async function listSubmissions({
  q,
  status = "ALL",
  page,
  pageSize,
  userId,
}: {
  q?: string;
  status?: SubmissionStatus | "ALL";
  page: number;
  pageSize: number;
  userId?: string;
}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (userId) params.set("userId", userId);
  return api<{
    total: number;
    items: Array<Submission & { guardName: string; statusLabel: string }>;
    page: number;
    pageSize: number;
  }>(`/submissions?${params}`);
}

export async function getSubmission(id: string) {
  return api<
    Submission & { guardName: string; cycleName: string; category: ChallengeCategory; reviewerName: string | null }
  >(`/submissions/${id}`);
}

export async function verifySubmission({
  id,
  action,
  notes,
}: {
  id: string;
  action: "APPROVE" | "REJECT";
  reviewerId?: string;
  notes?: string;
}) {
  if (action === "APPROVE") {
    return api<Submission>(`/submissions/${id}/approve`, { method: "POST" });
  }
  return api<Submission>(`/submissions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: notes || "Rejected from CRM", notes }),
  });
}
