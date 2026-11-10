import { api } from "@/lib/api/client";
import type { EntityStatus, User } from "@/lib/types/crm";

export type EmployeeListFilters = {
  q?: string;
  status?: EntityStatus | "ALL";
  role?: User["role"] | "ALL";
};

export async function listEmployees({
  q,
  status = "ALL",
  role = "ALL",
  page,
  pageSize,
}: {
  q?: string;
  status?: EmployeeListFilters["status"];
  role?: EmployeeListFilters["role"];
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    fieldOnly: "true",
  });
  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (role && role !== "ALL") params.set("role", role);
  return api<{ total: number; items: User[]; page: number; pageSize: number }>(`/employees?${params}`);
}

export async function getEmployee(id: string) {
  return api<User>(`/employees/${id}`);
}

export type EmployeeUpsert = {
  name: string;
  employeeId: string;
  email?: string;
  role: User["role"];
  teamId: string | null;
  locationId: string | null;
  status?: EntityStatus;
};

export async function listAllFieldEmployees() {
  return api<{ total: number; items: User[]; page: number; pageSize: number }>(
    "/employees?page=1&pageSize=200&fieldOnly=true",
  );
}

export async function createEmployee(payload: EmployeeUpsert) {
  return api<User & { temporaryPassword?: string }>("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(
  id: string,
  payload: Omit<EmployeeUpsert, "status" | "employeeId"> & { status?: EntityStatus; employeeId?: string },
) {
  return api<User>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function setEmployeeStatus(id: string, status: EntityStatus) {
  const path = status === "ACTIVE" ? "reactivate" : "deactivate";
  return api<User>(`/employees/${id}/${path}`, { method: "POST" });
}

export async function resetPassword(id: string) {
  return api<{ tempPassword: string; temporaryPassword: string }>(`/employees/${id}/reset-password`, {
    method: "POST",
  });
}
