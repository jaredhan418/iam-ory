/**
 * Ory Hydra Admin API client helpers.
 *
 * The admin API base URL is configured via the HYDRA_ADMIN_URL environment
 * variable (server-side only). The public URL used in the browser sidebar is
 * set with NEXT_PUBLIC_HYDRA_ADMIN_URL.
 */

export const HYDRA_ADMIN_URL =
  process.env.HYDRA_ADMIN_URL ?? "http://localhost:4445";

export interface OAuthClient {
  client_id: string;
  client_name?: string;
  client_secret?: string;
  grant_types?: string[];
  scope?: string;
  audience?: string[];
  token_endpoint_auth_method?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

export interface TokenIntrospection {
  active: boolean;
  client_id?: string;
  scope?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  aud?: string[];
  iss?: string;
  token_type?: string;
  token_use?: string;
  ext?: Record<string, unknown>;
}

async function hydraFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${HYDRA_ADMIN_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message: string;
    try {
      const body = await res.json();
      message = body.error_description ?? body.message ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new Error(`Hydra API error (${res.status}): ${message}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── OAuth Clients ──────────────────────────────────────────────────────────

export async function listClients(
  pageSize = 50,
  pageToken?: string
): Promise<OAuthClient[]> {
  const params = new URLSearchParams({ page_size: String(pageSize) });
  if (pageToken) params.set("page_token", pageToken);
  return hydraFetch<OAuthClient[]>(`/admin/clients?${params}`);
}

export async function getClient(id: string): Promise<OAuthClient> {
  return hydraFetch<OAuthClient>(`/admin/clients/${encodeURIComponent(id)}`);
}

export async function createClient(
  client: Partial<OAuthClient>
): Promise<OAuthClient> {
  return hydraFetch<OAuthClient>("/admin/clients", {
    method: "POST",
    body: JSON.stringify(client),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await hydraFetch<void>(`/admin/clients/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ── Token Introspection ────────────────────────────────────────────────────

export async function introspectToken(
  token: string,
  scope?: string
): Promise<TokenIntrospection> {
  const body = new URLSearchParams({ token });
  if (scope) body.set("scope", scope);

  const url = `${HYDRA_ADMIN_URL}/admin/oauth2/introspect`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    let message: string;
    try {
      const b = await res.json();
      message = b.error_description ?? b.message ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    throw new Error(`Hydra API error (${res.status}): ${message}`);
  }

  return res.json() as Promise<TokenIntrospection>;
}
