import { create } from 'zustand'
import { cartService } from '@/services/cartService'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  isLoading: boolean
  error: string | null
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await cartService.getItems()
      const items = response.data.list
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      set({ items, totalItems, isLoading: false })
    } catch (error: any) {
      set({ error: error.message || '获取购物车失败', isLoading: false })
    }
  },

  addItem: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.addItem({ product_id: productId, quantity })
      await get().fetchCart()
    } catch (error: any) {
      set({ error: error.message || '加入购物车失败', isLoading: false })
      throw error
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.updateItem(itemId, { quantity })
      await get().fetchCart()
    } catch (error: any) {
      set({ error: error.message || '更新购物车失败', isLoading: false })
      throw error
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.removeItem(itemId)
      await get().fetchCart()
    } catch (error: any) {
      set({ error: error.message || '删除购物车商品失败', isLoading: false })
      throw error
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null })
    try {
      await cartService.clearCart()
      set({ items: [], totalItems: 0, isLoading: false })
    } catch (error: any) {
      set({ error: error.message || '清空购物车失败', isLoading: false })
      throw error
    }
  },
}))
