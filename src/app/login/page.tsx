'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { AuthResponse } from '@gradient365/types'
import { AuthPasswordToggleIcon } from '@/components/auth-password-toggle-icon'

export default function LoginPage() {
  const router = useRouter()
  const [accountId, setAccountId] = useState('')
  const [password, setPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', {
        accountId: accountId.trim().toUpperCase(),
        password,
      })
      localStorage.setItem('gradient365_token', res.token)
      localStorage.setItem('gradient365_user',  JSON.stringify(res.user))
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.toLowerCase().includes('not verified')) {
        setError('Your email is not verified. Please check your inbox and click the verification link.')
      } else {
        setError(message)
      }
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--portal-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: 800 }}>G</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Gradient 365</span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '4px', textAlign: 'center' }}>Welcome back</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '22px' }}>Sign in to your cafe account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="e.g. CAFE-2026-00001"
              required
              style={{ width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', color: 'var(--text-primary)', boxSizing: 'border-box', fontFamily: 'monospace', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 42px 9px 12px', fontSize: '12px', color: 'var(--text-primary)', boxSizing: 'border-box', outline: 'none' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                <AuthPasswordToggleIcon visible={showPassword} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px', color: 'var(--portal-primary)', fontWeight: 500, cursor: 'pointer' }}>Forgot password?</span>
          </div>

          {error && (
            <div style={{ background: 'var(--badge-rejected-bg)', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: 'var(--badge-rejected-text)' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: '13px', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" prefetch={false} style={{ color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none' }}>Request access</Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          main > div { margin: 0; border-radius: 0; border-left: none; border-right: none; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        }
      `}</style>
    </main>
  )
}
