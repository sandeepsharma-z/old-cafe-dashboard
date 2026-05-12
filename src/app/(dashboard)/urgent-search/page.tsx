'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface UrgentResult {
  supplier_account_id: string
  supplier_name: string
  item_name: string
  quantity_available: number
  unit: string
  price: string
}

const EXAMPLES = ['whole milk 5L', 'espresso beans 1kg', 'sugar 25kg', 'paper cups 500ml']

export default function UrgentSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UrgentResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    api.get<{ results: UrgentResult[] }>(`/api/search/urgent?q=${encodeURIComponent(q.trim())}`)
      .then(data => setResults(data.results ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') doSearch(query)
  }

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Urgent Search</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🔔</div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px' }}>
        {/* Search hero */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Find any product across all your linked suppliers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid var(--portal-primary)', borderRadius: '10px', padding: '10px 14px', background: 'var(--bg)' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Full Cream Milk, Arabica Beans…"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button onClick={() => doSearch(query)} disabled={loading || !query.trim()} className="btn-primary" style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '12px', flexShrink: 0, opacity: !query.trim() ? 0.5 : 1 }}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          {/* Examples */}
          {!searched && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '6px' }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); doSearch(ex) }}
                  style={{ background: 'var(--bg)', color: 'var(--portal-primary)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', marginRight: '5px', marginTop: '4px' }}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {results.length} supplier{results.length !== 1 ? 's' : ''} have &ldquo;{query}&rdquo; in stock
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!searched && !loading && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px dashed var(--border)', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚡</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px', margin: 0 }}>Search for an item to find suppliers with stock available right now.</p>
            </div>
          )}

          {loading && (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '12px 0' }}>Finding suppliers…</div>
          )}

          {searched && !loading && results.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px', margin: 0 }}>No suppliers found. Try a different search term.</p>
            </div>
          )}

          {results.map((r, i) => (
            <div key={`${r.supplier_account_id}-${i}`} style={{ background: '#fff', borderRadius: '9px', border: '1px solid var(--border)', padding: '11px 13px', marginBottom: '7px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🏪</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.supplier_name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{r.item_name} · {r.quantity_available} {r.unit} available</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{Number(r.price).toFixed(2)} / {r.unit}</div>
                <div style={{ fontSize: '10px', marginTop: '2px', color: 'var(--badge-accepted-text)' }}>● In stock</div>
              </div>
              <Link
                href={`/suppliers/${r.supplier_account_id}`}
                style={{ marginLeft: '8px', background: 'var(--portal-primary)', color: '#fff', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '10px', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
