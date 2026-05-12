'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Notification {
  id: number
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  order:     { icon: '📦', color: '#2563EB', bg: '#eff6ff' },
  trial:     { icon: '🧪', color: '#7c3aed', bg: '#f5f3ff' },
  payment:   { icon: '💳', color: '#059669', bg: '#ecfdf5' },
  alert:     { icon: '⚠️', color: '#C9963A', bg: '#fffbeb' },
  default:   { icon: '🔔', color: 'var(--portal-primary)', bg: '#fff7ed' },
}

function getTypeMeta(type: string) {
  return TYPE_META[type?.toLowerCase()] ?? TYPE_META.default
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
      .then(data => {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await api.put('/api/notifications/read-all/all', {})
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const markRead = async (id: number) => {
    await api.put(`/api/notifications/${id}/read`, {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 700, background: 'var(--portal-primary)', color: '#fff', padding: '2px 7px', borderRadius: '20px' }}>{unreadCount}</span>
          )}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost" style={{ fontSize: '11px', padding: '5px 11px' }}>Mark all read</button>
          )}
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '14px' }}>Notifications</div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', padding: '11px 13px' }}>
                <div style={{ width: '40%', height: '10px', borderRadius: '4px', background: 'var(--bg)', marginBottom: '8px' }} />
                <div style={{ width: '70%', height: '10px', borderRadius: '4px', background: 'var(--bg)' }} />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔔</div>
              <p style={{ fontSize: '12px', fontWeight: 500, margin: 0 }}>All caught up</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>No notifications in the last 24 hours</p>
            </div>
          ) : (
            notifications.map(n => {
              const meta = getTypeMeta(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    background: n.is_read ? '#fff' : 'var(--bg)',
                    borderRadius: '9px',
                    border: '1px solid var(--border)',
                    borderLeft: n.is_read ? '1px solid var(--border)' : `3px solid var(--portal-primary)`,
                    padding: '11px 13px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: n.is_read ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: n.is_read ? 400 : 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                        {n.title || n.type}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.5 }}>{n.body}</p>
                    )}
                  </div>
                  {!n.is_read && (
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--portal-primary)', flexShrink: 0, marginTop: '5px' }} />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </>
  )
}
