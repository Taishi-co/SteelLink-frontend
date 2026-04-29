import { create } from 'zustand'
import { favoriteService } from '@/services/favoriteService'
import type { Favorite } from '@/types'

interface FavoriteState {
  items: Favorite[]
  totalCount: number
  isLoading: boolean
  error: string | null
  fetchFavorites: () => Promise<void>
  addFavorite: (productId: number) => Promise<void>
  removeFavorite: (id: number) => Promise<void>
  removeByProduct: (productId: number) => Promise<void>
  checkFavorite: (productId: number) => Promise<boolean>
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  items: [],
  totalCount: 0,
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoriteService.getList()
      const items = response.data.list
      set({ items, totalCount: items.length, isLoading: false })
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '获取收藏夹失败'), isLoading: false })
    }
  },

  addFavorite: async (productId: number) => {
    set({ isLoading: true, error: null })
    try {
      await favoriteService.add({ product_id: productId })
      await get().fetchFavorites()
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '添加收藏失败'), isLoading: false })
      throw error
    }
  },

  removeFavorite: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await favoriteService.remove(id)
      await get().fetchFavorites()
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '删除收藏失败'), isLoading: false })
      throw error
    }
  },

  removeByProduct: async (productId: number) => {
    set({ isLoading: true, error: null })
    try {
      await favoriteService.removeByProduct(productId)
      await get().fetchFavorites()
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, '删除收藏失败'), isLoading: false })
      throw error
    }
  },

  checkFavorite: async (productId: number) => {
    try {
      return await favoriteService.check(productId)
    } catch {
      return false
    }
  },
}))
