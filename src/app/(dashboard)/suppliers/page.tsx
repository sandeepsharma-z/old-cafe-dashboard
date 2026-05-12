'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

/* ── Types ─────────────────────────────────────────────────────────── */
interface Supplier {
  account_id: string
  business_name: string
  location: string
  contact_person: string
  product_categories: string[]
  total_orders?: number
  total_spend?: number
}

/* ── Static supplier data (design-faithful, augmented) ─────────────── */
const SUPPLIER_META: Record<string, {
  tagline: string; tags: string[]; onTime: number; activeOrders: number
  spend30: string; rating: number; reviews: number; perfPct: number; preferred: boolean; category: string
}> = {
  default: { tagline: '', tags: [], onTime: 92, activeOrders: 2, spend30: '₹28,000', rating: 4, reviews: 80, perfPct: 75, preferred: false, category: 'Other' },
}
const SUPPLIER_CARDS = [
  { name: 'Nandini Dairy Kitchen',    tagline: 'Dairy · Eggs · Paneer',         tags: ['Daily delivery','Cold chain'],             onTime: 98, activeOrders: 12, spend30: '₹1,84,220', rating: 5, reviews: 96,  perfPct: 98,  preferred: true,  cat: 'Dairy & eggs',   fssai: 'FSSAI 10018',   color: 'c-1' },
  { name: 'Blue Tokai Roasters',      tagline: 'Specialty coffee · Single-origin',tags: ['Weekly delivery','Single-origin','Fair trade'], onTime: 94, activeOrders: 4, spend30: '₹96,500', rating: 5, reviews: 92, perfPct: 94, preferred: false, cat: 'Coffee & tea',   fssai: '',              color: 'c-2' },
  { name: 'Hearth & Stone Bakery',    tagline: 'Viennoiserie · Sourdough',       tags: ['Daily delivery','Handmade','Artisan'],      onTime: 91, activeOrders: 6,  spend30: '₹41,960', rating: 4, reviews: 88,  perfPct: 91,  preferred: false, cat: 'Bakery',         fssai: '',              color: 'c-3' },
  { name: 'Bloom & Wild Greens',      tagline: 'Organic produce · Herbs',        tags: ['Thrice-weekly','Certified organic'],        onTime: 89, activeOrders: 3,  spend30: '₹32,180', rating: 4, reviews: 84,  perfPct: 89,  preferred: false, cat: 'Fresh produce',  fssai: '',              color: 'c-4' },
  { name: 'Malabar Fruit Co.',        tagline: 'Seasonal fruit · Cold chain',    tags: ['Weekly','Palakkad sourced'],               onTime: 90, activeOrders: 2,  spend30: '₹28,640', rating: 4, reviews: 86,  perfPct: 90,  preferred: false, cat: 'Fresh produce',  fssai: '',              color: 'c-5' },
  { name: 'Urban Spice Collective',   tagline: 'Whole spices · Teas',            tags: ['Monthly','Hand-sorted'],                   onTime: 87, activeOrders: 1,  spend30: '₹14,280', rating: 4, reviews: 82,  perfPct: 87,  preferred: false, cat: 'Pantry & oils',  fssai: '',              color: 'c-1' },
  { name: 'Sattva Cheese Works',      tagline: 'Artisanal cheese · Aged',        tags: ['Bi-weekly','Raw milk','Aged 6m+'],          onTime: 95, activeOrders: 2,  spend30: '₹22,400', rating: 5, reviews: 94,  perfPct: 95,  preferred: false, cat: 'Dairy & eggs',   fssai: '',              color: 'c-2' },
  { name: 'Grove Oil Collective',     tagline: 'Cold-pressed oils · Vinegars',   tags: ['Monthly','Stone-milled'],                  onTime: 93, activeOrders: 1,  spend30: '₹18,120', rating: 4, reviews: 90,  perfPct: 93,  preferred: false, cat: 'Pantry & oils',  fssai: '',              color: 'c-3' },
  { name: 'Paperwala Packaging',      tagline: 'Cups · Napkins · Kraft',         tags: ['Fortnightly','Recyclable'],                onTime: 91, activeOrders: 2,  spend30: '₹38,900', rating: 4, reviews: 86,  perfPct: 91,  preferred: false, cat: 'Packaging',      fssai: '',              color: 'c-4' },
]

const CATEGORIES = [
  { label: 'All suppliers',       count: 9 },
  { label: 'Preferred partners',  count: 2 },
  { label: 'Dairy & eggs',        count: 1 },
  { label: 'Coffee & tea',        count: 2 },
  { label: 'Bakery',              count: 1 },
  { label: 'Fresh produce',       count: 2 },
  { label: 'Pantry & oils',       count: 2 },
  { label: 'Packaging',           count: 1 },
]
const STATUS_FILTERS = [
  { label: 'Active',        count: 9 },
  { label: 'Under review',  count: 2 },
  { label: 'Paused',        count: 1 },
]
const RATING_FILTERS = [5, 4, 3]

/* ── Stars ─────────────────────────────────────────────────────────── */
function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i < rating ? 'var(--accent)' : 'none'}
          stroke={i < rating ? 'var(--accent)' : 'var(--ink-5)'}
          strokeWidth="2" style={{ display: 'block' }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

/* ── Supplier initials ─────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')
}

/* ══════════════════════════════════════════════════════════════════════
   SUPPLIERS PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All suppliers')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [viewMode, setViewMode]   = useState<'grid'|'list'>('grid')
  const [search, setSearch]       = useState('')

  useEffect(() => {
    api.get<{ suppliers: Supplier[] }>('/api/suppliers').then(d => {
      setSuppliers(d.suppliers ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function toggleSelect(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const filtered = SUPPLIER_CARDS.filter(s => {
    if (activeCategory === 'Preferred partners') return s.preferred
    if (activeCategory !== 'All suppliers') return s.cat === activeCategory
    if (search) return s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase())
    return true
  })

  const featured = SUPPLIER_CARDS.find(s => s.preferred)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(244,246,251,0.85)', backdropFilter: 'saturate(160%) blur(12px)', WebkitBackdropFilter: 'saturate(160%) blur(12px)', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', minWidth: 260, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 999, color: 'var(--ink-3)', fontSize: 13.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search suppliers, SKUs, invoices…" style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 5, background: 'var(--surface-warm)', flexShrink: 0 }}>⌘K</span>
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
        <div style={{ padding: '36px 0 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 10 }}>
              Supplier Network · Bengaluru
            </div>
            <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.022em', fontWeight: 500, color: 'var(--ink)' }}>
              Nine partners,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 38, letterSpacing: '-0.01em' }}>
                one trusted rhythm.
              </em>
            </h1>
            <p style={{ marginTop: 10, fontSize: 14.5, color: 'var(--ink-3)', maxWidth: 640, lineHeight: 1.55 }}>
              Directory of <b style={{ color: 'var(--ink)', fontWeight: 500 }}>9 active suppliers</b> across dairy, coffee, bakery, produce, and packaging.
              Preferred partners account for <b style={{ color: 'var(--ink)', fontWeight: 500 }}>71% of monthly spend</b> and <b style={{ color: 'var(--ink)', fontWeight: 500 }}>96% on-time delivery.</b>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexShrink: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)', fontSize: 12.5, color: 'var(--ok)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }}/>
              9 active
            </span>
            <button className="btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Invite supplier
            </button>
          </div>
        </div>

        {/* Featured supplier (dark hero card) */}
        {featured && (
          <div style={{
            background: 'linear-gradient(135deg, #1C1B19 0%, #2A2724 100%)',
            borderRadius: 16, padding: '28px 32px', color: '#FBFAF7',
            display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32,
            position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 24,
          }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,143,255,0.35) 0%,transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
                Preferred partner · 6 years
              </div>
              <h3 style={{ margin: '10px 0 8px', fontSize: 26, fontWeight: 500, letterSpacing: '-0.018em', lineHeight: 1.2, color: '#FBFAF7' }}>
                {featured.name}
              </h3>
              <p style={{ margin: '0 0 4px', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: 'rgba(251,250,247,0.82)' }}>
                steadying the morning rush since 2019.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'rgba(251,250,247,0.65)', lineHeight: 1.55, maxWidth: 440 }}>
                Daily 06:30 cold-chain drop to Indiranagar and Koramangala. Fixed unit pricing locked through June. No stockouts on buffalo milk or A2 this quarter.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Link href={`/suppliers/${featured.name.toLowerCase().replace(/\s+/g,'-')}`} style={{ height: 36, padding: '0 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
                  Start new order →
                </Link>
                <button style={{ height: 36, padding: '0 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: '#FBFAF7', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                  View history
                </button>
              </div>
            </div>
            {/* Meta stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 28px', alignSelf: 'center', position: 'relative', zIndex: 1 }}>
              {[
                { k: 'ON-TIME RATE', v: '98.2%', sub: 'last 90d' },
                { k: 'AVG. ARRIVAL', v: '06:32', sub: 'IST' },
                { k: 'SPEND YTD',   v: '₹12.4L', sub: '' },
                { k: 'SKUS STOCKED', v: '24', sub: 'dairy / eggs' },
              ].map(m => (
                <div key={m.k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(251,250,247,0.45)', fontWeight: 500 }}>{m.k}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: '#FBFAF7' }}>
                    {m.v} {m.sub && <small style={{ fontSize: 12, color: 'rgba(251,250,247,0.55)', fontWeight: 400, marginLeft: 4 }}>{m.sub}</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout: sidebar + grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Sidebar filter */}
          <div style={{ position: 'sticky', top: 84 }}>
            {/* Categories */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', fontWeight: 500, marginBottom: 10 }}>Categories</div>
              {CATEGORIES.map(cat => (
                <button key={cat.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 13,
                  color: activeCategory === cat.label ? '#FBFAF7' : 'var(--ink-2)',
                  background: activeCategory === cat.label ? 'var(--ink)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onClick={() => setActiveCategory(cat.label)}
                  onMouseEnter={e => { if (activeCategory !== cat.label) e.currentTarget.style.background = 'rgba(28,27,25,0.04)' }}
                  onMouseLeave={e => { if (activeCategory !== cat.label) e.currentTarget.style.background = 'transparent' }}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: 11.5, color: activeCategory === cat.label ? 'rgba(251,250,247,0.6)' : 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', fontWeight: 500, marginBottom: 10 }}>Status</div>
              {STATUS_FILTERS.map(sf => (
                <div key={sf.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', fontSize: 13, color: 'var(--ink-2)' }}>
                  <span>{sf.label}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>{sf.count}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', fontWeight: 500, marginBottom: 10 }}>Rating</div>
              {RATING_FILTERS.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stars rating={r}/> & up
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{r === 5 ? 3 : 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main area */}
          <div>
            {/* Search + view toggle bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', minWidth: 280, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--ink-3)', fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input placeholder="Search name, category, region…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13, color: 'var(--ink)', width: '100%' }}/>
              </div>
              <button className="tb-btn" style={{ height: 36 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
              </button>
              <button className="tb-btn" style={{ height: 36 }}>Sort: On-time ▾</button>
              <div style={{ flex: 1 }}/>
              {/* View toggle */}
              <div style={{ display: 'inline-flex', padding: 3, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-warm)' }}>
                {(['grid','list'] as const).map(m => (
                  <button key={m} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, color: viewMode === m ? 'var(--ink)' : 'var(--ink-3)', background: viewMode === m ? 'var(--surface)' : 'transparent', boxShadow: viewMode === m ? 'rgba(0,0,0,0.06) 0 1px 2px' : 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: '0.15s' }}
                    onClick={() => setViewMode(m)}>
                    {m === 'grid'
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    }
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Supplier grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {filtered.map(s => (
                <div key={s.name} style={{
                  background: s.preferred
                    ? 'linear-gradient(180deg,#F4F8FF 0%,var(--surface) 60%)'
                    : 'var(--surface)',
                  border: `1px solid ${s.preferred ? '#CFD9FC' : 'var(--line)'}`,
                  borderRadius: 14, padding: '20px 20px 16px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  position: 'relative', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9D2EB'; e.currentTarget.style.boxShadow = 'rgba(43,91,229,0.18) 0 8px 24px -12px'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = s.preferred ? '#CFD9FC' : 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                >
                  {/* Preferred top bar */}
                  {s.preferred && <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 2, background: 'var(--accent)', borderRadius: '0 0 2px 2px' }}/>}

                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div className={`supplier-mark ${s.color}`} style={{ width: 44, height: 44, borderRadius: 11, fontSize: 13 }}>
                      {initials(s.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.008em', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s.name}
                        {s.preferred && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="0">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.tagline}</div>
                    </div>
                    <button style={{ color: 'var(--ink-4)', padding: 4, borderRadius: 6, cursor: 'pointer', lineHeight: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--surface-warm)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.background = 'transparent' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: 'var(--ink-3)', padding: '2px 8px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--surface-warm)', letterSpacing: '0.005em' }}>
                        {tag}
                      </span>
                    ))}
                    {s.fssai && (
                      <span style={{ fontSize: 11, color: 'var(--ink-4)', padding: '2px 8px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--surface-warm)' }}>
                        {s.fssai}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)', padding: '12px 0' }}>
                    {[
                      { k: 'ON-TIME',    v: `${s.onTime}%` },
                      { k: 'ACTIVE',     v: String(s.activeOrders), sub: 'orders' },
                      { k: '30-DAY SPEND', v: s.spend30 },
                    ].map((st, i) => (
                      <div key={st.k} style={{ textAlign: 'left', padding: '0 4px', borderLeft: i > 0 ? '1px solid var(--line-2)' : 'none', paddingLeft: i > 0 ? 14 : 4 }}>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{st.k}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginTop: 3, letterSpacing: '-0.015em', fontVariantNumeric: 'tabular-nums' }}>
                          {st.v}{st.sub && <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 4 }}>{st.sub}</small>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rating + perf bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                    <Stars rating={s.rating}/>
                    <div style={{ flex: 1, height: 5, background: 'var(--line-2)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${s.perfPct}%`, background: 'var(--ok)', borderRadius: 3 }}/>
                    </div>
                    <span style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{s.reviews}</span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: '0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-warm)'; e.currentTarget.style.borderColor = '#DAD7CF' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--line)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                      Contact
                    </button>
                    <Link href={`/suppliers/${encodeURIComponent(s.name)}`} style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid var(--ink)', background: 'var(--ink)', color: '#FBFAF7', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', transition: '0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#000' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare strip */}
            {selected.size > 0 && (
              <div style={{ marginTop: 22, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>
                  Comparing suppliers side-by-side? <b style={{ color: 'var(--ink)', fontWeight: 500 }}>Select up to 4</b> to see pricing, lead time, and on-time rates together.
                </div>
                <button className="tb-btn" style={{ height: 32 }} onClick={() => setSelected(new Set())}>Clear</button>
                <button className="tb-btn primary" style={{ height: 32 }}>Compare →</button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, padding: '16px 4px', display: 'flex', justifyContent: 'space-between', color: 'var(--ink-4)', fontSize: 11.5, borderTop: '1px solid var(--line)' }}>
          <span>Gradient Cafe Portal · Suppliers</span>
          <span>9 active · 2 under review · synced just now</span>
        </div>
      </div>
    </div>
  )
}
