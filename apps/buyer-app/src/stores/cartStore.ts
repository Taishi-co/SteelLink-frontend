import { create } from 'zustand'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  addItem: (item) => {
    const items = get().items
    const existingIndex = items.findIndex((i) => i.productId === item.productId)

    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += item.quantity
      set({ items: newItems, totalItems: get().totalItems + item.quantity })
    } else {
      set({ items: [...items, item], totalItems: get().totalItems + item.quantity })
    }
  },
  removeItem: (productId) => {
    const items = get().items
    const item = items.find((i) => i.productId === productId)
    if (item) {
      set({
        items: items.filter((i) => i.productId !== productId),
        totalItems: get().totalItems - item.quantity,
      })
    }
  },
  updateQuantity: (productId, quantity) => {
    const items = get().items
    const index = items.findIndex((i) => i.productId === productId)
    if (index >= 0) {
      const diff = quantity - items[index].quantity
      const newItems = [...items]
      newItems[index].quantity = quantity
      set({ items: newItems, totalItems: get().totalItems + diff })
    }
  },
  clearCart: () => set({ items: [], totalItems: 0 }),
}))
