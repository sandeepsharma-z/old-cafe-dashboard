'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Icon, KpiCard, PageIntro, PageShell, Sk, StatStrip, StatusBadge, SupplierMark } from '@/components/cafe-v2'

interface Invoice {
  id: number
  invoice_number: string
  order_id: number
  supplier_account_id: string
  supplier_name: string
  issued_date: string
  due_date: string
  subtotal: string
  tax_amount: string
  total_amount: string
  payment_status: 'unpaid' | 'paid' | 'overdue'
  paid_at: string | null
}

interface InvoicesResponse {
  invoices: Invoice[]
  pagination: { total: number; page: number; limit: number }
  summary: {
    total_due: string
    total_overdue: string
    total_paid: string
    overdue_count: number
  }
}

const FILTER_TABS = [
  { value: 'all', label: 'All invoices' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
]

const SUPPLIER_COLORS = ['c-1', 'c-2', 'c-3', 'c-4', 'c-5'] as const

function supplierColor(name: string) {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % SUPPLIER_COLORS.length
  return SUPPLIER_COLORS[index]
}

function fmtAmount(value: string | number | null | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return `₹${numeric.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmtDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function dueLabel(invoice: Invoice) {
  const due = new Date(invoice.due_date)
  const now = new Date()
  const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
  if (invoice.payment_status === 'paid') return invoice.paid_at ? `Paid ${fmtDate(invoice.paid_at)}` : 'Paid'
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  return `Due in ${days}d`
}

function invoiceTone(status: Invoice['payment_status']): 'ok' | 'warn' | 'danger' {
  if (status === 'paid') return 'ok'
  if (status === 'overdue') return 'danger'
  return 'warn'
}

function statusLabel(status: Invoice['payment_status']) {
  if (status === 'paid') return 'Paid'
  if (status === 'overdue') return 'Overdue'
  return 'Unpaid'
}

function buildUrl(filter: string, page: number) {
  const params = new URLSearchParams()
  if (filter !== 'all') params.set('payment_status', filter)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/api/cafe/invoices${query ? `?${query}` : ''}`
}

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('payment_status') ?? 'all'
  const pageParam = Number(searchParams.get('page') ?? '1')

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<InvoicesResponse['summary'] | null>(null)
  const [pagination, setPagination] = useState<InvoicesResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingPaid, setMarkingPaid] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.get<InvoicesResponse>(buildUrl(filterParam, pageParam))
      .then(data => {
        setInvoices(data.invoices ?? [])
        setSummary(data.summary ?? null)
        setPagination(data.pagination ?? null)
      })
      .catch(() => {
        setInvoices([])
        setSummary(null)
        setError('Invoices could not be loaded. Check the API connection and try again.')
      })
      .finally(() => setLoading(false))
  }, [filterParam, pageParam])

  useEffect(() => {
    load()
  }, [load])

  const total = pagination?.total ?? invoices.length
  const limit = pagination?.limit ?? 20
  const currentPage = pagination?.page ?? 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const counts = useMemo(() => ({
    all: invoices.length,
    unpaid: invoices.filter(invoice => invoice.payment_status === 'unpaid').length,
    overdue: invoices.filter(invoice => invoice.payment_status === 'overdue').length,
    paid: invoices.filter(invoice => invoice.payment_status === 'paid').length,
  }), [invoices])

  async function handleMarkPaid(invoiceId: number) {
    setMarkingPaid(invoiceId)
    setError(null)
    try {
      await api.patch(`/api/cafe/invoices/${invoiceId}/mark-paid`, {})
      load()
    } catch {
      setError('Payment status could not be updated. Please try again.')
    } finally {
      setMarkingPaid(null)
    }
  }

  function setFilter(filter: string) {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('payment_status', filter)
    router.push(`/billing${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete('page')
    else params.set('page', String(page))
    router.push(`/billing${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <PageShell footerLeft="Gradient Cafe Portal - Billing" footerRight={`${total} invoices - synced just now`}>
      <PageIntro
        eyebrow="Billing - Supplier invoices"
        title="Approve payables"
        em="before they become noise."
        body={(
          <>
            Reviewing <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{loading ? '—' : total} invoices</b> across linked suppliers.{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{summary ? fmtAmount(summary.total_due) : '₹2,14,560'}</b> is pending approval, with{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{summary?.overdue_count ?? 2} overdue</b> invoices requiring owner attention.
          </>
        )}
        action={(
          <>
            <button className="tb-btn" style={{ height: 36 }}><Icon name="filter" size={13} /> GST month</button>
            <button className="btn-primary"><Icon name="download" size={14} /> Export</button>
          </>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
        <KpiCard title="Total due" value={loading || !summary ? '—' : fmtAmount(summary.total_due)} trend="6 invoices" tone="warn" sub="awaiting approval" icon={<Icon name="file" size={14} />} accentBar />
        <KpiCard title="Overdue" value={loading || !summary ? '—' : fmtAmount(summary.total_overdue)} trend={`${summary?.overdue_count ?? 0} late`} tone="danger" sub="needs review" icon={<Icon name="warning" size={14} />} />
        <KpiCard title="Paid this month" value={loading || !summary ? '—' : fmtAmount(summary.total_paid)} trend="+12.8%" tone="ok" sub="settled invoices" icon={<Icon name="check" size={14} />} />
        <KpiCard title="Next payout" value="₹48,900" trend="Mon 6 May" sub="scheduled batch" icon={<Icon name="clock" size={14} />} />
      </div>

      <StatStrip stats={[
        { key: 'Dairy payable', value: '₹86.4K', sub: 'largest category' },
        { key: 'GST input credit', value: '₹31.8K', sub: 'estimated' },
        { key: 'Oldest unpaid', value: '11d', sub: 'Blue Tokai' },
        { key: 'Payment hygiene', value: '94%', sub: 'last 90 days' },
      ]} />

      {error && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16, color: 'var(--danger)', background: 'var(--danger-soft)', borderColor: '#F4C9CE', fontSize: 13 }}>
          {error}
        </div>
      )}

      <section className="card" style={{ overflow: 'hidden' }}>
        <div className="tab-row">
          {FILTER_TABS.map(tab => {
            const count = counts[tab.value as keyof typeof counts] ?? 0
            return (
              <button key={tab.value} className={`tab${filterParam === tab.value ? ' active' : ''}`} onClick={() => setFilter(tab.value)}>
                {tab.label}
                {!loading && <span className="cnt">{count}</span>}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--line-2)', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 10px', minWidth: 260, background: 'var(--surface-warm)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', fontSize: 12.5 }}>
            <Icon name="search" size={13} />
            <input placeholder="Search invoice, supplier, order ID..." style={{ border: 0, outline: 0, background: 'transparent', fontSize: 12.5, color: 'var(--ink)', width: '100%' }} />
          </label>
          <button className="tb-btn"><Icon name="filter" size={12} /> Filter</button>
          <button className="tb-btn">Sort: Due date</button>
          <button className="tb-btn">All outlets</button>
          <div style={{ flex: 1 }} />
          <button className="tb-btn"><Icon name="download" size={12} /> Export</button>
          <button className="tb-btn primary">Approve batch</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Supplier</th>
                <th>Issued</th>
                <th>Due</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
                <th style={{ textAlign: 'right' }}>Tax</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td><Sk w={84} h={13} /></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Sk w={28} h={28} /><Sk w={120} h={13} /></div></td>
                    <td><Sk w={62} h={12} /></td>
                    <td><Sk w={70} h={12} /></td>
                    <td style={{ textAlign: 'right' }}><Sk w={60} h={13} /></td>
                    <td style={{ textAlign: 'right' }}><Sk w={54} h={13} /></td>
                    <td><Sk w={78} h={22} /></td>
                    <td style={{ textAlign: 'right' }}><Sk w={72} h={13} /></td>
                    <td style={{ textAlign: 'right' }}><Sk w={70} h={28} /></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '52px 22px', color: 'var(--ink-3)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px', background: 'var(--surface-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
                      <Icon name="file" size={18} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>No invoices in this view</div>
                    <div style={{ fontSize: 12.5 }}>Try a different payment status or date range.</div>
                  </td>
                </tr>
              ) : invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{invoice.invoice_number}</div>
                    <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--ink-4)' }}>Order #{invoice.order_id}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SupplierMark name={invoice.supplier_name} color={supplierColor(invoice.supplier_name)} size={30} />
                      <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{invoice.supplier_name}</span>
                    </div>
                  </td>
                  <td className="tnum">{fmtDate(invoice.issued_date)}</td>
                  <td className="tnum" style={{ color: invoice.payment_status === 'overdue' ? 'var(--danger)' : 'var(--ink-3)', fontWeight: invoice.payment_status === 'overdue' ? 600 : 400 }}>{dueLabel(invoice)}</td>
                  <td className="tnum" style={{ textAlign: 'right' }}>{fmtAmount(invoice.subtotal)}</td>
                  <td className="tnum" style={{ textAlign: 'right', color: 'var(--ink-3)' }}>{fmtAmount(invoice.tax_amount)}</td>
                  <td><StatusBadge tone={invoiceTone(invoice.payment_status)}>{statusLabel(invoice.payment_status)}</StatusBadge></td>
                  <td className="tnum" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>{fmtAmount(invoice.total_amount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {invoice.payment_status === 'paid' ? (
                      <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{fmtDate(invoice.paid_at)}</span>
                    ) : (
                      <button className="tb-btn primary" disabled={markingPaid === invoice.id} onClick={() => handleMarkPaid(invoice.id)}>
                        {markingPaid === invoice.id ? 'Saving...' : 'Mark paid'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && invoices.length > 0 && (
          <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line-2)' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              Showing <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{invoices.length}</b> of <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{total}</b> invoices
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="tb-btn" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{currentPage} / {totalPages}</span>
              <button className="tb-btn" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--ink-3)', fontSize: 13.5 }}>Loading billing...</div>}>
      <BillingContent />
    </Suspense>
  )
}
