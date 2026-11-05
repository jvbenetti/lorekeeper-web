export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const TOKEN_STORAGE_KEY = 'lorekeeper_jwt';

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignora falha ao fazer parse de JSON de erro
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
