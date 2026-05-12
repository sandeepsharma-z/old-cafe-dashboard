'use client'
import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { AuthPasswordToggleIcon } from '@/components/auth-password-toggle-icon'

interface RegisterResponse {
  success: boolean
  message: string
  user?: {
    accountId: string
    email: string
  }
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    cafeName: '',
    ownerName: '',
    location: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ accountId: string; email: string } | null>(null)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<RegisterResponse>('/api/auth/register/cafe', {
        cafeName:  form.cafeName,
        ownerName: form.ownerName,
        location:  form.location,
        phone:     form.phone,
        email:     form.email,
        password:  form.password,
      })
      setSuccess({
        accountId: res.user?.accountId ?? '',
        email:     res.user?.email ?? form.email,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--portal-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: 800 }}>G</div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Gradient 365</span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '4px', textAlign: 'center' }}>Create your account</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '22px' }}>Register your cafe on Gradient 365</p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--badge-accepted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>✓</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Account created!</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Your Account ID:</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--portal-primary)', background: 'var(--portal-surface)', borderRadius: '8px', padding: '8px 16px' }}>{success.accountId}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.6 }}>
              Verification email sent to <strong>{success.email}</strong>. Click the link to activate your account.
            </p>
            <Link href="/login" style={{ display: 'block', marginTop: '20px', color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>Go to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Cafe Name</label>
              <input id="cafeName" type="text" value={form.cafeName} onChange={set('cafeName')} required placeholder="The Blue Mug Cafe" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Owner Name</label>
              <input id="ownerName" type="text" value={form.ownerName} onChange={set('ownerName')} required placeholder="Full name" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Location</label>
              <input id="location" type="text" value={form.location} onChange={set('location')} required placeholder="e.g. Indiranagar, Bangalore" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={set('phone')} required placeholder="10-digit mobile number" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
              <input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8} placeholder="Create a password" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 42px 9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                  <AuthPasswordToggleIcon visible={showPassword} />
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="Confirm your password" style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 42px 9px 12px', fontSize: '12px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                  <AuthPasswordToggleIcon visible={showConfirm} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--badge-rejected-bg)', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: 'var(--badge-rejected-text)' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: '13px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          main > div { margin: 0; border-radius: 0; border-left: none; border-right: none; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        }
      `}</style>
    </main>
  )
}
