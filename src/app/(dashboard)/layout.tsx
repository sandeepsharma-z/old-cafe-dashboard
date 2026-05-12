'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  accountId: string
  businessName?: string
  name?: string
  role: string
}

/* ── SVG icons (Phosphor-style, consistent 20×20 stroke-width 1.5) ────── */
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    orders:   <><path d="M4 7h16M4 12h10M4 17h7"/><rect x="2" y="3" width="20" height="18" rx="2"/></>,
    suppliers:<><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></>,
    inventory:<><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></>,
    billing:  <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    reports:  <><path d="M18 20V10M12 20V4M6 20v-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    chevron:  <><polyline points="9 18 15 12 9 6"/></>,
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    more:     <><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      {paths[name]}
    </svg>
  )
}

const NAV_ITEMS = [
  { label: 'Overview',  icon: 'overview',  href: '/dashboard' },
  { label: 'Orders',    icon: 'orders',    href: '/orders',   badge: true },
  { label: 'Suppliers', icon: 'suppliers', href: '/suppliers' },
  { label: 'Inventory', icon: 'inventory', href: '/inventory' },
  { label: 'Billing',   icon: 'billing',   href: '/billing' },
  { label: 'Reports',   icon: 'reports',   href: '/reports' },
]

const OUTLETS = [
  { label: 'Indiranagar', count: 12, color: 'c1' },
  { label: 'Koramangala', count: 8,  color: 'c2' },
  { label: 'HSR Layout',  count: 5,  color: 'c3' },
]

const DOT_COLORS: Record<string, string> = {
  c1: '#2B5BE5',
  c2: '#1E8F5A',
  c3: '#B47A1A',
}

const MOBILE_NAV = [
  { label: 'Overview',  icon: 'overview',  href: '/dashboard' },
  { label: 'Orders',    icon: 'orders',    href: '/orders' },
  { label: 'Suppliers', icon: 'suppliers', href: '/suppliers' },
  { label: 'Billing',   icon: 'billing',   href: '/billing' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser]         = useState<User | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const raw = localStorage.getItem('gradient365_user')
    if (!raw) {
      setUser({
        accountId: 'local',
        businessName: 'Cafe Dashboard',
        name: 'Cafe Dashboard',
        role: 'cafe',
      })
      return
    }
    try {
      setUser(JSON.parse(raw))
    } catch {
      setUser({
        accountId: 'local',
        businessName: 'Cafe Dashboard',
        name: 'Cafe Dashboard',
        role: 'cafe',
      })
    }
  }, [])

  useEffect(() => {
    function syncCart() {
      try {
        const cart  = JSON.parse(localStorage.getItem('gradient365_cart') || '{}')
        const total = Object.values(cart as Record<string, number>).reduce((s: number, v) => s + (v as number), 0)
        setCartCount(total)
      } catch { setCartCount(0) }
    }
    syncCart()
    window.addEventListener('storage', syncCart)
    return () => window.removeEventListener('storage', syncCart)
  }, [])

  const initials    = (user?.businessName ?? user?.name ?? 'C').slice(0, 2).toUpperCase()
  const displayName = user?.businessName ?? user?.name ?? '—'

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="desktop-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 248, background: '#fff',
        borderRight: '1px solid var(--line)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 14px 14px', overflowY: 'auto' }}>

          {/* Brand */}
          <div style={{ padding: '4px 8px 18px', borderBottom: '1px solid var(--line-2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Brandmark */}
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'radial-gradient(120% 120% at 30% 20%, #6B8FFF 0%, #2B5BE5 55%, #1E45B8 100%)',
              position: 'relative',
              boxShadow: 'rgba(255,255,255,0.3) 0 0 0 0.5px inset, rgba(43,91,229,0.35) 0 2px 6px',
            }}>
              {/* G logo mark */}
              <svg viewBox="0 0 32 32" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <text x="16" y="22" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="inherit">G</text>
              </svg>
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Gradient</div>
              <div className="sb-text" style={{ fontSize: 11.5, color: 'var(--ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>Cafe Portal</div>
            </div>
          </div>

          {/* Workspace nav */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '0 10px 8px' }}>
              Workspace
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {NAV_ITEMS.map(item => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '8px 10px', borderRadius: 9,
                    fontSize: 13.5, fontWeight: 500,
                    color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.12s, color 0.12s',
                    position: 'relative',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-warm)'; e.currentTarget.style.color = 'var(--ink)' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)' } }}
                  >
                    {/* Left accent bar */}
                    {active && (
                      <span style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, background: 'var(--accent)', borderRadius: '0 3px 3px 0' }} />
                    )}
                    <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0 }}>
                      <Icon name={item.icon} size={17} />
                    </span>
                    <span className="side-link-label" style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && cartCount > 0 && (
                      <span className="sb-badge" style={{ fontSize: 11, fontWeight: 500, background: active ? 'var(--accent)' : 'var(--line-2)', color: active ? '#fff' : 'var(--ink-3)', padding: '1px 7px', borderRadius: 999, fontVariantNumeric: 'tabular-nums' }}>
                        {cartCount}
                      </span>
                    )}
                    {item.label === 'Orders' && (
                      <span className="sb-badge" style={{ fontSize: 11, fontWeight: 500, background: active ? 'var(--accent)' : 'var(--line-2)', color: active ? '#fff' : 'var(--ink-3)', padding: '1px 7px', borderRadius: 999 }}>
                        9
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Outlets */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '0 10px 8px' }}>
              Outlets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {OUTLETS.map(outlet => (
                <Link key={outlet.label} href="#" style={{
                  display: 'flex', alignItems: 'center',
                  padding: '7px 10px', borderRadius: 9,
                  fontSize: 13.5, fontWeight: 500,
                  color: 'var(--ink-2)', textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    marginLeft: 6, marginRight: 9,
                    background: DOT_COLORS[outlet.color],
                    boxShadow: `#fff 0 0 0 3px`,
                  }} />
                  <span className="side-link-label" style={{ flex: 1 }}>{outlet.label}</span>
                  <span className="sb-badge" style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', background: 'var(--line-2)', padding: '1px 7px', borderRadius: 999 }}>
                    {outlet.count}
                  </span>
                </Link>
              ))}
              <Link href="#" style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '7px 10px', borderRadius: 9,
                fontSize: 13.5, fontWeight: 400,
                color: 'var(--ink-3)', textDecoration: 'none',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', marginLeft: 2 }}>
                  <Icon name="plus" size={14} />
                </span>
                <span className="side-link-label">New outlet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--line-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/settings" style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '8px 10px', borderRadius: 9,
            fontSize: 13.5, fontWeight: 500,
            color: 'var(--ink-2)', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
              <Icon name="settings" size={17} />
            </span>
            <span className="side-link-label">Settings</span>
          </Link>

          {/* User card */}
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 10, background: 'var(--surface-warm)', border: '1px solid var(--line-2)', marginTop: 4, textDecoration: 'none', color: 'inherit', transition: 'background 0.12s, border-color 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F4F8FF'; e.currentTarget.style.borderColor = '#CFD9FC' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-warm)'; e.currentTarget.style.borderColor = 'var(--line-2)' }}
            aria-label="Open profile"
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #B4C7FF, var(--accent))',
              color: '#fff', fontWeight: 600, fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--surface)',
              boxShadow: 'rgba(43,91,229,0.25) 0 2px 6px',
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-text" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.005em' }}>
                {displayName}
              </div>
              <div className="sb-text" style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Owner · 3 outlets
              </div>
            </div>
            <span style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', flexShrink: 0 }}>
              <Icon name="more" size={14} />
            </span>
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="main-with-sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 248, minHeight: '100vh' }}>
        {children}
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="mobile-nav">
        {MOBILE_NAV.map(item => (
          <Link key={item.href} href={item.href} className={`mobile-nav-item${isActive(item.href) ? ' active' : ''}`}>
            <span className="mobile-nav-icon">
              <Icon name={item.icon} size={22} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
