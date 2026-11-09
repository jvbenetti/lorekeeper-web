import type {
  HealthCheckResponse,
  LoginRequest,
  LoginResponse,
  MinimalResource,
  EntityType,
  EntityResponse,
  CreateEntityRequest,
  UpdateEntityRequest,
  LocationType,
  LocationResponse,
  CreateLocationRequest,
  UpdateLocationRequest,
  ItemType,
  ItemResponse,
  CreateItemRequest,
  UpdateItemRequest,
  ApiMessageResponse,
} from '@/types/api';

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const HEALTH_URL = BASE_URL.replace(/\/api\/v1\/?$/, '') + '/health';

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

  if (
    options.body !== undefined &&
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData)
  ) {
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

// ============================================================================
// Todos os Endpoints do API_CONTRACT.md (v1)
// ============================================================================

export const lorekeeperApi = {
  // Health Check: GET http://localhost:8080/health
  getHealth: async (): Promise<HealthCheckResponse> => {
    const res = await fetch(HEALTH_URL);
    if (!res.ok) {
      throw new Error(`Health check falhou (${res.status})`);
    }
    return res.json();
  },

  // Auth: POST /login
  login: (credentials: LoginRequest) =>
    apiFetch<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // --------------------------------------------------------------------------
  // Entities
  // --------------------------------------------------------------------------
  getEntities: (params?: { type?: EntityType | ''; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    const qs = searchParams.toString();
    return apiFetch<MinimalResource[]>(`/entities${qs ? `?${qs}` : ''}`);
  },

  getEntityById: (id: number | string) =>
    apiFetch<EntityResponse>(`/entities/${id}`),

  createEntity: (payload: CreateEntityRequest) =>
    apiFetch<EntityResponse>('/entities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEntity: (id: number | string, payload: UpdateEntityRequest) =>
    apiFetch<EntityResponse>(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteEntity: (id: number | string) =>
    apiFetch<ApiMessageResponse>(`/entities/${id}`, {
      method: 'DELETE',
    }),

  addEntityDrop: (entityId: number | string, itemId: number | string) =>
    apiFetch<ApiMessageResponse>(`/entities/${entityId}/drops/${itemId}`, {
      method: 'POST',
    }),

  removeEntityDrop: (entityId: number | string, itemId: number | string) =>
    apiFetch<ApiMessageResponse>(`/entities/${entityId}/drops/${itemId}`, {
      method: 'DELETE',
    }),

  // --------------------------------------------------------------------------
  // Locations
  // --------------------------------------------------------------------------
  getLocations: (params?: { type?: LocationType | ''; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    const qs = searchParams.toString();
    return apiFetch<MinimalResource[]>(`/locations${qs ? `?${qs}` : ''}`);
  },

  getLocationById: (id: number | string) =>
    apiFetch<LocationResponse>(`/locations/${id}`),

  createLocation: (payload: CreateLocationRequest) =>
    apiFetch<LocationResponse>('/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateLocation: (id: number | string, payload: UpdateLocationRequest) =>
    apiFetch<LocationResponse>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteLocation: (id: number | string) =>
    apiFetch<ApiMessageResponse>(`/locations/${id}`, {
      method: 'DELETE',
    }),

  addLocationEntity: (locationId: number | string, entityId: number | string) =>
    apiFetch<ApiMessageResponse>(
      `/locations/${locationId}/entities/${entityId}`,
      {
        method: 'POST',
      }
    ),

  removeLocationEntity: (
    locationId: number | string,
    entityId: number | string
  ) =>
    apiFetch<ApiMessageResponse>(
      `/locations/${locationId}/entities/${entityId}`,
      {
        method: 'DELETE',
      }
    ),

  addLocationItem: (locationId: number | string, itemId: number | string) =>
    apiFetch<ApiMessageResponse>(`/locations/${locationId}/items/${itemId}`, {
      method: 'POST',
    }),

  removeLocationItem: (locationId: number | string, itemId: number | string) =>
    apiFetch<ApiMessageResponse>(`/locations/${locationId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  // --------------------------------------------------------------------------
  // Items
  // --------------------------------------------------------------------------
  getItems: (params?: {
    type?: ItemType | '';
    search?: string;
    rarity?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search?.trim()) searchParams.set('search', params.search.trim());
    if (params?.rarity?.trim()) searchParams.set('rarity', params.rarity.trim());
    const qs = searchParams.toString();
    return apiFetch<MinimalResource[]>(`/items${qs ? `?${qs}` : ''}`);
  },

  getItemById: (id: number | string) =>
    apiFetch<ItemResponse>(`/items/${id}`),

  createItem: (payload: CreateItemRequest) =>
    apiFetch<ItemResponse>('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateItem: (id: number | string, payload: UpdateItemRequest) =>
    apiFetch<ItemResponse>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteItem: (id: number | string) =>
    apiFetch<ApiMessageResponse>(`/items/${id}`, {
      method: 'DELETE',
    }),
};
