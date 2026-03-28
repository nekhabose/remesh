const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export type ApiErrorShape = {
  error: {
    code: string;
    message: string;
    details: Record<string, string> | null;
  };
};

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details: Record<string, string> | null;

  constructor(status: number, code: string, message: string, details: Record<string, string> | null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      },
      ...init
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'Unable to reach the API.', null);
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorShape | null;
    throw new ApiRequestError(
      res.status,
      payload?.error?.code ?? 'REQUEST_FAILED',
      payload?.error?.message ?? 'Request failed',
      payload?.error?.details ?? null
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
