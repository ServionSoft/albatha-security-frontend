export type CrmRole = "HR_ADMIN" | "MANAGEMENT" | "SUPER_USER";

export type CrmUser = {
  id: string;
  name: string;
  employeeId: string;
  role: CrmRole;
  email: string;
};

type MockAccount = CrmUser & { password: string };

const STORAGE_KEY = "abre_crm_session_v1";

export const mockAccounts: MockAccount[] = [
  {
    id: "u-hr",
    name: "Noura Al Ketbi",
    employeeId: "ABRE-00900",
    role: "HR_ADMIN",
    email: "noura.hr@abre.ae",
    password: "Abre@123",
  },
  {
    id: "u-mgmt",
    name: "Mohammed Al Suwaidi",
    employeeId: "ABRE-00800",
    role: "MANAGEMENT",
    email: "mohammed.mgmt@abre.ae",
    password: "Abre@123",
  },
  {
    id: "u-super",
    name: "Hessa Al Mansoori",
    employeeId: "ABRE-00999",
    role: "SUPER_USER",
    email: "hessa.hhr@abre.ae",
    password: "Abre@123",
  },
];

export function roleLabel(role: CrmRole) {
  switch (role) {
    case "HR_ADMIN":
      return "HR Admin";
    case "MANAGEMENT":
      return "Management";
    case "SUPER_USER":
      return "HHR / Super User";
  }
}

export function canWrite(role: CrmRole) {
  return role === "HR_ADMIN" || role === "SUPER_USER";
}

export function getSessionUser(): CrmUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrmUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: CrmUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loginWithEmployeeId(employeeId: string, password: string): CrmUser {
  const account = mockAccounts.find(
    u => u.employeeId.toLowerCase() === employeeId.trim().toLowerCase() && u.password === password,
  );
  if (!account) {
    throw new Error("Invalid employee ID or password.");
  }

  const { password: _pw, ...user } = account;
  setSessionUser(user);
  return user;
}

