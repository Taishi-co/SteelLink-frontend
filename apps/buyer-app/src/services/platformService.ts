import api from './api'
import type { ApiResponse } from '@/types'

export interface PlatformStats {
  merchant_count: number
  sku_count: number
  order_count: number
  transaction_amount: number
}

export const platformService = {
  getStats: async () => {
    const response = await api.get<ApiResponse<PlatformStats>, ApiResponse<PlatformStats>>('/platform/stats')
    return response.data
  },
}
