import api from './api'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export interface WarehouseServiceItem {
  id: number
  enterprise_id: number
  warehouse_name: string
  province?: string
  city?: string
  district?: string
  address?: string
  capacity?: number
  available_capacity?: number
  service_types?: string[]
  price_rule?: string
  description?: string
  status: number
  created_at: string
  updated_at: string
}

export const serviceOfferService = {
  listWarehouses: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<WarehouseServiceItem>>>('/warehouse-services', { params }),
}
