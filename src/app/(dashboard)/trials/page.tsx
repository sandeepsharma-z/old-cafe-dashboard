'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

interface Trial {
  id: number
  product_name: string
  brand_name: string
  status: string
  start_date: string
  end_date: string
  feedback_submitted: boolean
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:          { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  active:           { bg: '#dcfce7', color: '#166534', label: 'Active' },
  completed:        { bg: '#ccfbf1', color: '#0f766e', label: 'Completed' },
  cancelled:        { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  counter_pending:  { bg: '#fef3c7', color: '#92400e', label: 'Counter Offered' },
  counter_accepted: { bg: '#d1fae5', color: '#065f46', label: 'Counter Accepted' },
  accepted:         { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rejected:         { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  delivered:        { bg: '#ccfbf1', color: '#0f766e', label: 'Delivered' },
  confirmed:        { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

const TABS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

function TrialsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status') ?? 'all'

  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<{ trials: Trial[] }>('/api/trials/cafe')
      .then(data => setTrials(data.trials ?? []))
      .catch(() => setTrials([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusParam === 'all'
    ? trials
    : trials.filter(t => t.status === statusParam)

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '10px', flexShrink: 0 }}>
        <div style={{ flex: 1, maxWidth: '260px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 11px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>🔍 Search trials…</div>
        <div style={{ marginLeft: 'auto' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div></div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '14px' }}>Trial Kits</div>

        <div className="tab-bar">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`tab-item${statusParam === tab.value ? ' active' : ''}`}
              onClick={() => router.push(tab.value === 'all' ? '/trials' : `/trials?status=${tab.value}`)}
            >
              {tab.label} ({tab.value === 'all' ? trials.length : trials.filter(t => t.status === tab.value).length})
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '20px 0' }}>Loading trials…</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '10px', padding: '48px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧪</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>No trial samples yet. Brands will send products for you to try.</p>
            </div>
          ) : (
            filtered.map(trial => (
              <div key={trial.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '13px', marginBottom: '9px', opacity: trial.feedback_submitted ? 0.65 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: trial.feedback_submitted ? '0' : '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎁</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{trial.product_name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {trial.brand_name} · {new Date(trial.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {trial.end_date && ` – ${new Date(trial.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </div>
                  </div>
                  <StatusBadge status={trial.status} />
                </div>

                {trial.status === 'active' && !trial.feedback_submitted && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Link href={`/trials/${trial.id}/feedback`}>
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '10px' }}>Submit Feedback</button>
                    </Link>
                  </div>
                )}

                {trial.feedback_submitted && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>Feedback submitted. Supplier notified. Next step: order via catalogue.</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default function TrialsPage() {
  return (
    <Suspense fallback={<div style={{ color: '#64748b' }}>Loading...</div>}>
      <TrialsContent />
    </Suspense>
  )
}
