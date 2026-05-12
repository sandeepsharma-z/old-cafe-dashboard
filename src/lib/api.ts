const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gradient365_token')
}

// ── Client-side GET cache ──────────────────────────────────────────────────
// Caches GET responses for 30 seconds so tab switching is instant.
// Keyed by "<last-8-chars-of-token>:<path>" to avoid cross-account leaks.
// Mutations (POST/PATCH/PUT/DELETE) auto-invalidate matching path prefixes.

const CACHE_TTL = 30_000 // 30 seconds
interface CacheEntry { data: unknown; expiresAt: number }
const _cache = new Map<string, CacheEntry>()

function cacheKey(path: string): string {
  const tok = getToken()?.slice(-8) ?? 'anon'
  return `${tok}:${path}`
}

function cacheGet<T>(path: string): T | null {
  const entry = _cache.get(cacheKey(path))
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.data as T
}

function cacheSet(path: string, data: unknown): void {
  _cache.set(cacheKey(path), { data, expiresAt: Date.now() + CACHE_TTL })
}

// Removes all cached entries whose key contains `prefix`.
// Called automatically after any mutation.
function cacheInvalidate(prefix: string): void {
  const tok = getToken()?.slice(-8) ?? 'anon'
  const p = `${tok}:${prefix}`
  for (const k of _cache.keys()) {
    if (k.startsWith(p)) _cache.delete(k)
  }
}

// ── Core request ──────────────────────────────────────────────────────────
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const method = (options.method ?? 'GET').toUpperCase()
  const isGet = method === 'GET'

  // Serve from cache for GET requests
  if (isGet) {
    const cached = cacheGet<T>(path)
    if (cached !== null) return cached
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  const data: T = await res.json()

  // Populate cache and invalidate on mutations
  if (isGet) {
    cacheSet(path, data)
  } else {
    // Invalidate the base resource path (e.g. POST /api/orders → drop all /api/orders* entries)
    const basePath = path.split('?')[0]
    cacheInvalidate(basePath)
  }

  return data
}

export const api = {
  get:       <T>(path: string)              => apiRequest<T>(path),
  post:      <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:       <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:     <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete:    <T>(path: string)              => apiRequest<T>(path, { method: 'DELETE' }),
  /** Manually evict cached entries whose path starts with `prefix`. */
  invalidate: (prefix: string)             => cacheInvalidate(prefix),
}
