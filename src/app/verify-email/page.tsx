'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

type VerifyState = 'loading' | 'success' | 'error'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [state, setState]     = useState<VerifyState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token     = searchParams.get('token')
    const accountId = searchParams.get('accountId')

    if (!token || !accountId) {
      setState('error')
      setMessage('Invalid verification link. Token or account ID is missing.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}&accountId=${encodeURIComponent(accountId)}`,
          { cache: 'no-store' }
        )
        const data = await res.json()
        if (res.ok) {
          setState('success')
        } else {
          setState('error')
          setMessage(data.error ?? data.message ?? 'Verification failed. Please try again.')
        }
      } catch {
        setState('error')
        setMessage('Unable to reach the server. Please check your connection and try again.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {state === 'loading' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>⏳</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Verifying your email…</div>
          </>
        )}
        {state === 'success' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--badge-accepted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', color: 'var(--badge-accepted-text)' }}>✓</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Email verified!</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>You can now sign in to your account.</div>
            <Link href="/login"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: '13px' }}>Sign in</button></Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--badge-rejected-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', color: 'var(--badge-rejected-text)' }}>✗</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Verification failed</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{message}</div>
          </>
        )}
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--portal-surface)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#64748b' }}>Loading...</div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
