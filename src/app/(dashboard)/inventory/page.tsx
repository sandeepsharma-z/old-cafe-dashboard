'use client'

import Link from 'next/link'
import { Icon, KpiCard, MiniBars, PageIntro, PageShell, StatStrip, StatusBadge, SupplierMark } from '@/components/cafe-v2'

type StockTone = 'ok' | 'warn' | 'danger' | 'info'

const STOCK_ITEMS: Array<{
  sku: string
  name: string
  supplier: string
  outlet: string
  category: string
  onHand: string
  threshold: string
  cover: string
  fill: number
  tone: StockTone
  status: string
  color: string
}> = [
  { sku: 'INV-0428', name: 'Arabica blend - Attikan', supplier: 'Blue Tokai Roasters', outlet: 'Indiranagar', category: 'Coffee', onHand: '2.4 kg', threshold: '6 kg', cover: '1.2 days', fill: 40, tone: 'danger', status: 'Reorder today', color: 'c-2' },
  { sku: 'INV-0184', name: 'Whole milk - Nandini', supplier: 'Nandini Dairy Kitchen', outlet: 'Indiranagar', category: 'Dairy', onHand: '18 L', threshold: '30 L', cover: '2.1 days', fill: 60, tone: 'warn', status: 'Low stock', color: 'c-1' },
  { sku: 'INV-0221', name: 'Cream cheese', supplier: 'Sattva Cheese Works', outlet: 'Koramangala', category: 'Dairy', onHand: '1.8 kg', threshold: '3 kg', cover: '2.8 days', fill: 60, tone: 'warn', status: 'Low stock', color: 'c-2' },
  { sku: 'INV-0612', name: 'Paper cups 12oz', supplier: 'Paperwala Packaging', outlet: 'HSR Layout', category: 'Packaging', onHand: '240 pc', threshold: '500 pc', cover: '1.5 days', fill: 48, tone: 'danger', status: 'Reorder today', color: 'c-4' },
  { sku: 'INV-0338', name: 'Brioche buns', supplier: 'Hearth & Stone Bakery', outlet: 'Indiranagar', category: 'Bakery', onHand: '86 pc', threshold: '60 pc', cover: '3.4 days', fill: 92, tone: 'ok', status: 'Healthy', color: 'c-3' },
  { sku: 'INV-0719', name: 'Rocket leaves', supplier: 'Bloom & Wild Greens', outlet: 'Koramangala', category: 'Produce', onHand: '5.2 kg', threshold: '4 kg', cover: '4.1 days', fill: 100, tone: 'ok', status: 'Healthy', color: 'c-4' },
]

const REORDER_QUEUE = [
  { name: 'Coffee emergency basket', supplier: 'Blue Tokai Roasters', amount: '₹42,800', items: '6 SKUs', by: 'Today 17:00', tone: 'danger' as const },
  { name: 'Dairy morning buffer', supplier: 'Nandini Dairy Kitchen', amount: '₹18,420', items: '4 SKUs', by: 'Tomorrow 06:30', tone: 'warn' as const },
  { name: 'Packaging restock', supplier: 'Paperwala Packaging', amount: '₹11,760', items: '3 SKUs', by: 'Monday', tone: 'info' as const },
]

const MOVEMENTS = [
  { time: '06:42', item: 'Whole milk - Nandini', delta: '+42 L', outlet: 'Indiranagar', type: 'Delivery received' },
  { time: '08:10', item: 'Arabica blend - Attikan', delta: '-1.6 kg', outlet: 'Indiranagar', type: 'Bar open pull' },
  { time: '09:25', item: 'Brioche buns', delta: '-28 pc', outlet: 'Koramangala', type: 'Kitchen issue' },
  { time: '10:05', item: 'Paper cups 12oz', delta: '-120 pc', outlet: 'HSR Layout', type: 'Counter issue' },
]

function stockFillColor(tone: StockTone) {
  if (tone === 'danger') return 'var(--danger)'
  if (tone === 'warn') return 'var(--warn)'
  if (tone === 'ok') return 'var(--ok)'
  return 'var(--accent)'
}

export default function InventoryPage() {
  const critical = STOCK_ITEMS.filter(item => item.tone === 'danger').length
  const low = STOCK_ITEMS.filter(item => item.tone === 'warn').length

  return (
    <PageShell footerLeft="Gradient Cafe Portal - Inventory" footerRight="17 SKUs watched - synced just now">
      <PageIntro
        eyebrow="Inventory - Live stock"
        title="Stock levels,"
        em="without the morning panic."
        body={(
          <>
            Watching <b style={{ color: 'var(--ink)', fontWeight: 500 }}>17 priority SKUs</b> across 3 outlets.{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{critical} critical</b> items need same-day reorder, and{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{low} low-stock</b> items are below buffer.
          </>
        )}
        action={(
          <>
            <span className="chip"><span className="pulse-dot" /> Live counts</span>
            <button className="btn-primary"><Icon name="refresh" size={14} /> Sync stock</button>
          </>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
        <KpiCard title="Critical SKUs" value={critical} unit="items" trend="+2" tone="danger" sub="since yesterday" icon={<Icon name="warning" size={14} />} accentBar />
        <KpiCard title="Days of cover" value="3.8" unit="avg" trend="stable" sub="across outlets" icon={<Icon name="clock" size={14} />} />
        <KpiCard title="Stock value" value="₹8.42L" trend="+6.1%" tone="ok" sub="at landed cost" icon={<Icon name="box" size={14} />} />
        <KpiCard title="Open reorders" value="7" unit="drafts" trend="3 due" tone="warn" sub="before noon" icon={<Icon name="cart" size={14} />} />
      </div>

      <StatStrip stats={[
        { key: 'Indiranagar', value: '6', sub: 'low items' },
        { key: 'Koramangala', value: '3', sub: 'low items' },
        { key: 'HSR Layout', value: '3', sub: 'low items' },
        { key: 'Auto reorder rules', value: '11', sub: 'active' },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.9fr', gap: 20, alignItems: 'start' }}>
        <section className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>Watched inventory</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Thresholds, cover, supplier ownership</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="tb-btn"><Icon name="filter" size={12} /> Filter</button>
              <Link className="tb-btn" href="/catalogue" style={{ textDecoration: 'none' }}>Browse catalogue</Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 22px', borderBottom: '1px solid var(--line-2)', flexWrap: 'wrap' }}>
            {['All 17', 'Critical 2', 'Low 3', 'Healthy 12', 'Auto reorder 11'].map((label, index) => (
              <button key={label} className={`filter-pill${index === 0 ? ' active' : ''}`}>{label}</button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item</th>
                  <th>Supplier</th>
                  <th>Outlet</th>
                  <th>On hand</th>
                  <th>Cover</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {STOCK_ITEMS.map(item => (
                  <tr key={item.sku}>
                    <td><span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{item.sku}</span></td>
                    <td>
                      <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{item.name}</div>
                      <div style={{ marginTop: 8, height: 6, background: 'var(--line-2)', borderRadius: 3, position: 'relative', overflow: 'visible', width: 150 }}>
                        <span style={{ position: 'absolute', inset: '0 auto 0 0', width: `${item.fill}%`, maxWidth: '100%', background: stockFillColor(item.tone), borderRadius: 3 }} />
                        <span style={{ position: 'absolute', top: -4, bottom: -4, left: '60%', width: 1.5, background: 'var(--ink-3)', opacity: 0.55 }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <SupplierMark name={item.supplier} color={item.color} size={28} />
                        <span>{item.supplier}</span>
                      </div>
                    </td>
                    <td>{item.outlet}</td>
                    <td className="tnum" style={{ color: 'var(--ink)', fontWeight: 500 }}>{item.onHand}<br /><small style={{ color: 'var(--ink-4)', fontWeight: 400 }}>min {item.threshold}</small></td>
                    <td className="tnum">{item.cover}</td>
                    <td><StatusBadge tone={item.tone}>{item.status}</StatusBadge></td>
                    <td><button className="tb-btn primary">Reorder</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Stock pressure</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>Daily issue rate by outlet</p>
              </div>
              <StatusBadge tone="warn">2 spikes</StatusBadge>
            </div>
            <MiniBars values={[22, 28, 25, 34, 39, 48, 44, 55, 61, 70, 66, 78]} color="var(--warn)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <div className="card warm" style={{ padding: 12, boxShadow: 'none' }}>
                <div className="eyebrow">Fastest drain</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600, marginTop: 4 }}>Coffee bar</div>
              </div>
              <div className="card warm" style={{ padding: 12, boxShadow: 'none' }}>
                <div className="eyebrow">Next check</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600, marginTop: 4 }}>14:30 IST</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Reorder queue</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Draft baskets grouped by supplier</div>
            </div>
            {REORDER_QUEUE.map(item => (
              <div key={item.name} style={{ padding: '14px 22px', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 12px' }}>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{item.name}</div>
                <StatusBadge tone={item.tone}>{item.by}</StatusBadge>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.supplier} - {item.items}</div>
                <div className="tnum" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{item.amount}</div>
              </div>
            ))}
            <div style={{ padding: 16 }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create all drafts</button>
            </div>
          </section>

          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Recent movement</h3>
            </div>
            {MOVEMENTS.map(move => (
              <div key={`${move.time}-${move.item}`} style={{ display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 12, padding: '12px 22px', borderBottom: '1px solid var(--line-2)', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{move.time}</span>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{move.item}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{move.type} - {move.outlet}</div>
                </div>
                <span className="tnum" style={{ fontSize: 13, color: move.delta.startsWith('+') ? 'var(--ok)' : 'var(--danger)', fontWeight: 600 }}>{move.delta}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </PageShell>
  )
}
