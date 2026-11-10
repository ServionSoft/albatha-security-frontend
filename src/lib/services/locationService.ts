import { api } from "@/lib/api/client";
import type { EntityStatus, Location } from "@/lib/types/crm";

export async function listLocations({
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
    items: Array<Location & { guardsCount: number }>;
  }>(`/locations?${params}`);
}

export async function listAllLocations() {
  return api<Location[]>("/locations?all=true");
}

export async function getLocation(id: string) {
  return api<Location & { guards: unknown[] }>(`/locations/${id}`);
}

export type LocationUpsert = {
  name: string;
  status: EntityStatus;
};

export async function createLocation(payload: LocationUpsert) {
  return api<Location>("/locations", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateLocation(id: string, payload: LocationUpsert) {
  return api<Location>(`/locations/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
