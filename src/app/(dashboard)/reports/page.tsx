'use client'

import { Icon, KpiCard, MiniBars, PageIntro, PageShell, StatStrip, StatusBadge, SupplierMark } from '@/components/cafe-v2'

const CATEGORY_SPEND = [
  { label: 'Dairy & eggs', value: '₹1,84,220', pct: 42, color: 'var(--accent)' },
  { label: 'Coffee & tea', value: '₹96,500', pct: 22, color: 'var(--ok)' },
  { label: 'Bakery', value: '₹41,960', pct: 10, color: 'var(--warn)' },
  { label: 'Fresh produce', value: '₹32,180', pct: 8, color: 'var(--danger)' },
  { label: 'Packaging', value: '₹38,900', pct: 9, color: 'var(--ink-3)' },
]

const SUPPLIERS = [
  { name: 'Nandini Dairy Kitchen', spend: '₹1,84,220', orders: 18, onTime: '98.2%', delta: '+8.4%', color: 'c-1' },
  { name: 'Blue Tokai Roasters', spend: '₹96,500', orders: 7, onTime: '94.1%', delta: '+3.1%', color: 'c-2' },
  { name: 'Hearth & Stone Bakery', spend: '₹41,960', orders: 14, onTime: '91.0%', delta: '-1.8%', color: 'c-3' },
  { name: 'Bloom & Wild Greens', spend: '₹32,180', orders: 9, onTime: '89.4%', delta: '+2.2%', color: 'c-4' },
]

const INSIGHTS = [
  { type: 'Cost control', title: 'Coffee spend is climbing faster than sales', body: 'Attikan Estate has moved from 18% to 22% of procurement spend. Lock next month pricing before the seasonal quote revision.', tone: 'warn' as const },
  { type: 'Reliability', title: 'Nandini should stay preferred', body: 'Daily dairy deliveries are running at 98.2% on-time with no critical stockout events in the last 30 days.', tone: 'ok' as const },
  { type: 'Outlet drift', title: 'HSR packaging drain is abnormal', body: '12oz cups are being consumed 31% faster than Koramangala at similar order volume. Review counter wastage and staff issue logs.', tone: 'danger' as const },
]

function Donut() {
  const segments = [
    { value: 42, color: 'var(--accent)' },
    { value: 22, color: 'var(--ok)' },
    { value: 10, color: 'var(--warn)' },
    { value: 8, color: 'var(--danger)' },
    { value: 18, color: 'var(--line)' },
  ]
  let offset = 25
  return (
    <svg viewBox="0 0 140 140" style={{ width: 150, height: 150 }}>
      <circle cx="70" cy="70" r="48" fill="none" stroke="var(--line-2)" strokeWidth="18" />
      {segments.map((segment, index) => {
        const dash = `${segment.value * 3.01} ${301 - segment.value * 3.01}`
        const current = offset
        offset -= segment.value
        return (
          <circle
            key={index}
            cx="70"
            cy="70"
            r="48"
            fill="none"
            stroke={segment.color}
            strokeWidth="18"
            strokeDasharray={dash}
            strokeDashoffset={current * 3.01}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        )
      })}
      <text x="70" y="68" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>42%</text>
      <text x="70" y="86" textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>dairy lead</text>
    </svg>
  )
}

export default function ReportsPage() {
  return (
    <PageShell footerLeft="Gradient Cafe Portal - Reports" footerRight="Last export 10:30 IST - Saturday, 2 May">
      <PageIntro
        eyebrow="Reports - Procurement intelligence"
        title="Know where the money"
        em="moves before it leaks."
        body={(
          <>
            Spend, supplier reliability, stock pressure, and outlet variance in one weekly operating view.{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>₹4.82L tracked</b> this month with{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>96.4% fulfilment</b> across preferred partners.
          </>
        )}
        action={(
          <>
            <button className="tb-btn" style={{ height: 36 }}><Icon name="calendar" size={13} /> Last 30 days</button>
            <button className="btn-primary"><Icon name="download" size={14} /> Export report</button>
          </>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
        <KpiCard title="Monthly spend" value="₹4.82L" trend="+8.4%" tone="ok" sub="vs last month" icon={<Icon name="chart" size={14} />} accentBar />
        <KpiCard title="Avg. order value" value="₹12,680" trend="-4.2%" sub="basket discipline" icon={<Icon name="cart" size={14} />} />
        <KpiCard title="Fulfilment rate" value="96.4%" trend="+1.1%" tone="ok" sub="last 30 days" icon={<Icon name="check" size={14} />} />
        <KpiCard title="Exceptions" value="14" unit="events" trend="3 critical" tone="warn" sub="stock + billing" icon={<Icon name="warning" size={14} />} />
      </div>

      <StatStrip stats={[
        { key: 'Top outlet', value: 'Indiranagar', sub: '₹2.18L spend' },
        { key: 'Best supplier', value: '98.2%', sub: 'Nandini on-time' },
        { key: 'Largest variance', value: '31%', sub: 'HSR packaging' },
        { key: 'Potential saving', value: '₹18.4K', sub: 'bulk dairy quote' },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 20, marginBottom: 20 }}>
        <section className="card" style={{ padding: '22px 24px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Spend trend</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>Weekly expenditure by purchase date</p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-warm)', border: '1px solid var(--line)', padding: 3, borderRadius: 10 }}>
              {['7D', '30D', '90D'].map((label, index) => (
                <button key={label} style={{ height: 26, padding: '0 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, background: index === 1 ? 'var(--surface)' : 'transparent', color: index === 1 ? 'var(--ink)' : 'var(--ink-3)', boxShadow: index === 1 ? 'rgba(28,27,25,0.08) 0 1px 2px' : 'none' }}>{label}</button>
              ))}
            </div>
          </div>
          <MiniBars values={[42, 48, 39, 52, 61, 58, 67, 74, 69, 82, 78, 91, 88, 96]} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 18 }}>
            {[
              ['Highest week', '₹1.06L', 'dairy + coffee'],
              ['Lowest week', '₹42K', 'holiday dip'],
              ['Forecast', '₹5.14L', 'next 30 days'],
            ].map(([key, value, sub]) => (
              <div key={key} className="card warm" style={{ boxShadow: 'none', padding: 14 }}>
                <div className="eyebrow">{key}</div>
                <div className="tnum" style={{ marginTop: 5, fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: '22px 24px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Spend mix</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>Share by category</p>
            </div>
            <StatusBadge tone="accent">5 categories</StatusBadge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, alignItems: 'center' }}>
            <Donut />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORY_SPEND.map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{item.label}</span>
                    <span className="tnum" style={{ color: 'var(--ink)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--line-2)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                    <span style={{ display: 'block', width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 20 }}>
        <section className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Supplier scorecard</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Spend, order count, on-time rate</div>
            </div>
            <button className="tb-btn"><Icon name="download" size={12} /> CSV</button>
          </div>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Orders</th>
                <th>On-time</th>
                <th>Change</th>
                <th style={{ textAlign: 'right' }}>Spend</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map(supplier => (
                <tr key={supplier.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SupplierMark name={supplier.name} color={supplier.color} size={30} />
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{supplier.name}</span>
                    </div>
                  </td>
                  <td className="tnum">{supplier.orders}</td>
                  <td className="tnum"><StatusBadge tone={parseFloat(supplier.onTime) >= 94 ? 'ok' : 'warn'}>{supplier.onTime}</StatusBadge></td>
                  <td className="tnum" style={{ color: supplier.delta.startsWith('+') ? 'var(--ok)' : 'var(--danger)', fontWeight: 500 }}>{supplier.delta}</td>
                  <td className="tnum" style={{ textAlign: 'right', color: 'var(--ink)', fontWeight: 500 }}>{supplier.spend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Report packs</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Ready for owner review</div>
            </div>
            {['Weekly ops digest', 'Supplier reliability', 'Billing ageing', 'Inventory variance'].map((name, index) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-warm)', border: '1px solid var(--line)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={14} /></div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{index === 0 ? 'Updated today' : 'Updated this week'}</div>
                </div>
                <button className="tb-btn" style={{ height: 28 }}>Open</button>
              </div>
            ))}
          </section>

          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Signals</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>What needs a decision</div>
            </div>
            {INSIGHTS.map(item => (
              <div key={item.title} style={{ padding: '14px 22px', borderBottom: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div className="eyebrow">{item.type}</div>
                  <StatusBadge tone={item.tone}>{item.tone === 'ok' ? 'good' : item.tone === 'warn' ? 'watch' : 'act'}</StatusBadge>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                <p style={{ margin: 0, color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.5 }}>{item.body}</p>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </PageShell>
  )
}
