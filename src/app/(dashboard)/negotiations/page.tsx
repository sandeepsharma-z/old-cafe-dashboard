'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

interface Negotiation {
  id: number
  order_ref: string
  supplier_name: string
  status: string
  created_at: string
  last_offer: string
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:          { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  accepted:         { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rejected:         { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  delivered:        { bg: '#ccfbf1', color: '#0f766e', label: 'Delivered' },
  confirmed:        { bg: '#dcfce7', color: '#166534', label: 'Confirmed' },
  cancelled:        { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  counter_pending:  { bg: '#fef3c7', color: '#92400e', label: 'Counter Offered' },
  counter_accepted: { bg: '#d1fae5', color: '#065f46', label: 'Counter Accepted' },
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
  { value: 'all',             label: 'All' },
  { value: 'pending',         label: 'Pending' },
  { value: 'counter_pending', label: 'Counter Offered' },
  { value: 'accepted',        label: 'Accepted' },
  { value: 'rejected',        label: 'Rejected' },
]

function NegotiationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status') ?? 'all'

  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<{ negotiations: Negotiation[] }>('/api/negotiations')
      .then(data => setNegotiations(data.negotiations ?? []))
      .catch(() => setNegotiations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusParam === 'all'
    ? negotiations
    : negotiations.filter(n => n.status === statusParam)

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '10px', flexShrink: 0 }}>
        <div style={{ flex: 1, maxWidth: '260px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 11px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>🔍 Search negotiations…</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '14px' }}>Negotiations</div>

        <div className="tab-bar">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`tab-item${statusParam === tab.value ? ' active' : ''}`}
              onClick={() => router.push(tab.value === 'all' ? '/negotiations' : `/negotiations?status=${tab.value}`)}
            >
              {tab.label} ({tab.value === 'all' ? negotiations.length : negotiations.filter(n => n.status === tab.value).length})
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '20px 0' }}>Loading negotiations…</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '10px', padding: '48px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤝</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px' }}>No active negotiations</p>
            </div>
          ) : (
            filtered.map(neg => (
              <div
                key={neg.id}
                onClick={() => router.push(`/negotiations/${neg.id}`)}
                style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', padding: '11px 13px', marginBottom: '7px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--portal-primary)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>📦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{neg.order_ref}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{neg.supplier_name}</div>
                </div>
                <div style={{ marginRight: '10px', textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {neg.status === 'accepted' || neg.status === 'counter_accepted' ? 'Agreed' : neg.status === 'counter_pending' ? 'Counter' : 'Last offer'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: (neg.status === 'accepted' || neg.status === 'counter_accepted') ? '#16A34A' : neg.status === 'counter_pending' ? '#2563EB' : 'var(--portal-primary)' }}>
                    ₹{Number(neg.last_offer).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{new Date(neg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
                <StatusBadge status={neg.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default function NegotiationsPage() {
  return (
    <Suspense fallback={<div style={{ color: '#64748b' }}>Loading...</div>}>
      <NegotiationsContent />
    </Suspense>
  )
}
