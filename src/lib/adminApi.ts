/**
 * Tiny fetch wrapper for admin API calls. Throws on non-2xx with the
 * server-provided error message (falls back to status text).
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore body parse errors
    }
    throw new Error(message || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  get: <T,>(url: string) => request<T>(url),
  post: <T,>(url: string, body: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T,>(url: string, body: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T,>(url: string, body: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T = { ok: boolean },>(url: string) => request<T>(url, { method: "DELETE" }),
};
