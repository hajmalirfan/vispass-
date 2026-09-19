const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is not configured');
}

export interface ApiError {
  detail?: string;
}

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getUser(): { id: number; email: string; role: string } | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data: ApiError = await response.json();
      if (data.detail) message = data.detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function apiBlob(path: string, filename: string): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const data: ApiError = await response.json();
      if (data.detail) message = data.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function apiObjectUrl(path: string): Promise<string> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) {
    let message = `Failed to load file (${response.status})`;
    try {
      const data: ApiError = await response.json();
      if (data.detail) message = data.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export default API_URL;
