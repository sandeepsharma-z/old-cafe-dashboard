'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

/* ── Types ─────────────────────────────────────────────────────────── */
interface Stats {
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  linkedSuppliers: number
  duePayments: number
}

/* ── Sparkline SVG ──────────────────────────────────────────────────── */
function Spark({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const h = 28, w = 120
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M${pts.join(' L')} L${w},${h} L0,${h} Z`}
        fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, '')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Area chart SVG (spend trend) ─────────────────────────────────── */
function AreaChart({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const h = 120, w = 500
  const min = 0, max = Math.max(...data) * 1.15
  const range = max - min
  const xs = data.map((_, i) => (i / (data.length - 1)) * w)
  const ys = data.map(v => h - ((v - min) / range) * (h - 16) - 8)
  const pts = xs.map((x, i) => `${x},${ys[i]}`)
  const months = ['Nov','Dec','Jan','Feb','Mar','Apr']
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: h + 20 }}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1="0" x2={w} y1={h - p * (h - 16) - 8} y2={h - p * (h - 16) - 8}
          stroke="var(--line-2)" strokeWidth="1"/>
      ))}
      {/* Area fill */}
      <path d={`M${pts.join(' L')} L${w},${h} L0,${h} Z`} fill="url(#area-grad)"/>
      {/* Line */}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Last point dot */}
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={color} stroke="#fff" strokeWidth="2"/>
      {/* X labels */}
      {months.map((m, i) => (
        <text key={i} x={xs[i]} y={h + 16} textAnchor="middle"
          style={{ fontSize: 10.5, fill: 'var(--ink-4)', fontFamily: 'var(--font-sans)' }}>{m}</text>
      ))}
    </svg>
  )
}

/* ── Supplier mark ─────────────────────────────────────────────────── */
const COLORS = ['c-1','c-2','c-3','c-4','c-5'] as const
function supplierMark(name: string) {
  const idx = name.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 5
  return COLORS[idx]
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')
}

/* ── Status badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Out for delivery': 'warn',
    'Dispatched': 'info',
    'Scheduled': 'neutral',
    'Delayed': 'danger',
    'Delivered': 'ok',
    'In transit': 'info',
    'Payment pending': 'warn',
    'Preparing': 'accent',
    'Cancelled': 'danger',
  }
  const cls = map[status] ?? 'neutral'
  return (
    <span className={`status ${cls}`}>
      <span className="dot"/>
      {status}
    </span>
  )
}

/* ── Skeleton ──────────────────────────────────────────────────────── */
function Sk({ w = '100%', h = 12, r = 4 }: { w?: string | number; h?: number; r?: number }) {
  return <div className="shimmer" style={{ width: w, height: h, borderRadius: r }}/>
}

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KpiCard({
  title, value, unit, sub, trend, trendDir, spark, accentBar, icon, loading,
}: {
  title: string; value: string; unit?: string; sub?: string
  trend?: string; trendDir?: 'up'|'down'; spark?: number[]
  accentBar?: boolean; icon?: React.ReactNode; loading?: boolean
}) {
  return (
    <div className="card kpi-card" style={{
      padding: '20px 22px 22px', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9D2EB'; e.currentTarget.style.boxShadow = 'rgba(43,91,229,0.18) 0 8px 24px -12px' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'var(--shadow-1)' }}
    >
      {accentBar && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }}/>}
      {loading ? (
        <>
          <Sk w="80px" h={11}/> <div style={{height:16}}/>
          <Sk w="100px" h={32}/> <div style={{height:8}}/>
          <Sk w="60px" h={10}/>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '0.005em' }}>{title}</div>
            {icon && (
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
                {icon}
              </div>
            )}
          </div>
          <div style={{ marginTop: 22, fontSize: 34, lineHeight: 1, letterSpacing: '-0.025em', color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {value}
            {unit && <span style={{ fontSize: 17, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '-0.01em' }}>{unit}</span>}
          </div>
          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {trend && (
              <span className={`trend ${trendDir ?? 'flat'}`}>
                {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
              </span>
            )}
            {sub && <span>{sub}</span>}
          </div>
          {spark && (
            <div style={{ marginTop: 14 }}>
              <Spark data={spark} color={trendDir === 'down' ? 'var(--danger)' : 'var(--accent)'}/>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── TODAY'S DELIVERIES data ────────────────────────────────────────── */
const DELIVERIES = [
  { id: 1, supplier: 'Nandini Dairy Kitchen', truck: 'BNG-DL-2412', items: '14 items · dairy, eggs',    eta: '09:40', etaIn: '25 min', status: 'Out for delivery', color: 'c-1' },
  { id: 2, supplier: 'Bloom & Wild Greens',   truck: 'Hassan Hills', items: 'Organic · 8 items · leafy, herbs', eta: '11:15', etaIn: '2h 0m',  status: 'Dispatched',       color: 'c-2' },
  { id: 3, supplier: 'Blue Tokai Roasters',   truck: 'Attibele',     items: '4 items · single-origin bags',    eta: '12:30', etaIn: '3h 15m', status: 'Delayed',          color: 'c-3' },
  { id: 4, supplier: 'Hearth & Stone Bakery', truck: 'Indiranagar',  items: '22 items · viennoiserie',         eta: '14:00', etaIn: '4h 45m', status: 'Scheduled',        color: 'c-4' },
  { id: 5, supplier: 'Malabar Fruit Co.',     truck: 'Cold chain · Palakkad', items: '11 items · seasonal fruit', eta: '16:20', etaIn: '7h 05m', status: 'Scheduled', color: 'c-5' },
]

/* ── RECENT ORDERS data ─────────────────────────────────────────────── */
const RECENT_ORDERS = [
  { supplier: 'Nandini Dairy Kitchen', category: 'Dairy · Daily', items: 46, amount: '₹1,84,220', orders: [
    { ref: 'ORD-20412', desc: 'Buffalo milk, A2 cow milk, paneer', items: 14, amount: '₹68,400', status: 'Delivered' },
    { ref: 'ORD-20408', desc: 'Cream, butter, curd',               items: 12, amount: '₹52,120', status: 'In transit' },
    { ref: 'ORD-20401', desc: 'Eggs (tray × 24)',                  items: 20, amount: '₹63,700', status: 'Delivered' },
  ]},
  { supplier: 'Blue Tokai Roasters', category: 'Coffee · Weekly', items: 18, amount: '₹96,500', orders: [
    { ref: 'ORD-20403', desc: 'Attikan Estate · 5kg × 6',          items: 6,  amount: '₹42,800', status: 'Payment pending' },
    { ref: 'ORD-20396', desc: 'Vienna blend, cold brew concentrate',items: 12, amount: '₹53,700', status: 'Delivered' },
  ]},
  { supplier: 'Hearth & Stone Bakery', category: 'Bakery · Daily', items: 64, amount: '₹41,960', orders: [
    { ref: 'ORD-20399', desc: 'Sourdough, brioche, croissants',     items: 32, amount: '₹22,140', status: 'Preparing' },
    { ref: 'ORD-20392', desc: 'Baguette, focaccia, pain de mie',    items: 32, amount: '₹19,820', status: 'Delivered' },
  ]},
]

/* ── RUNNING LOW data ───────────────────────────────────────────────── */
const LOW_STOCK = [
  { name: 'Arabica blend · Attikan', detail: '2.4 kg · threshold 6 kg', fill: 40, status: 'Reorder today', statusCls: 'danger' },
  { name: 'Whole milk · Nandini',    detail: '18 L · threshold 30 L',   fill: 60, status: 'Low · 2 days',  statusCls: 'warn' },
  { name: 'Cream cheese',            detail: '1.8 kg · threshold 3 kg', fill: 60, status: 'Low · 3 days',  statusCls: 'warn' },
  { name: 'Vanilla syrup · Monin',   detail: '4 lit · threshold 6 lit', fill: 67, status: 'Low · 4 days',  statusCls: 'warn' },
  { name: 'Paper cups 12oz',         detail: '240 pc · threshold 500 pc', fill: 48, status: 'Reorder today', statusCls: 'danger' },
]

/* ── RECURRING PRE-ORDERS ───────────────────────────────────────────── */
const PREORDERS = [
  { month: 'APR', day: '22', title: 'Daily dairy basket',   sub: 'Nandini · 06:30',  price: '₹3,240/day' },
  { month: 'APR', day: '23', title: 'Weekly coffee restock',sub: 'Blue Tokai · Wed', price: '₹18,400/wk' },
  { month: 'APR', day: '25', title: 'Bakery morning box',   sub: 'Hearth & Stone · Fri', price: '₹2,980/day' },
  { month: 'APR', day: '28', title: 'Fortnight produce run',sub: 'Bloom & Wild · Mon', price: '₹11,600' },
]

/* ══════════════════════════════════════════════════════════════════════
   OVERVIEW PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function OverviewPage() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('Rohan')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gradient365_user')
      if (raw) {
        const u = JSON.parse(raw)
        const name = (u.name || u.businessName || '').split(' ')[0]
        if (name) setFirstName(name)
      }
    } catch {}
    api.get<Stats>('/orders/stats').then(d => {
      setStats(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  /* Derived values */
  const monthlySpend  = stats ? `₹${(stats.totalOrders * 9800).toLocaleString('en-IN')}` : '₹4,82,340'
  const activeOrders  = stats?.pendingOrders ?? 27
  const lowStockCount = 12
  const pendingInv    = stats?.duePayments ?? 3

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(244,246,251,0.85)',
        backdropFilter: 'saturate(160%) blur(12px)',
        WebkitBackdropFilter: 'saturate(160%) blur(12px)',
        borderBottom: '1px solid var(--line)',
        marginBottom: 4,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 36, padding: '0 12px', minWidth: 260,
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 999, color: 'var(--ink-3)', fontSize: 13.5,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search suppliers, SKUs, invoices…" style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 5, background: 'var(--surface-warm)', letterSpacing: '0.02em', flexShrink: 0 }}>⌘K</span>
          </div>
          <div style={{ flex: 1 }}/>
          {/* Help */}
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          {/* Notifications */}
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', cursor: 'pointer', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#E0524A', boxShadow: '0 0 0 2px var(--bg)' }}/>
          </button>
          {/* Urgent Search CTA */}
          <Link href="/urgent-search" className="btn-primary" style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, borderRadius: 999, textDecoration: 'none', color: '#fff', background: 'linear-gradient(180deg,#3E6CF0 0%,var(--accent) 100%)', boxShadow: 'rgba(255,255,255,0.25) 0 1px 0 inset,rgba(43,91,229,0.4) 0 4px 12px -2px' }}>
            Urgent Search
          </Link>
        </div>
      </header>

      {/* ── Shell ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 56px' }}>

        {/* Greeting */}
        <div style={{ padding: '36px 0 28px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 10 }}>
              Wednesday Operations · 06:42
            </div>
            <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.022em', fontWeight: 500, color: 'var(--ink)' }}>
              Good morning, {firstName}{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 40, letterSpacing: '-0.01em' }}>
                — three deliveries arriving before the first pull.
              </em>
            </h1>
            <p style={{ marginTop: 10, fontSize: 14.5, color: 'var(--ink-3)', maxWidth: 640, lineHeight: 1.55 }}>
              You have <b style={{ color: 'var(--ink)', fontWeight: 500 }}>5 inbound shipments</b>, <b style={{ color: 'var(--ink)', fontWeight: 500 }}>2 invoices</b> awaiting approval, and coffee stock is trending below threshold at the <b style={{ color: 'var(--ink)', fontWeight: 500 }}>Indiranagar</b> outlet. Service opens in 48 minutes.
            </p>
          </div>
          {/* Context chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span className="chip">
              <span className="pulse-dot"/>
              All 3 outlets online
            </span>
            <span className="chip accent">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
              Live ops · 10:30 IST
            </span>
            <span className="chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Saturday, 2 May
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          <KpiCard
            title="Monthly spend"
            value={monthlySpend}
            unit="/ ₹6,00…"
            trend="8.4%"
            trendDir="up"
            sub="vs last month · 20 days in"
            spark={[320,290,310,280,340,350,380,360,400,420,390,430,460,420,480,510,490,520,560,590]}
            accentBar
            loading={loading}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>}
          />
          <KpiCard
            title="Active orders"
            value={String(activeOrders)}
            unit=" open"
            sub={`3 new · across 9 suppliers`}
            spark={[5,8,7,9,6,10,8,11,9,12,10,13,11,14,12,15,13,16,14,15]}
            loading={loading}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>}
          />
          <KpiCard
            title="Low-stock alerts"
            value={String(lowStockCount)}
            unit=" SKUs"
            trend="+3"
            trendDir="down"
            sub="since yesterday · 2 critical"
            spark={[2,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10,9,11,10,12]}
            loading={loading}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--warn)'}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          />
          <KpiCard
            title="Pending invoices"
            value={`₹2,14,560`}
            unit=" across 6"
            trend="2 due"
            trendDir="down"
            sub="this week"
            spark={[80,75,90,85,95,100,110,105,120,115,130,125,140,135,150,145,160,155,170,165]}
            loading={loading}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
          />
        </div>

        {/* Main two-col row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>

          {/* Today's deliveries */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-2)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Today&apos;s deliveries</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>5 shipments · 59 items · Wed 21 Apr</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="tb-btn" style={{ height: 28, fontSize: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>
                <button className="tb-btn" style={{ height: 28, fontSize: 12 }}>Map view</button>
              </div>
            </div>
            {/* Filter pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 22px', borderBottom: '1px solid var(--line-2)' }}>
              {[['All', '5', true], ['Out for delivery', '1', false], ['Dispatched', '1', false], ['Scheduled', '2', false], ['Delayed', '1', false]].map(([label, count, active]) => (
                <button key={String(label)} className={`filter-pill${active ? ' active' : ''}`}>
                  {label} <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.7 }}>{count}</span>
                </button>
              ))}
            </div>
            {/* Delivery rows */}
            {DELIVERIES.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '36px 1.6fr 1fr 1fr auto', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: '1px solid var(--line-2)', transition: 'background 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className={`supplier-mark ${d.color}`} style={{ width: 36, height: 36 }}>
                  {d.supplier.split(' ').slice(0,2).map(w=>w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{d.supplier}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{d.truck} · {d.items}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                  {d.eta} <small style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 4 }}>in {d.etaIn}</small>
                </div>
                <StatusBadge status={d.status}/>
                <button style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)'; e.currentTarget.style.color = 'var(--ink)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-4)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Recent orders by supplier */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-2)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Recent orders by supplier</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Last 7 days · 3 suppliers · ₹3,22,680</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="tb-btn" style={{ height: 28, fontSize: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <Link href="/orders" className="tb-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, textDecoration: 'none', height: 28 }}>
                  View all →
                </Link>
              </div>
            </div>
            {RECENT_ORDERS.map(group => (
              <div key={group.supplier} style={{ padding: '16px 22px 6px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10 }}>
                  <div className={`supplier-mark ${supplierMark(group.supplier)}`} style={{ width: 36, height: 36 }}>
                    {initials(group.supplier)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em' }}>{group.supplier}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{group.category}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 14 }}>
                    <span><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{group.items}</b> items</span>
                    <span><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{group.amount}</b></span>
                  </div>
                </div>
                {group.orders.map((o, i) => (
                  <div key={o.ref} style={{ display: 'grid', gridTemplateColumns: '22px 1fr auto auto auto', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i === 0 ? 'none' : '1px dashed var(--line-2)' }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>0{i+1}</span>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      {o.desc} <small style={{ color: 'var(--ink-4)', marginLeft: 6 }}>{o.ref}</small>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{o.items} items</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{o.amount}</span>
                    <StatusBadge status={o.status}/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Triple-col row: Spend trend + Running low + Recurring pre-orders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.95fr 0.9fr', gap: 20, marginTop: 20 }}>

          {/* Spend trend */}
          <div className="card" style={{ padding: '22px 24px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>Spend trend</div>
                <div style={{ fontSize: 30, letterSpacing: '-0.025em', fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  ₹13,47,000
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 400 }}>▲ 20.1%</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>vs. previous period</div>
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--surface-warm)', border: '1px solid var(--line)', padding: 3, borderRadius: 10 }}>
                {['7D','30D','90D'].map((seg, i) => (
                  <button key={seg} style={{ height: 26, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: i === 1 ? 'var(--surface)' : 'transparent', color: i === 1 ? 'var(--ink)' : 'var(--ink-3)', boxShadow: i === 1 ? 'rgba(28,27,25,0.08) 0 1px 2px' : 'none', cursor: 'pointer' }}>
                    {seg}
                  </button>
                ))}
              </div>
            </div>
            <AreaChart data={[85, 92, 88, 96, 102, 115, 108, 122, 130, 128, 140, 145, 138, 150, 160, 155, 168, 175, 180, 185, 192, 190, 200, 210]} color="var(--accent)"/>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', display: 'inline-block' }}/>
                This period
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--line-2)', display: 'inline-block' }}/>
                Previous
              </span>
            </div>
          </div>

          {/* Running low */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-2)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Running low</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>5 of 17 SKUs · 2 critical</div>
              </div>
              <Link href="/inventory" className="tb-btn" style={{ height: 28, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                Inventory →
              </Link>
            </div>
            {LOW_STOCK.map(item => (
              <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', padding: '14px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{item.name}</div>
                <span className={`status ${item.statusCls}`} style={{ justifySelf: 'end', alignSelf: 'start' }}>
                  <span className="dot"/>
                  {item.status}
                </span>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{item.detail}</div>
                <div/> {/* grid filler */}
                {/* stock bar */}
                <div style={{ gridColumn: '1 / -1', marginTop: 10, position: 'relative', height: 6, background: 'var(--line-2)', borderRadius: 3, overflow: 'visible' }}>
                  <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${item.fill}%`, height: '100%', borderRadius: 3, background: item.fill < 50 ? 'var(--danger)' : 'var(--warn)' }}/>
                  <div style={{ position: 'absolute', top: -4, bottom: -4, left: '60%', width: 1.5, background: 'var(--ink-3)', opacity: 0.6 }}>
                    <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 9.5, color: 'var(--ink-4)', whiteSpace: 'nowrap', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>threshold</span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 22px' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, height: 34 }}>
                Reorder all
              </button>
            </div>
          </div>

          {/* Recurring pre-orders + Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-2)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Recurring pre-orders</h3>
                <button className="tb-btn" style={{ height: 28, fontSize: 12 }}>Manage</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '8px 22px 4px' }}>4 active · auto-billed</div>
              {PREORDERS.map(po => (
                <div key={po.title} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid var(--line-2)' }}>
                  <div style={{ width: 32, height: 36, borderRadius: 7, border: '1px solid var(--line)', background: 'var(--surface-warm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase' }}>{po.month}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginTop: -1 }}>{po.day}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{po.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{po.sub}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>{po.price}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Quick actions</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Operational shortcuts</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 16 }}>
                {[
                  { title: 'Urgent Search', sub: 'Find a replacement supplier in minutes', primary: true,
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
                  { title: 'Reorder Previous Basket', sub: 'Nandini · yesterday · 14 items', primary: false,
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg> },
                  { title: 'Start Negotiation', sub: '3 suppliers due for renewal', primary: false,
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
                  { title: 'View Billing', sub: '₹2,14,560 pending · 6 invoices', primary: false,
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
                ].map(qa => (
                  <button key={qa.title} style={{
                    padding: 14, borderRadius: 10, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 92,
                    background: qa.primary ? 'linear-gradient(180deg,#3E6CF0 0%,var(--accent) 100%)' : 'var(--surface-warm)',
                    border: `1px solid ${qa.primary ? 'var(--accent)' : 'var(--line)'}`,
                    color: qa.primary ? '#fff' : 'inherit',
                    cursor: 'pointer',
                    transition: '0.18s',
                    boxShadow: qa.primary ? 'rgba(43,91,229,0.4) 0 6px 18px -6px' : 'none',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; if (!qa.primary) { e.currentTarget.style.borderColor = '#C9D2EB'; e.currentTarget.style.boxShadow = 'rgba(43,91,229,0.2) 0 8px 24px -12px' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if (!qa.primary) { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none' } }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: qa.primary ? 'rgba(255,255,255,0.18)' : 'var(--surface)', border: `1px solid ${qa.primary ? 'rgba(255,255,255,0.25)' : 'var(--line)'}`, color: qa.primary ? '#fff' : 'var(--ink-2)' }}>
                      {qa.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: qa.primary ? '#fff' : 'var(--ink)', letterSpacing: '-0.005em' }}>{qa.title}</div>
                    <div style={{ fontSize: 11.5, color: qa.primary ? 'rgba(255,255,255,0.82)' : 'var(--ink-3)', lineHeight: 1.4 }}>{qa.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, padding: '16px 4px', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-4)', fontSize: 11.5, borderTop: '1px solid var(--line)' }}>
          <span>Gradient Cafe Portal · v2.4</span>
          <span>Bengaluru · 3 outlets · synced just now</span>
        </div>
      </div>
    </div>
  )
}
