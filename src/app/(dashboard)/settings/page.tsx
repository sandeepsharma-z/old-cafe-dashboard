'use client'

import Link from 'next/link'
import { Icon, PageIntro, PageShell, StatusBadge } from '@/components/cafe-v2'

const SETTINGS_GROUPS = [
  {
    title: 'Outlet defaults',
    sub: 'Ordering windows, low-stock thresholds, and preferred outlet routing.',
    status: '3 outlets configured',
    tone: 'ok' as const,
    rows: ['Indiranagar opens at 07:30', 'Koramangala weekly billing enabled', 'HSR Layout packaging alerts on'],
  },
  {
    title: 'Notifications',
    sub: 'Delivery nudges, invoice approvals, and stock alerts for owner and managers.',
    status: '12 rules active',
    tone: 'accent' as const,
    rows: ['WhatsApp delivery alerts', 'Email invoice digest at 18:00', 'Critical stock SMS escalation'],
  },
  {
    title: 'Security',
    sub: 'Account access, session controls, and password changes live under profile.',
    status: 'Profile managed',
    tone: 'warn' as const,
    rows: ['Owner role active', 'JWT cookie auth', 'Password changes require current password'],
  },
]

export default function SettingsPage() {
  return (
    <PageShell footerLeft="Gradient Cafe Portal - Settings" footerRight="3 outlets - notification rules synced">
      <PageIntro
        eyebrow="Settings - Cafe workspace"
        title="Tune the portal"
        em="around daily operations."
        body={(
          <>
            Manage the defaults that shape orders, alerts, and outlet behaviour. For personal account details and password changes, open the profile card.
          </>
        )}
        action={(
          <>
            <Link href="/profile" className="tb-btn" style={{ height: 36, textDecoration: 'none' }}>
              <Icon name="more" size={13} /> Profile
            </Link>
            <button className="btn-primary"><Icon name="check" size={14} /> Save settings</button>
          </>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.75fr', gap: 20, alignItems: 'start' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SETTINGS_GROUPS.map(group => (
            <div key={group.title} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{group.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{group.sub}</div>
                </div>
                <StatusBadge tone={group.tone}>{group.status}</StatusBadge>
              </div>
              {group.rows.map(row => (
                <div key={row} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', gap: 12, padding: '13px 22px', borderBottom: '1px solid var(--line-2)' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-warm)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
                    <Icon name="check" size={13} />
                  </span>
                  <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{row}</span>
                  <button className="tb-btn" style={{ height: 28 }}>Edit</button>
                </div>
              ))}
            </div>
          ))}
        </section>

        <aside className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--line-2)' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Quick links</h3>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Common workspace actions</div>
          </div>
          {[
            { label: 'Profile and password', href: '/profile' },
            { label: 'Billing approvals', href: '/billing' },
            { label: 'Low-stock rules', href: '/inventory' },
            { label: 'Supplier network', href: '/suppliers' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 22px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-2)', textDecoration: 'none', fontSize: 13.5, fontWeight: 500 }}>
              {link.label}
              <span style={{ color: 'var(--ink-4)' }}>→</span>
            </Link>
          ))}
        </aside>
      </div>
    </PageShell>
  )
}
