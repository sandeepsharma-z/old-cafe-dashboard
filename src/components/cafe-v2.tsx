'use client'

import Link from 'next/link'

type IconName =
  | 'search'
  | 'help'
  | 'bell'
  | 'plus'
  | 'download'
  | 'filter'
  | 'clock'
  | 'file'
  | 'box'
  | 'cart'
  | 'chart'
  | 'warning'
  | 'check'
  | 'refresh'
  | 'more'
  | 'calendar'

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
    box: <><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
    cart: <><path d="M6 6h15l-1.5 8h-12L6 3H3" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    chart: <><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></>,
    warning: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    check: <path d="m20 6-11 11-5-5" />,
    refresh: <><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
    more: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function TopBar({ searchPlaceholder = 'Search suppliers, SKUs, invoices...' }: { searchPlaceholder?: string }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(244,246,251,0.85)',
      backdropFilter: 'saturate(160%) blur(12px)',
      WebkitBackdropFilter: 'saturate(160%) blur(12px)',
      borderBottom: '1px solid var(--line)',
      marginBottom: 4,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 36,
          padding: '0 12px',
          minWidth: 260,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 999,
          color: 'var(--ink-3)',
          fontSize: 13.5,
        }}>
          <Icon name="search" size={14} />
          <input
            placeholder={searchPlaceholder}
            style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%' }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            color: 'var(--ink-4)',
            padding: '2px 6px',
            border: '1px solid var(--line)',
            borderRadius: 5,
            background: 'var(--surface-warm)',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}>Ctrl K</span>
        </label>
        <div style={{ flex: 1 }} />
        <button className="icon-button" aria-label="Help">
          <Icon name="help" size={16} />
        </button>
        <button className="icon-button" aria-label="Notifications" style={{ position: 'relative' }}>
          <Icon name="bell" size={16} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#E0524A', boxShadow: '0 0 0 2px var(--bg)' }} />
        </button>
        <Link href="/urgent-search" className="btn-primary" style={{ textDecoration: 'none' }}>
          Urgent Search
        </Link>
      </div>
    </header>
  )
}

export function PageShell({ children, footerLeft, footerRight }: { children: React.ReactNode; footerLeft: string; footerRight: string }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 56px' }}>
        {children}
        <div style={{ marginTop: 32, padding: '16px 4px', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-4)', fontSize: 11.5, borderTop: '1px solid var(--line)' }}>
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      </main>
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  em,
  after,
  body,
  action,
}: {
  eyebrow: string
  title: string
  em: string
  after?: string
  body: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section style={{ padding: '36px 0 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</div>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.022em', fontWeight: 500, color: 'var(--ink)' }}>
          {title}{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 38, letterSpacing: '-0.01em' }}>
            {em}
          </em>
          {after ? ` ${after}` : ''}
        </h1>
        <p style={{ marginTop: 10, fontSize: 14.5, color: 'var(--ink-3)', maxWidth: 650, lineHeight: 1.55 }}>
          {body}
        </p>
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexShrink: 0 }}>{action}</div>}
    </section>
  )
}

export function StatusBadge({ tone, children }: { tone: 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent'; children: React.ReactNode }) {
  return (
    <span className={`status ${tone}`}>
      <span className="dot" />
      {children}
    </span>
  )
}

export function SupplierMark({ name, color = 'c-1', size = 36 }: { name: string; color?: string; size?: number }) {
  const text = name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]?.toUpperCase()).join('')
  return (
    <div className={`supplier-mark ${color}`} style={{ width: size, height: size, borderRadius: Math.max(8, Math.round(size / 4)), fontSize: size > 38 ? 13 : 11 }}>
      {text}
    </div>
  )
}

export function StatStrip({ stats }: { stats: Array<{ key: string; value: React.ReactNode; sub: React.ReactNode }> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length},1fr)`, border: '1px solid var(--line)', borderRadius: 14, background: 'var(--surface)', overflow: 'hidden', marginBottom: 20 }}>
      {stats.map((stat, index) => (
        <div key={stat.key} style={{ padding: '16px 20px', borderRight: index < stats.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '0.03em' }}>{stat.key}</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--ink)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {stat.value}
            <small style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400, letterSpacing: 0 }}>{stat.sub}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

export function KpiCard({
  title,
  value,
  unit,
  sub,
  trend,
  tone = 'accent',
  icon,
  accentBar,
}: {
  title: string
  value: React.ReactNode
  unit?: string
  sub?: string
  trend?: string
  tone?: 'accent' | 'ok' | 'warn' | 'danger'
  icon?: React.ReactNode
  accentBar?: boolean
}) {
  const trendClass = tone === 'danger' ? 'down' : tone === 'ok' ? 'up' : 'flat'
  return (
    <div className="card kpi-card" style={{ padding: '20px 22px 22px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}>
      {accentBar && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '0.005em' }}>{title}</div>
        {icon && (
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone === 'warn' ? 'var(--warn)' : tone === 'danger' ? 'var(--danger)' : tone === 'ok' ? 'var(--ok)' : 'var(--ink-3)' }}>
            {icon}
          </div>
        )}
      </div>
      <div className="tnum" style={{ marginTop: 22, fontSize: 34, lineHeight: 1, letterSpacing: '-0.025em', color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {value}
        {unit && <span style={{ fontSize: 17, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '-0.01em' }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend && <span className={`trend ${trendClass}`}>{trend}</span>}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  )
}

export function MiniBars({ values, color = 'var(--accent)' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 5, height: 86 }}>
      {values.map((value, index) => (
        <span key={`${value}-${index}`} style={{
          flex: 1,
          height: `${Math.max(12, (value / max) * 86)}px`,
          borderRadius: '6px 6px 2px 2px',
          background: index === values.length - 1 ? color : 'var(--line-2)',
          transition: 'height 0.6s linear',
        }} />
      ))}
    </div>
  )
}

export function Sk({ w = '100%', h = 12 }: { w?: string | number; h?: number }) {
  return <div className="shimmer" style={{ width: w, height: h, borderRadius: 4, display: 'inline-block' }} />
}
