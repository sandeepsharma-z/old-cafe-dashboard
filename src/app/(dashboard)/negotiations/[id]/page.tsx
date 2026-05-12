'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface NegotiationDetail {
  id: number
  order_ref: string
  supplier_name: string
  status: string
  original_price: string
  current_offer: string
  created_at: string
}

interface NegotiationMessage {
  id: number
  sender_role: string
  offer_price: string
  message: string
  created_at: string
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

export default function NegotiationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [negotiation, setNegotiation] = useState<NegotiationDetail | null>(null)
  const [thread, setThread] = useState<NegotiationMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responding, setResponding] = useState(false)
  const [actionError, setActionError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ negotiation: NegotiationDetail; thread: NegotiationMessage[] }>(`/api/negotiations/${id}`)
      .then(data => {
        setNegotiation(data.negotiation)
        setThread(data.thread ?? [])
      })
      .catch(() => setError('Could not load negotiation.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleRespond(action: 'accept' | 'reject') {
    setResponding(true)
    setActionError('')
    try {
      await api.patch(`/api/negotiations/${id}/respond`, { action })
      load()
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Action failed. Please try again.')
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>← Negotiations · …</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px' }}>
            <div style={{ width: '180px', height: '16px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ width: '120px', height: '12px', background: 'var(--bg)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !negotiation) {
    return (
      <div>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <Link href="/negotiations" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negotiations</Link>
        </div>
        <div style={{ padding: '18px' }}>
          <p style={{ color: '#dc2626', fontSize: '13px' }}>{error || 'Negotiation not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb topbar */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '6px', flexShrink: 0 }}>
        <Link href="/negotiations" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negotiations</Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{negotiation.order_ref}</span>
      </div>

      <div style={{ padding: '18px', maxWidth: '720px' }}>
        {/* Header card */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{negotiation.order_ref}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <StatusBadge status={negotiation.status} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(negotiation.created_at).toLocaleDateString('en-IN')}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--portal-primary)', fontWeight: 600 }}>{negotiation.supplier_name}</div>
        </div>

        {/* Price summary */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>Price Summary</div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Original Price</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-muted)' }}>₹{Number(negotiation.original_price).toFixed(2)}</div>
            </div>
            <span style={{ fontSize: '16px', color: 'var(--border)' }}>→</span>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Current Offer</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--portal-primary)' }}>₹{Number(negotiation.current_offer).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Offer thread */}
        {thread.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Offer Thread</div>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {thread.map(msg => {
                const isCafe = msg.sender_role === 'cafe'
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCafe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '78%',
                      background: isCafe ? 'var(--bg)' : '#fff',
                      border: `1px solid ${isCafe ? 'var(--border)' : 'var(--border)'}`,
                      borderRadius: '10px',
                      padding: '10px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ background: isCafe ? 'var(--portal-primary)' : 'var(--bg)', color: isCafe ? '#fff' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isCafe ? 'You' : 'Supplier'}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{Number(msg.offer_price).toFixed(2)}</span>
                      </div>
                      {msg.message && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 5px', lineHeight: 1.5 }}>{msg.message}</p>}
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Counter offer action */}
        {negotiation.status === 'counter_pending' && (
          <div style={{ background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px', margin: '0 0 12px' }}>
              Supplier sent a counter offer. Accept or reject?
            </p>
            {actionError && <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => handleRespond('accept')} disabled={responding} className="btn-primary" style={{ opacity: responding ? 0.7 : 1, cursor: responding ? 'not-allowed' : 'pointer' }}>
                {responding ? 'Processing…' : 'Accept Counter Offer'}
              </button>
              <button onClick={() => handleRespond('reject')} disabled={responding} className="btn-danger" style={{ opacity: responding ? 0.7 : 1, cursor: responding ? 'not-allowed' : 'pointer' }}>
                Reject
              </button>
            </div>
          </div>
        )}

        {negotiation.status === 'pending' && (
          <div style={{ background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⏳</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>Awaiting supplier response</p>
          </div>
        )}

        <button onClick={() => router.push('/negotiations')} className="btn-ghost" style={{ fontSize: '12px' }}>← All Negotiations</button>
      </div>
    </div>
  )
}
