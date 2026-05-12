'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useCart } from '@/context/cart-context'

interface CatalogueItem {
  id: number
  name: string
  unit: string
  price_per_unit: string
  min_order_quantity: number
  supplier_account_id: string
  supplier_name: string
  category: string
  description: string
  is_available: boolean
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ width: '80%', height: '16px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '50%', height: '12px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '60px', height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '100%', height: '36px', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
    </div>
  )
}

let debounceTimer: ReturnType<typeof setTimeout>

export default function CataloguePage() {
  const { addItem, totalItems, totalAmount } = useCart()

  const [items, setItems] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [categories, setCategories] = useState<string[]>(['All'])
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  function loadBrowse() {
    setLoading(true)
    api.get<{ items: CatalogueItem[] } | { catalogue: CatalogueItem[] } | CatalogueItem[]>('/api/catalogue/browse')
      .then(data => {
        let raw: CatalogueItem[] = []
        if (Array.isArray(data)) raw = data
        else if ('items' in data && Array.isArray(data.items)) raw = data.items
        else if ('catalogue' in data && Array.isArray((data as { catalogue: CatalogueItem[] }).catalogue)) raw = (data as { catalogue: CatalogueItem[] }).catalogue
        setItems(raw)
        const cats = ['All', ...Array.from(new Set(raw.map(i => i.category).filter(Boolean)))]
        setCategories(cats)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  function doSearch(q: string) {
    if (!q.trim()) {
      loadBrowse()
      return
    }
    setLoading(true)
    api.get<{ items: CatalogueItem[] } | CatalogueItem[]>(`/api/catalogue/search?q=${encodeURIComponent(q)}`)
      .then(data => {
        let raw: CatalogueItem[] = []
        if (Array.isArray(data)) raw = data
        else if ('items' in data && Array.isArray(data.items)) raw = data.items
        setItems(raw)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get<{ categories: string[] } | string[]>('/api/catalogue/categories')
      .then(data => {
        const raw = Array.isArray(data) ? data : (data as { categories: string[] }).categories ?? []
        if (raw.length > 0) setCategories(['All', ...raw])
      })
      .catch(() => {})

    loadBrowse()
  }, [])

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doSearch(val), 300)
  }, [])

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(i => i.category === selectedCategory)

  function handleAddToCart(item: CatalogueItem) {
    addItem({
      id: item.id,
      catalogue_item_id: item.id,
      name: item.name,
      unit: item.unit,
      price_per_unit: parseFloat(item.price_per_unit),
      supplier_account_id: item.supplier_account_id,
      supplier_name: item.supplier_name,
    })
    setAddedIds(prev => new Set(prev).add(item.id))
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }, 1500)
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Topbar with search */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '10px', flexShrink: 0 }}>
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder={`Search ${items.length} products…`}
          style={{
            flex: 1,
            maxWidth: '260px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            padding: '6px 11px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            outline: 'none',
          }}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px', paddingBottom: totalItems > 0 ? '100px' : '18px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '14px' }}>Catalogue</div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--portal-primary)' : '#fff',
                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '9px', padding: '48px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No items found. Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '9px' }}>
            {filteredItems.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '9px', padding: '11px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', opacity: item.is_available === false ? 0.55 : 1 }}>
                <div style={{ width: '100%', height: '56px', borderRadius: '7px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '7px' }}>
                  📦
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.supplier_name}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--portal-primary)', marginTop: '5px' }}>₹{parseFloat(item.price_per_unit).toFixed(2)} / {item.unit}</div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.is_available === false}
                  style={{
                    width: '100%',
                    marginTop: '7px',
                    background: addedIds.has(item.id) ? '#dcfce7' : item.is_available === false ? 'var(--surface-subtle)' : 'var(--portal-primary)',
                    color: addedIds.has(item.id) ? '#166534' : item.is_available === false ? 'var(--text-muted)' : '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 0',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: item.is_available === false ? 'not-allowed' : 'pointer',
                  }}
                >
                  {item.is_available === false ? 'Unavailable' : addedIds.has(item.id) ? '✓ Added' : '+ Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--portal-primary)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 8px 24px rgba(234,88,12,0.35)',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} · ₹{totalAmount.toFixed(2)}
          </span>
          <Link href="/cart" style={{
            background: '#ffffff',
            color: 'var(--portal-primary)',
            padding: '8px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            textDecoration: 'none',
          }}>
            View Cart →
          </Link>
        </div>
      )}
    </>
  )
}
