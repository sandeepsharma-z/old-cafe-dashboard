'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useCart } from '@/context/cart-context'

interface SupplierProfile {
  account_id: string
  business_name: string
  location: string
  contact_person: string
  product_categories: string[]
}

interface CatalogueItem {
  id: number
  name: string
  unit: string
  price_per_unit: string
  min_order_quantity: number
  is_available: boolean
  category: string
}

export default function SupplierProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { addItem, totalItems, totalAmount } = useCart()

  const [supplier, setSupplier] = useState<SupplierProfile | null>(null)
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ supplier: SupplierProfile; catalogue: CatalogueItem[] }>(`/api/catalogue/supplier/${id}`)
      .then(data => {
        setSupplier(data.supplier)
        setCatalogue(data.catalogue ?? [])
      })
      .catch(() => setError('Could not load supplier profile.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  function handleAddToCart(item: CatalogueItem) {
    if (!supplier) return
    addItem({
      id: item.id,
      catalogue_item_id: item.id,
      name: item.name,
      unit: item.unit,
      price_per_unit: parseFloat(item.price_per_unit),
      supplier_account_id: supplier.account_id,
      supplier_name: supplier.business_name,
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

  if (loading) {
    return (
      <div style={{ padding: '18px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>← Suppliers</div>
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
          <div style={{ width: '200px', height: '16px', background: 'var(--bg)', borderRadius: '4px', marginBottom: '10px' }} />
          <div style={{ width: '140px', height: '12px', background: 'var(--bg)', borderRadius: '4px' }} />
        </div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div style={{ padding: '18px' }}>
        <Link href="/orders" style={{ color: 'var(--portal-primary)', textDecoration: 'none', fontSize: '12px' }}>← Suppliers</Link>
        <p style={{ color: '#dc2626', marginTop: '16px', fontSize: '13px' }}>{error || 'Supplier not found.'}</p>
      </div>
    )
  }

  const categories = Array.isArray(supplier.product_categories) ? supplier.product_categories : []

  return (
    <div style={{ paddingBottom: totalItems > 0 ? '80px' : '0' }}>
      {/* Breadcrumb topbar */}
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: '6px', flexShrink: 0 }}>
        <Link href="/orders" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Suppliers</Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{supplier.business_name}</span>
      </div>

      <div style={{ padding: '18px' }}>
        {/* Supplier header card */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '18px', marginBottom: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{supplier.business_name}</div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {supplier.location && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {supplier.location}</span>}
            {supplier.contact_person && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👤 {supplier.contact_person}</span>}
          </div>
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <span key={cat} style={{ background: 'var(--bg)', color: 'var(--portal-primary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>{cat}</span>
              ))}
            </div>
          )}
        </div>

        {/* Catalogue header */}
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Catalogue</div>

        {catalogue.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📦</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '12px', margin: 0 }}>No catalogue items listed.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {catalogue.map(item => (
              <div
                key={item.id}
                style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', padding: '14px', display: 'flex', flexDirection: 'column', opacity: item.is_available === false ? 0.55 : 1 }}
              >
                {item.category && (
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--portal-primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.category}</span>
                )}
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{Number(item.price_per_unit).toFixed(2)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ {item.unit}</span>
                  </div>
                  {item.min_order_quantity > 1 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>Min: {item.min_order_quantity} {item.unit}</div>
                  )}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.is_available === false}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: item.is_available === false ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '11px',
                      background: addedIds.has(item.id) ? 'var(--badge-accepted-bg)' : item.is_available === false ? 'var(--bg)' : 'var(--portal-primary)',
                      color: addedIds.has(item.id) ? 'var(--badge-accepted-text)' : item.is_available === false ? 'var(--text-muted)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.is_available === false ? 'Unavailable' : addedIds.has(item.id) ? '✓ Added' : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--portal-primary)', color: '#fff', borderRadius: '12px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 6px 20px rgba(234,88,12,0.4)', zIndex: 100, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''} · ₹{totalAmount.toFixed(2)}</span>
          <Link href="/cart" style={{ background: '#fff', color: 'var(--portal-primary)', padding: '6px 14px', borderRadius: '7px', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>View Cart →</Link>
        </div>
      )}
    </div>
  )
}
