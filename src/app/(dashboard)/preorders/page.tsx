'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface PreOrder {
  id: number
  supplier_name: string
  supplier_account_id: string
  item_name: string
  catalogue_item_id: number
  quantity: number
  unit: string
  frequency: 'one_time' | 'weekly' | 'monthly'
  scheduled_date: string
  recurrence_day: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'fulfilled'
  notes: string | null
  created_at: string
}

interface CatalogueItem {
  id: number
  item_name: string
  unit: string
  supplier_account_id: string
  supplier_name: string
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef9c3', color: '#854d0e',  label: 'Pending' },
  confirmed: { bg: '#dcfce7', color: '#166534',  label: 'Confirmed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b',  label: 'Cancelled' },
  fulfilled: { bg: '#ccfbf1', color: '#0f766e',  label: 'Fulfilled' },
}

const FREQ_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  one_time: { bg: '#f1f5f9', color: '#475569',  label: 'One-Time' },
  weekly:   { bg: '#dbeafe', color: '#1d4ed8',  label: 'Weekly' },
  monthly:  { bg: '#ede9fe', color: '#6d28d9',  label: 'Monthly' },
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

function FreqBadge({ freq }: { freq: string }) {
  const f = FREQ_COLORS[freq] ?? { bg: '#f1f5f9', color: '#475569', label: freq }
  return (
    <span style={{ background: f.bg, color: f.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
      {f.label}
    </span>
  )
}

// ── Create Pre-Order Modal ──────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreated: (msg: string) => void
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([])
  const [loadingCatalogue, setLoadingCatalogue] = useState(true)

  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [frequency, setFrequency] = useState<'one_time' | 'weekly' | 'monthly'>('one_time')
  const [scheduledDate, setScheduledDate] = useState('')
  const [recurrenceDay, setRecurrenceDay] = useState('monday')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    api.get<{ items?: CatalogueItem[]; catalogue?: CatalogueItem[] }>('/api/catalogue/browse')
      .then(data => {
        const items = data.items ?? data.catalogue ?? []
        setCatalogueItems(items)
      })
      .catch(() => setCatalogueItems([]))
      .finally(() => setLoadingCatalogue(false))
  }, [])

  // Unique suppliers from catalogue
  const suppliers = Array.from(
    new Map(
      catalogueItems.map(i => [i.supplier_account_id, { id: i.supplier_account_id, name: i.supplier_name }])
    ).values()
  )

  // Items filtered by selected supplier
  const supplierItems = selectedSupplierId
    ? catalogueItems.filter(i => i.supplier_account_id === selectedSupplierId)
    : []

  function handleSupplierChange(suppId: string) {
    setSelectedSupplierId(suppId)
    setSelectedItemId('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!selectedSupplierId) { setFormError('Please select a supplier.'); return }
    if (!selectedItemId) { setFormError('Please select an item.'); return }
    if (!scheduledDate) { setFormError('Please pick a scheduled date.'); return }
    if (!quantity || Number(quantity) < 1) { setFormError('Quantity must be at least 1.'); return }

    setSubmitting(true)
    try {
      await api.post('/api/cafe/preorders', {
        supplier_account_id: selectedSupplierId,
        catalogue_item_id: Number(selectedItemId),
        quantity: Number(quantity),
        frequency,
        scheduled_date: scheduledDate,
        ...(frequency === 'weekly' ? { recurrence_day: recurrenceDay } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      onCreated('Pre-order created!')
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create pre-order.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>New Pre-Order</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Schedule a recurring or future delivery.</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#94a3b8',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Supplier */}
            <div>
              <label style={labelStyle}>Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={e => handleSupplierChange(e.target.value)}
                style={inputStyle}
                disabled={loadingCatalogue}
              >
                <option value="">{loadingCatalogue ? 'Loading…' : 'Select supplier'}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Item */}
            <div>
              <label style={labelStyle}>Item</label>
              <select
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                style={inputStyle}
                disabled={!selectedSupplierId}
              >
                <option value="">{selectedSupplierId ? 'Select item' : 'Select a supplier first'}</option>
                {supplierItems.map(item => (
                  <option key={item.id} value={String(item.id)}>
                    {item.item_name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label style={labelStyle}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={inputStyle}
                placeholder="e.g. 10"
              />
            </div>

            {/* Frequency */}
            <div>
              <label style={labelStyle}>Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as 'one_time' | 'weekly' | 'monthly')}
                style={inputStyle}
              >
                <option value="one_time">One-Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Recurrence Day — only when weekly */}
            {frequency === 'weekly' && (
              <div>
                <label style={labelStyle}>Recurrence Day</label>
                <select
                  value={recurrenceDay}
                  onChange={e => setRecurrenceDay(e.target.value)}
                  style={inputStyle}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Scheduled Date */}
            <div>
              <label style={labelStyle}>Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Any special instructions…"
              />
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                {formError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: submitting ? '#f1f5f9' : 'var(--portal-gradient)',
                  color: submitting ? '#94a3b8' : '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Creating…' : 'Create Pre-Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

function PreOrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusParam = searchParams.get('status') ?? 'all'

  const [preorders, setPreorders] = useState<PreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [flashMessage, setFlashMessage] = useState('')
  const [cancelling, setCancelling] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const url = `/api/cafe/preorders${statusParam !== 'all' ? '?status=' + statusParam : ''}`
    api.get<{ preorders?: PreOrder[] } | PreOrder[]>(url)
      .then(data => {
        if (Array.isArray(data)) {
          setPreorders(data)
        } else {
          setPreorders((data as { preorders?: PreOrder[] }).preorders ?? [])
        }
      })
      .catch(() => setPreorders([]))
      .finally(() => setLoading(false))
  }, [statusParam])

  useEffect(() => { load() }, [load])

  function setStatusFilter(s: string) {
    router.push(s === 'all' ? '/preorders' : `/preorders?status=${s}`)
  }

  async function handleCancel(id: number) {
    if (!confirm('Cancel this pre-order?')) return
    setCancelling(id)
    try {
      await api.patch(`/api/cafe/preorders/${id}`, { status: 'cancelled' })
      load()
    } catch {
      alert('Failed to cancel pre-order.')
    } finally {
      setCancelling(null)
    }
  }

  function handleCreated(msg: string) {
    setShowModal(false)
    setFlashMessage(msg)
    load()
    setTimeout(() => setFlashMessage(''), 3500)
  }

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '10px', flexShrink: 0 }}>
        <div style={{ flex: 1, maxWidth: '260px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 11px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>🔍 Search pre-orders…</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '11px' }}>+ Schedule</button>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Pre-Orders</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>Scheduled recurring orders — placed automatically on your behalf</div>

        {/* Flash message */}
        {flashMessage && (
          <div style={{ background: 'var(--badge-accepted-bg)', color: 'var(--badge-accepted-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            {flashMessage}
          </div>
        )}

        {/* Status tabs */}
        <div className="tab-bar" style={{ marginBottom: '14px' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`tab-item${statusParam === tab.value ? ' active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '13px' }}>
                  <div style={{ width: '180px', height: '14px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ width: '120px', height: '11px', background: 'var(--bg)', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : preorders.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px', margin: '0 0 14px' }}>No pre-orders yet. Schedule your first recurring delivery.</p>
              <button onClick={() => setShowModal(true)} className="btn-primary" style={{ fontSize: '11px', padding: '7px 16px' }}>+ Schedule Pre-Order</button>
            </div>
          ) : (
            preorders.map(po => (
              <div key={po.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '13px', marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🔁</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{po.item_name}</span>
                    <FreqBadge freq={po.frequency} />
                    <StatusBadge status={po.status} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {po.supplier_name} · {po.quantity} {po.unit}
                    {po.recurrence_day && ` · every ${po.recurrence_day.charAt(0).toUpperCase() + po.recurrence_day.slice(1)}`}
                    {' · Next: '}{new Date(po.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  {po.notes && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{po.notes}</div>}
                </div>
                <div style={{ flexShrink: 0 }}>
                  {(po.status === 'pending' || po.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(po.id)}
                      disabled={cancelling === po.id}
                      className="btn-danger"
                      style={{ fontSize: '10px', padding: '6px 12px', opacity: cancelling === po.id ? 0.6 : 1, cursor: cancelling === po.id ? 'not-allowed' : 'pointer' }}
                    >
                      {cancelling === po.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}

export default function PreOrdersPage() {
  return (
    <Suspense fallback={<div style={{ color: '#64748b' }}>Loading...</div>}>
      <PreOrdersContent />
    </Suspense>
  )
}
