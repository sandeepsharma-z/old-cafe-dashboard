'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: number
  catalogue_item_id: number
  name: string
  unit: string
  price_per_unit: number
  quantity: number
  supplier_account_id: string
  supplier_name: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (catalogue_item_id: number) => void
  updateQuantity: (catalogue_item_id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
  supplierIds: string[]  // unique supplier IDs in cart
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.catalogue_item_id === item.catalogue_item_id)
      if (existing) {
        return prev.map(i =>
          i.catalogue_item_id === item.catalogue_item_id
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        )
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }]
    })
  }, [])

  const removeItem = useCallback((catalogue_item_id: number) => {
    setItems(prev => prev.filter(i => i.catalogue_item_id !== catalogue_item_id))
  }, [])

  const updateQuantity = useCallback((catalogue_item_id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.catalogue_item_id !== catalogue_item_id))
    } else {
      setItems(prev =>
        prev.map(i => i.catalogue_item_id === catalogue_item_id ? { ...i, quantity } : i)
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + i.price_per_unit * i.quantity, 0)
  const supplierIds = [...new Set(items.map(i => i.supplier_account_id))]

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount, supplierIds }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
