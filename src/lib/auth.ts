import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export interface AuthUser {
  id: number
  accountId: string
  role: 'cafe' | 'supplier' | 'brand'
  email: string
  name: string
  businessName: string
  isVerified: boolean
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('gradient365_token')?.value
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    // /api/auth/me returns { success: true, data: { user, ... } } or { user }
    return data.data?.user ?? data.user ?? null
  } catch {
    return null
  }
}
