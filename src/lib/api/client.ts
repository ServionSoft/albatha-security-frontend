const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";
const TOKEN_KEY = "abre_crm_token_v1";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parse(res: Response) {
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const code = json?.error?.code ?? "ERROR";
    const message = json?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(code, message, res.status);
  }
  return json.data;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  return parse(res);
}

export function unwrapList<T>(data: T[] | { items: T[]; total?: number; page?: number; pageSize?: number }) {
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, pageSize: data.length };
  return data;
}
