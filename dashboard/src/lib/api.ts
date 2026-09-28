export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("wt_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      // Session expired
      localStorage.removeItem("wt_token");
      window.dispatchEvent(new CustomEvent("wt_auth_expired"));
      return { status: 401, error: data?.error || "Session expired. Please log in again." };
    }

    if (res.status === 403) {
      // Role or Zone permission denied
      window.dispatchEvent(new CustomEvent("wt_forbidden", { detail: data?.error }));
      return { status: 403, error: data?.error || "Access Denied: You lack permissions for this resource." };
    }

    if (!res.ok) {
      return { status: res.status, error: data?.error || `Request failed with status ${res.status}` };
    }

    return { status: res.status, data };
  } catch (err: any) {
    return {
      status: 500,
      error: err?.message || "Failed to communicate with WasteTrack backend server."
    };
  }
}
