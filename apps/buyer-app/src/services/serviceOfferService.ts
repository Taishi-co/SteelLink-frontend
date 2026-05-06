import api from './api'
import type { ApiResponse } from '@/types'

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
  images?: string[]
  certificates?: string[]
  description?: string
  status: number
  audit_remark?: string
  created_at: string
  updated_at: string
}

export interface LogisticsServiceItem {
  id: number
  enterprise_id: number
  name: string
  route_start: string
  route_end: string
  service_scope?: string
  vehicle_type?: string
  load_capacity?: number
  price_rule?: string
  images?: string[]
  certificates?: string[]
  description?: string
  status: number
  audit_remark?: string
  created_at: string
  updated_at: string
}

export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const serviceOfferService = {
  listWarehouses: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<WarehouseServiceItem>>>('/warehouse-services', { params }),
  listMyWarehouses: () =>
    api.get<unknown, ApiResponse<WarehouseServiceItem[]>>('/warehouse-services/mine'),
  createWarehouse: (payload: Partial<WarehouseServiceItem>) =>
    api.post<unknown, ApiResponse<WarehouseServiceItem>>('/warehouse-services', payload),
  listLogistics: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<LogisticsServiceItem>>>('/logistics-services', { params }),
  listMyLogistics: () =>
    api.get<unknown, ApiResponse<LogisticsServiceItem[]>>('/logistics-services/mine'),
  createLogistics: (payload: Partial<LogisticsServiceItem>) =>
    api.post<unknown, ApiResponse<LogisticsServiceItem>>('/logistics-services', payload),
}
