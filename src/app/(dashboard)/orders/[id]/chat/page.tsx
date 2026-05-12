'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

interface Message {
  id: number
  content: string
  sender_account_id: string
  sender_name: string
  created_at: string
  is_encrypted: boolean
}

interface OrderMeta {
  order_ref: string
}

export default function OrderChatPage() {
  const params = useParams()
  const id = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [orderRef, setOrderRef] = useState<string>('')
  const [myAccountId, setMyAccountId] = useState<string>('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gradient365_user')
      if (raw) {
        const user = JSON.parse(raw)
        setMyAccountId(user.accountId ?? user.account_id ?? '')
      }
    } catch {
      // ignore
    }
  }, [])

  const loadMessages = useCallback(() => {
    api.get<{ messages: Message[] }>(`/api/messages/order/${id}`)
      .then(data => setMessages(data.messages ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api.get<{ order: OrderMeta }>(`/api/orders/${id}`)
      .then(data => setOrderRef(data.order?.order_ref ?? `#${id}`))
      .catch(() => setOrderRef(`#${id}`))

    loadMessages()
  }, [id, loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!content.trim()) return
    setSending(true)
    try {
      await api.post('/api/messages/order', { order_id: parseInt(id), content: content.trim() })
      setContent('')
      loadMessages()
    } catch {
      alert('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Breadcrumb topbar */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '8px', flexShrink: 0 }}>
        <Link href={`/orders/${id}`} style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>← {orderRef}</Link>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '8px' }}>Order Chat</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>🔒 End-to-end encrypted</span>
          <button
            onClick={() => { setLoading(true); loadMessages() }}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
          >
            ↻
          </button>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      {/* Encryption banner */}
      <div style={{ background: '#fffbeb', borderBottom: '1px solid #fcd34d', padding: '8px 16px', fontSize: '10px', color: '#92400E', flexShrink: 0 }}>
        🔒 Messages in this thread are encrypted and can only be read by you and your supplier.
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg)' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px', fontSize: '12px' }}>Loading messages…</div>
        ) : messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px', fontSize: '12px' }}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_account_id === myAccountId
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500 }}>{msg.sender_name}</span>
                )}
                <div style={{
                  maxWidth: '68%',
                  padding: '8px 11px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  background: isMe ? 'var(--portal-primary)' : '#fff',
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  borderBottomRightRadius: isMe ? '3px' : '12px',
                  borderBottomLeftRadius: isMe ? '12px' : '3px',
                }}>
                  {msg.content}
                  {msg.is_encrypted && <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '5px' }}>🔒</span>}
                  <div style={{ fontSize: '9px', opacity: 0.55, marginTop: '3px', textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#fff', flexShrink: 0 }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={{ flex: 1, resize: 'none', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 13px', fontSize: '11px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="btn-primary"
          style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '11px', flexShrink: 0, opacity: sending || !content.trim() ? 0.6 : 1, cursor: sending || !content.trim() ? 'not-allowed' : 'pointer' }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </>
  )
}
