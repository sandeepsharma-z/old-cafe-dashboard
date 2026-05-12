'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────────────────
interface IntelligenceData {
  totalSpend: number
  spendOverTime: Array<{ week: string; weeklySpend: string; orderCount: string }>
  topCategories: Array<{ category: string; totalSpend: string; totalQuantity: string }>
  topSuppliers: Array<{ supplierName: string; supplierId: string; orderCount: string; totalSpend: string }>
  avgOrderValue: number
}

interface StatsData {
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  linkedSuppliers: number
  statusBreakdown: Array<{ status: string; count: number }>
}

// ── Constants ──────────────────────────────────────────────────────────────
const PRIMARY = '#EA580C'
const CARD_STYLE: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '10px',
  border: '1px solid var(--border)',
}

const CATEGORY_COLORS: Record<string, string> = {
  Grains: '#EA580C',
  Dairy: '#D97706',
  Produce: '#059669',
  'Coffee Beans': '#7C3AED',
  Other: '#94a3b8',
}

function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? CATEGORY_COLORS['Other']
}

// ── SVG Path builder ───────────────────────────────────────────────────────
function buildSvgPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cp1x = prev.x + (curr.x - prev.x) / 3
    const cp1y = prev.y
    const cp2x = curr.x - (curr.x - prev.x) / 3
    const cp2y = curr.y
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
  }
  return d
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatINR(val: number): string {
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatWeekLabel(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()
}

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  badge,
  badgeColor,
  icon,
  accent,
}: {
  label: string
  value: string
  sub: string
  badge?: string
  badgeColor?: string
  icon?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div style={{
      ...CARD_STYLE,
      flex: '1 1 200px',
      minWidth: 0,
      padding: '20px 24px',
      background: accent ? PRIMARY : '#ffffff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: accent ? 'rgba(255,255,255,0.7)' : '#94a3b8',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize: '10px', fontWeight: 700,
            background: badgeColor ?? 'rgba(255,255,255,0.2)',
            color: accent ? '#fff' : PRIMARY,
            padding: '2px 8px', borderRadius: '20px',
            letterSpacing: '0.04em',
          }}>
            {badge}
          </span>
        )}
        {icon && !badge && (
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(22,47,36,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 300, letterSpacing: '-0.03em',
        color: accent ? '#fff' : '#1e293b',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: accent ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {sub}
      </div>
    </div>
  )
}

function SpendTrendsChart({ spendOverTime }: { spendOverTime: IntelligenceData['spendOverTime'] }) {
  const W = 800
  const H = 200
  const PAD_TOP = 40

  if (!spendOverTime || spendOverTime.length === 0) {
    return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No spend data available</div>
  }

  const values = spendOverTime.map(p => parseFloat(p.weeklySpend))
  const maxSpend = Math.max(...values, 1)

  const points = spendOverTime.map((p, i) => ({
    x: spendOverTime.length === 1 ? W / 2 : (i / (spendOverTime.length - 1)) * W,
    y: H - PAD_TOP - (parseFloat(p.weeklySpend) / maxSpend) * (H - PAD_TOP),
  }))

  const linePath = buildSvgPath(points)
  const firstX = points[0].x
  const lastX = points[points.length - 1].x
  const areaPath = linePath + ` L ${lastX} ${H} L ${firstX} ${H} Z`

  // reference lines at 25% and 75% of max
  const ref1Y = H - PAD_TOP - 0.25 * (H - PAD_TOP)
  const ref2Y = H - PAD_TOP - 0.75 * (H - PAD_TOP)
  const ref1Val = Math.round(maxSpend * 0.25)
  const ref2Val = Math.round(maxSpend * 0.75)

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '180px', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.15" />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Reference lines */}
        <line x1={0} y1={ref1Y} x2={W} y2={ref1Y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={0} y1={ref2Y} x2={W} y2={ref2Y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <text x={4} y={ref1Y - 4} fill="#cbd5e1" fontSize="20" fontFamily="sans-serif">
          ₹{(ref1Val / 1000).toFixed(0)}k
        </text>
        <text x={4} y={ref2Y - 4} fill="#cbd5e1" fontSize="20" fontFamily="sans-serif">
          ₹{(ref2Val / 1000).toFixed(0)}k
        </text>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={PRIMARY} strokeWidth="2" />
        ))}
      </svg>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingRight: '2px' }}>
        {spendOverTime.map((p, i) => (
          <span key={i} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>
            {formatWeekLabel(p.week)}
          </span>
        ))}
      </div>
    </div>
  )
}

function CategoryBars({ topCategories }: { topCategories: IntelligenceData['topCategories'] }) {
  const top4 = topCategories.slice(0, 4)
  const totalSpend = top4.reduce((a, b) => a + parseFloat(b.totalSpend), 0) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {top4.map((cat) => {
        const spend = parseFloat(cat.totalSpend)
        const pct = Math.round((spend / totalSpend) * 100)
        const color = getCategoryColor(cat.category)
        return (
          <div key={cat.category}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{cat.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{formatINR(spend)}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
              </div>
            </div>
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TopSuppliers({ topSuppliers }: { topSuppliers: IntelligenceData['topSuppliers'] }) {
  const top4 = topSuppliers.slice(0, 4)
  const maxSpend = Math.max(...top4.map(s => parseFloat(s.totalSpend)), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {top4.map((sup, i) => {
        const spend = parseFloat(sup.totalSpend)
        const pct = Math.round((spend / maxSpend) * 100)
        return (
          <div key={sup.supplierId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: i === 0 ? PRIMARY : '#f1f5f9',
                  color: i === 0 ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{sup.supplierName}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{formatINR(spend)}</span>
            </div>
            <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: i === 0 ? PRIMARY : '#cbd5e1',
                borderRadius: '6px', transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InsightCard({
  type,
  title,
  body,
  iconBg,
  icon,
}: {
  type: string
  title: string
  body: string
  iconBg: string
  icon: React.ReactNode
}) {
  return (
    <div style={{ ...CARD_STYLE, padding: '20px 22px', flex: '1 1 260px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{type}</span>
      </div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px', lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function SkeletonBlock({ w, h, radius = 8 }: { w: string; h: number; radius?: number }) {
  return <div style={{ width: w, height: `${h}px`, background: '#f1f5f9', borderRadius: `${radius}px` }} />
}

function LoadingState() {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBlock w="200px" h={28} />
          <SkeletonBlock w="300px" h={14} />
        </div>
        <SkeletonBlock w="320px" h={36} radius={12} />
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: '1 1 200px', height: '110px', background: '#f1f5f9', borderRadius: '16px' }} />)}
      </div>
      <div style={{ height: '260px', background: '#f1f5f9', borderRadius: '16px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: '240px', background: '#f1f5f9', borderRadius: '16px' }} />)}
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        {[1, 2, 3].map(i => <div key={i} style={{ flex: '1 1 260px', height: '140px', background: '#f1f5f9', borderRadius: '16px' }} />)}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
type TimeRange = '7d' | '30d' | 'quarter' | 'custom'

export default function AnalyticsPage() {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  useEffect(() => {
    Promise.all([
      api.get<{ data: IntelligenceData }>('/api/intelligence/cafe/overview'),
      api.get<StatsData>('/api/orders/stats'),
    ])
      .then(([intel, statsRes]) => {
        setData(intel.data)
        setStats(statsRes)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  // ── Derived values ─────────────────────────────────────────────────────
  const totalOrders = stats?.statusBreakdown?.reduce((a, b) => a + b.count, 0) ?? 0
  const completedOrders =
    stats?.statusBreakdown
      ?.filter(s => ['delivered', 'closed'].includes(s.status))
      ?.reduce((a, b) => a + b.count, 0) ?? 0
  const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 98

  const topCat = data?.topCategories?.[0]
  const totalCatSpend = data?.topCategories?.reduce((a, b) => a + parseFloat(b.totalSpend), 0) || 1
  const topCatPct = topCat ? Math.round((parseFloat(topCat.totalSpend) / totalCatSpend) * 100) : 0

  const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    quarter: 'This Quarter',
    custom: 'Custom',
  }

  return (
    <div style={{ maxWidth: '1200px', paddingBottom: '40px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2px' }}>Analytics &amp; Insights</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Track your spend, supplier performance, and operational efficiency.</p>
        </div>

        {/* Time range toggle */}
        <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', border: '1px solid var(--border)', padding: '3px', gap: '2px' }}>
          {(['7d', '30d', 'quarter', 'custom'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                background: timeRange === r ? PRIMARY : 'transparent',
                color: timeRange === r ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {TIME_RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {error && !data ? (
        <div style={{ ...CARD_STYLE, padding: '64px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>📊</div>
          <p style={{ color: '#475569', fontWeight: 500, marginBottom: '6px', margin: '0 0 6px' }}>
            Could not load analytics
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Analytics will appear once you have order history.
          </p>
        </div>
      ) : (
        <>
          {/* ── KPI Row ── */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>

            {/* 1 — Total Spend */}
            <KpiCard
              label="Total Spend"
              value={data ? formatINR(data.totalSpend) : '—'}
              sub="vs previous 30 days"
              badge="+12%"
              accent
            />

            {/* 2 — Avg Order Value */}
            <KpiCard
              label="Avg. Order Value"
              value={data ? formatINR(data.avgOrderValue) : '—'}
              sub="Steady trend"
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />

            {/* 3 — Top Category */}
            <KpiCard
              label="Top Category"
              value={topCat?.category ?? '—'}
              sub={topCat ? `${topCatPct}% of total volume` : 'No data'}
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />

            {/* 4 — Fulfillment Rate */}
            <KpiCard
              label="Fulfillment Rate"
              value={`${fulfillmentRate}%`}
              sub="Top performance"
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* ── Spend Trends — full width ── */}
          <div style={{ ...CARD_STYLE, padding: '24px 28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>Spend Trends</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Weekly expenditure distribution over time</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIMARY }} />
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Current Period</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Previous Period</span>
                </div>
              </div>
            </div>
            <SpendTrendsChart spendOverTime={data?.spendOverTime ?? []} />
          </div>

          {/* ── Bottom Row — 3 cols ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>

            {/* Col 1 — Spend by Category */}
            <div style={{ ...CARD_STYLE, padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Spend by Category</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Share of total procurement spend</div>
              {data?.topCategories?.length ? (
                <CategoryBars topCategories={data.topCategories} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', paddingTop: '24px' }}>No data</div>
              )}
            </div>

            {/* Col 2 — Top Suppliers */}
            <div style={{ ...CARD_STYLE, padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Top Suppliers by Value</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Ranked by total spend this period</div>
              {data?.topSuppliers?.length ? (
                <TopSuppliers topSuppliers={data.topSuppliers} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', paddingTop: '24px' }}>No data</div>
              )}
            </div>

            {/* Col 3 — Inventory Efficiency */}
            <div style={{ ...CARD_STYLE, padding: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Inventory Efficiency</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Stock-to-Sales Ratio</div>

              {/* Big number */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '52px', fontWeight: 200, letterSpacing: '-0.04em', color: '#1e293b', lineHeight: 1 }}>84%</div>
                <div style={{
                  display: 'inline-block', marginTop: '10px',
                  background: '#dcfce7', color: '#16a34a',
                  fontSize: '11px', fontWeight: 700,
                  padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.06em',
                }}>
                  EXCELLENT
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>4.2x</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>Stock Turn</div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>1.4%</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>Wastage</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Insights Row ── */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <InsightCard
              type="Cost Optimization"
              title="Bulk dairy purchasing opportunity"
              body="Purchasing Dairy in bulk during Quarter starts could save an estimated ₹12,400 monthly based on seasonal trends."
              iconBg="rgba(22,47,36,0.08)"
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <InsightCard
              type="Inventory Risk"
              title="Excess grain buffer detected"
              body="Grain stock levels are 15% above optimal buffer. Consider reducing the next order for 'Basmati Rice' by 20 units."
              iconBg="rgba(245,158,11,0.1)"
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C9963A" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <InsightCard
              type="Supplier Reliability"
              title="FreshRoots Farms — preferred status"
              body="FreshRoots Farms maintains 100% on-time delivery for 4 consecutive months. Preferred supplier status recommended."
              iconBg="rgba(5,150,105,0.08)"
              icon={
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
          </div>
        </>
      )}
    </div>
  )
}
