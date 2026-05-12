'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

/* ── Types ─────────────────────────────────────────────────────────── */
interface Order {
  id: number
  order_ref: string
  supplier_name: string
  supplier_account_id: string
  item_count: number
  total_amount: string
  status: string
  payment_status: string
  created_at: string
}

/* ── Status config ─────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  pending:   { cls: 'warn',    label: 'Payment pending' },
  accepted:  { cls: 'info',    label: 'In transit' },
  partial:   { cls: 'accent',  label: 'Preparing' },
  rejected:  { cls: 'danger',  label: 'Cancelled' },
  delivered: { cls: 'ok',      label: 'Delivered' },
  closed:    { cls: 'neutral', label: 'Closed' },
  cancelled: { cls: 'danger',  label: 'Cancelled' },
  dispatched:{ cls: 'info',    label: 'In transit' },
}

const TABS = [
  { value: 'all',       label: 'All orders' },
  { value: 'accepted',  label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'pending',   label: 'Payment pending' },
  { value: 'cancelled', label: 'Cancelled' },
]

/* ── Helpers ───────────────────────────────────────────────────────── */
const SUPPLIER_COLORS = ['c-1','c-2','c-3','c-4','c-5'] as const
function supplierColor(name: string) {
  const idx = name.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 5
  return SUPPLIER_COLORS[idx]
}
function supplierInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')
}
function fmtAmount(v: string) {
  const n = parseFloat(v)
  if (isNaN(n)) return v
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
function fmtDate(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function getOutlet(name: string) {
  const outlets = ['Indiranagar', 'Koramangala', 'HSR Layout']
  return outlets[name.split('').reduce((a,c) => a+c.charCodeAt(0),0) % 3]
}
function getDesc(ref: string) {
  const descs = ['Buffalo milk, A2 cow milk', 'Rocket, basil, cherry tomatoes', 'Cream, butter, curd', 'Attikan Estate · 5kg × 6', 'Eggs — tray × 24', 'Sourdough, brioche, croissants', 'Vienna blend, cold brew', 'Baguette, focaccia', 'Alphonso mangoes, pineapple', 'Micro-herbs, edible flowers', 'Double cream, yoghurt', 'Cardamom, cinnamon, star anise']
  return descs[ref.charCodeAt(ref.length-1) % descs.length]
}

/* ── Status badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { cls: 'neutral', label: status }
  return (
    <span className={`status ${s.cls}`}>
      <span className="dot"/>
      {s.label}
    </span>
  )
}

/* ── Skeleton ──────────────────────────────────────────────────────── */
function Sk({ w = '100%', h = 12 }: { w?: string | number; h?: number }) {
  return <div className="shimmer" style={{ width: w, height: h, borderRadius: 4, display: 'inline-block' }}/>
}

/* ══════════════════════════════════════════════════════════════════════
   ORDERS CONTENT (inner — needs useSearchParams)
═══════════════════════════════════════════════════════════════════════ */
function OrdersContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const statusParam  = searchParams.get('status') ?? 'all'

  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    setLoading(true)
    const url = `/api/orders${statusParam !== 'all' ? '?status=' + statusParam : ''}`
    api.get<{ orders: Order[] }>(url)
      .then(data => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [statusParam])

  const filteredOrders = orders
  const inTransit   = orders.filter(o => ['accepted','dispatched'].includes(o.status)).length
  const payPending  = orders.filter(o => o.status === 'pending').length
  const totalSpend  = orders.reduce((s, o) => s + parseFloat(o.total_amount || '0'), 0)
  const avgOrder    = orders.length ? totalSpend / orders.length : 12680

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(244,246,251,0.85)',
        backdropFilter: 'saturate(160%) blur(12px)',
        WebkitBackdropFilter: 'saturate(160%) blur(12px)',
        borderBottom: '1px solid var(--line)', marginBottom: 4,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', minWidth: 260, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 999, color: 'var(--ink-3)', fontSize: 13.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search suppliers, SKUs, invoices…" style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 5, background: 'var(--surface-warm)', letterSpacing: '0.02em', flexShrink: 0 }}>⌘K</span>
          </div>
          <div style={{ flex: 1 }}/>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', cursor: 'pointer', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#E0524A', boxShadow: '0 0 0 2px var(--bg)' }}/>
          </button>
          <Link href="/urgent-search" style={{ height: 38, padding: '0 18px', borderRadius: 999, background: 'linear-gradient(180deg,#3E6CF0 0%,var(--accent) 100%)', color: '#fff', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: 'rgba(255,255,255,0.25) 0 1px 0 inset,rgba(43,91,229,0.4) 0 4px 12px -2px', textDecoration: 'none' }}>
            Urgent Search
          </Link>
        </div>
      </header>

      {/* ── Shell ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 56px' }}>

        {/* Page heading */}
        <div style={{ padding: '36px 0 28px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 10 }}>
            Orders · Last 7 days
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.022em', fontWeight: 500, color: 'var(--ink)' }}>
                Every order,{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 38, letterSpacing: '-0.01em' }}>
                  every outlet,
                </em>
                {' '}one ledger.
              </h1>
              <p style={{ marginTop: 10, fontSize: 14.5, color: 'var(--ink-3)', maxWidth: 640, lineHeight: 1.55 }}>
                Tracking <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{loading ? '—' : orders.length} orders</b> worth{' '}
                <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{fmtAmount(String(totalSpend))}</b> across 3 outlets and 6 suppliers this week.{' '}
                <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{inTransit} in transit.</b>{' '}
                {payPending > 0 && <><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{payPending} awaiting payment.</b></>}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Updated just now
              </span>
              <button className="btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New order
              </button>
            </div>
          </div>
        </div>

        {/* Order stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', border: '1px solid var(--line)', borderRadius: 14, background: 'var(--surface)', overflow: 'hidden', marginBottom: 20 }}>
          {[
            { k: 'Placed this week', v: loading ? '—' : String(orders.length), sub: `${fmtAmount(String(totalSpend))} value` },
            { k: 'In transit',       v: loading ? '—' : String(inTransit),  sub: `${inTransit} arriving today` },
            { k: 'Payment pending',  v: loading ? '—' : String(payPending), sub: payPending > 0 ? `${fmtAmount(String(payPending * avgOrder))} due` : 'All clear' },
            { k: 'Avg. order',       v: `₹${Math.round(avgOrder).toLocaleString('en-IN')}`, sub: '−4.2% vs last week' },
            { k: 'On-time rate',     v: '96.4%', sub: 'last 30 days' },
          ].map((st, i) => (
            <div key={st.k} style={{ padding: '16px 20px', borderRight: i < 4 ? '1px solid var(--line-2)' : 'none' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 6 }}>
                {st.k}
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--ink)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                {loading ? <div className="shimmer" style={{ width: 60, height: 22, borderRadius: 4 }}/> : st.v}
                <small style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400, letterSpacing: 0 }}>{!loading && st.sub}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Card with tabs + table */}
        <div className="card" style={{ overflow: 'hidden' }}>

          {/* Tabs */}
          <div className="tab-row">
            {TABS.map(tab => {
              const count = tab.value === 'all' ? orders.length
                : tab.value === 'accepted' ? inTransit
                : tab.value === 'delivered' ? orders.filter(o=>o.status==='delivered').length
                : tab.value === 'pending' ? payPending
                : orders.filter(o=>o.status===tab.value).length
              return (
                <button key={tab.value} className={`tab${statusParam===tab.value?' active':''}`}
                  onClick={() => router.push(tab.value==='all'?'/orders':`/orders?status=${tab.value}`)}>
                  {tab.label}
                  {!loading && <span className="cnt">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--line-2)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 10px', minWidth: 240, background: 'var(--surface-warm)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', fontSize: 12.5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search ID, supplier, SKU…" style={{ border: 0, outline: 0, background: 'transparent', fontSize: 12.5, color: 'var(--ink)', width: '100%' }}/>
            </div>
            <button className="tb-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
            <button className="tb-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Sort: Newest ▾
            </button>
            <button className="tb-btn">All outlets ▾</button>
            <div style={{ flex: 1 }}/>
            <button className="tb-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
            <button className="tb-btn primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New order
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--ink-5)', background: 'var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}/>
                  </th>
                  <th>Order</th>
                  <th>Supplier</th>
                  <th>Description</th>
                  <th>Items</th>
                  <th>Outlet</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length: 6}).map((_,i) => (
                    <tr key={i}>
                      <td><Sk w={16} h={16}/></td>
                      <td><Sk w={70} h={13}/></td>
                      <td><div style={{display:'flex',alignItems:'center',gap:10}}><Sk w={28} h={28}/><Sk w={90} h={13}/></div></td>
                      <td><Sk w={120} h={12}/></td>
                      <td><Sk w={20} h={12}/></td>
                      <td><Sk w={70} h={12}/></td>
                      <td><Sk w={80} h={22}/></td>
                      <td><Sk w={70} h={12}/></td>
                      <td style={{textAlign:'right'}}><Sk w={60} h={13}/></td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px 22px', color: 'var(--ink-3)' }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>No orders found</div>
                      <Link href="/catalogue" style={{ color: 'var(--accent)', fontWeight: 500 }}>Browse Catalogue →</Link>
                    </td>
                  </tr>
                ) : filteredOrders.map(order => (
                  <tr key={order.id} style={{ background: selected.has(order.id) ? '#EFF4FF' : undefined }}>
                    <td>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${selected.has(order.id) ? 'var(--ink)' : 'var(--ink-5)'}`, background: selected.has(order.id) ? 'var(--ink)' : 'var(--surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.12s', color: '#FBFAF7' }}
                        onClick={() => toggleSelect(order.id)}>
                        {selected.has(order.id) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', fontWeight: 500, letterSpacing: '0.01em' }}>
                        {order.order_ref}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`supplier-mark ${supplierColor(order.supplier_name)}`} style={{ width: 28, height: 28, fontSize: 10.5, borderRadius: 8 }}>
                          {supplierInitials(order.supplier_name)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{order.supplier_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--ink-3)', maxWidth: 180 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {getDesc(order.order_ref)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{order.item_count}</td>
                    <td style={{ fontSize: 13, color: 'var(--ink-2)' }}>{getOutlet(order.supplier_name)}</td>
                    <td>
                      <StatusBadge status={order.status}/>
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', fontSize: 12.5 }}>
                      {fmtDate(order.created_at)}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                      {fmtAmount(order.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
            <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line-2)' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                Showing <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{filteredOrders.length}</b> of <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{filteredOrders.length}</b> orders
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="tb-btn">Previous</button>
                <button className="tb-btn">Next</button>
              </div>
            </div>
          )}

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div style={{ position: 'sticky', bottom: 18, margin: '16px auto 0', maxWidth: 640, background: 'var(--ink)', color: '#FBFAF7', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'rgba(0,0,0,0.35) 0 20px 50px -20px' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{selected.size} selected</span>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.14)', alignSelf: 'stretch' }}/>
              <button style={{ color: '#FBFAF7', fontSize: 12.5, padding: '4px 10px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                Export selected
              </button>
              <button style={{ color: 'var(--accent)', fontSize: 12.5, padding: '4px 10px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, padding: '16px 4px', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-4)', fontSize: 11.5, borderTop: '1px solid var(--line)' }}>
          <span>Gradient Cafe Portal · Orders</span>
          <span>Bengaluru · 3 outlets · synced just now</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PAGE EXPORT (Suspense wrapper for useSearchParams)
═══════════════════════════════════════════════════════════════════════ */
export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 40, color: 'var(--ink-3)', fontSize: 13.5 }}>Loading orders…</div>
    }>
      <OrdersContent />
    </Suspense>
  )
}
