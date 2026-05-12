'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { api } from '@/lib/api'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, supplierIds } = useCart()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <>
        <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Cart · 0 items</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '18px' }}>
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Your cart is empty</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Browse the catalogue to add items</div>
            <Link href="/catalogue" style={{ display: 'inline-block', marginTop: '16px', background: 'var(--portal-primary)', color: '#fff', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>Browse Catalogue</Link>
          </div>
        </div>
      </>
    )
  }

  // Group items by supplier
  const groups = supplierIds.map(sid => ({
    supplierId: sid,
    supplierName: items.find(i => i.supplier_account_id === sid)?.supplier_name ?? sid,
    items: items.filter(i => i.supplier_account_id === sid),
  }))

  const hasMultipleSuppliers = supplierIds.length > 1

  async function handlePlaceOrder(supplierId: string) {
    const groupItems = items.filter(i => i.supplier_account_id === supplierId)
    setPlacing(true)
    setError('')
    try {
      const res = await api.post<{ order: { id: number } }>('/api/orders', {
        supplier_account_id: supplierId,
        items: groupItems.map(i => ({
          catalogue_item_id: i.catalogue_item_id,
          quantity: i.quantity,
        })),
      })
      clearCart()
      router.push(`/orders/${res.order.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.'
      setError(msg)
    } finally {
      setPlacing(false)
    }
  }

  const groupTotal = (sid: string) => {
    return items
      .filter(i => i.supplier_account_id === sid)
      .reduce((sum, i) => sum + i.price_per_unit * i.quantity, 0)
  }

  return (
    <>
      <div style={{ height: '50px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Cart · {totalItems} item{totalItems !== 1 ? 's' : ''} across {groups.length} supplier{groups.length !== 1 ? 's' : ''}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700 }}>C</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px' }}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '9px', padding: '10px 14px', marginBottom: '12px', color: '#991b1b', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {hasMultipleSuppliers && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '9px', padding: '9px 13px', marginBottom: '12px', color: '#92400e', fontSize: '11px', fontWeight: 500 }}>
            Items from {supplierIds.length} suppliers — place separate orders below.
          </div>
        )}

        {groups.map(group => (
          <div key={group.supplierId} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            {/* Group header */}
            <div style={{ padding: '10px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>🏬 {group.supplierName}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Items */}
            {group.items.map(item => (
              <div key={item.catalogue_item_id} style={{ padding: '9px 13px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--bg)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '7px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>₹{item.price_per_unit.toFixed(2)} / {item.unit}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => updateQuantity(item.catalogue_item_id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>−</button>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.catalogue_item_id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--portal-primary)', border: '1px solid var(--portal-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ width: '60px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{(item.price_per_unit * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <button onClick={() => removeItem(item.catalogue_item_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '16px', padding: '4px', flexShrink: 0 }} title="Remove">×</button>
              </div>
            ))}

            {/* Group footer */}
            <div style={{ padding: '10px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Subtotal: ₹{groupTotal(group.supplierId).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => handlePlaceOrder(group.supplierId)}
                disabled={placing}
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '11px', opacity: placing ? 0.6 : 1 }}
              >
                {placing ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
