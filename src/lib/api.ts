export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('helpdesk_token');
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem('helpdesk_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
    throw new ApiError(
      data.message ?? 'An unexpected error occurred',
      response.status,
      data.errors
    );
  }

  return data.data !== undefined ? (data.data as T) : (data as T);
}
