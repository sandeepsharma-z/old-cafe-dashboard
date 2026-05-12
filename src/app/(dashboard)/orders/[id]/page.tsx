'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface OrderDetail {
  id: number
  order_ref: string
  status: string
  payment_status: string
  supplier_name: string
  supplier_account_id: string
  total_amount: string
  created_at: string
  updated_at: string
  notes: string
  delivery_address: string
}

interface OrderItem {
  id: number
  item_name: string
  unit: string
  quantity: number
  unit_price: string
  total_price: string
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Awaiting Response' },
  accepted:  { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  partial:   { bg: '#fed7aa', color: '#b45309', label: 'Partially Accepted' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  delivered: { bg: '#ccfbf1', color: '#0f766e', label: 'Delivered' },
  closed:    { bg: '#dcfce7', color: '#166534', label: 'Closed ✅' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ order: OrderDetail; items: OrderItem[] }>(`/api/orders/${id}`)
      .then(data => {
        setOrder(data.order)
        setItems(data.items ?? [])
      })
      .catch(() => setError('Could not load order.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleMarkPaid() {
    setMarkingPaid(true)
    try {
      await api.post(`/api/orders/${id}/mark-paid`, {})
      load()
    } catch {
      alert('Failed to mark as paid. Please try again.')
    } finally {
      setMarkingPaid(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px' }}>
        <div style={{ width: '100px', height: '14px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '24px' }} />
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '200px', height: '24px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '16px' }} />
          <div style={{ width: '120px', height: '14px', background: '#f1f5f9', borderRadius: '4px' }} />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '800px' }}>
        <Link href="/orders" style={{ color: 'var(--portal-primary)', textDecoration: 'none', fontSize: '14px' }}>← My Orders</Link>
        <p style={{ color: '#dc2626', marginTop: '24px' }}>{error || 'Order not found.'}</p>
      </div>
    )
  }

  const totalCalc = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0)

  const STEPS = ['Placed', 'Accepted', 'Dispatched', 'Delivered']
  const stepIndex = ({ pending: 0, accepted: 1, partial: 1, dispatched: 2, delivered: 3, closed: 3, rejected: 0, cancelled: 0 } as Record<string, number>)[order.status] ?? 0

  return (
    <>
      {/* Breadcrumb topbar */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '8px', flexShrink: 0 }}>
        <Link href="/orders" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}>← Orders</Link>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{order.order_ref}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={order.status} />
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px' }}>
        {/* Timeline */}
        <div style={{ display: 'flex', marginBottom: '18px' }}>
          {STEPS.map((step, i) => (
            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: '11px', left: '50%', width: '100%', height: '2px', background: i < stepIndex ? 'var(--portal-primary)' : 'var(--border)', zIndex: 0 }} />
              )}
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: i < stepIndex ? 'var(--portal-primary)' : i === stepIndex ? '#fff' : 'var(--border)', border: i === stepIndex ? '2px solid var(--portal-primary)' : 'none', boxShadow: i === stepIndex ? '0 0 0 3px rgba(234,88,12,0.18)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: i < stepIndex ? '#fff' : 'var(--text-muted)', zIndex: 1, position: 'relative' }}>
                {i < stepIndex ? '✓' : ''}
              </div>
              <div style={{ fontSize: '9px', color: i <= stepIndex ? 'var(--portal-primary)' : 'var(--text-muted)', marginTop: '4px', textAlign: 'center', fontWeight: i <= stepIndex ? 600 : 400 }}>{step}</div>
            </div>
          ))}
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px' }}>
          {/* Items table */}
          <div style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 13px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Order Items</div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ padding: '8px 13px', textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Product</th>
                  <th style={{ padding: '8px 13px', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Qty</th>
                  <th style={{ padding: '8px 13px', textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Unit Price</th>
                  <th style={{ padding: '8px 13px', textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 13px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500 }}>{item.item_name}</td>
                    <td style={{ padding: '9px 13px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                    <td style={{ padding: '9px 13px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td style={{ padding: '9px 13px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>₹{parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                  <td colSpan={3} style={{ padding: '9px 13px', fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)', textAlign: 'right' }}>Total</td>
                  <td style={{ padding: '9px 13px', fontWeight: 700, color: 'var(--portal-primary)', fontSize: '13px', textAlign: 'right' }}>₹{totalCalc.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Payment action box */}
            {order.status === 'delivered' && order.payment_status === 'pending' && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '9px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>Payment Pending</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Order delivered. Mark as paid to close.</div>
                <button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 12px', fontSize: '11px', fontWeight: 700, cursor: markingPaid ? 'not-allowed' : 'pointer', opacity: markingPaid ? 0.7 : 1 }}
                >
                  {markingPaid ? 'Marking…' : '✓ Mark as Paid'}
                </button>
              </div>
            )}

            {/* Supplier info */}
            <div style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', padding: '11px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Supplier</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.supplier_name}</div>
              {order.delivery_address && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>{order.delivery_address}</div>
              )}
              {order.notes && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{order.notes}</div>
              )}
              <div style={{ marginTop: '10px' }}>
                <Link href={`/orders/${id}/chat`} style={{ fontSize: '11px', color: 'var(--portal-primary)', fontWeight: 600, textDecoration: 'none' }}>💬 Open chat →</Link>
              </div>
            </div>

            {/* Payment status */}
            {order.payment_status && (
              <div style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', padding: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payment</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: order.payment_status === 'paid' ? '#059669' : '#92400e' }}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
