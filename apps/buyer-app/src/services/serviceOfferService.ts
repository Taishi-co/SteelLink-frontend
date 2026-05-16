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
  loading_capacity?: string
  business_hours?: string
  pledge_supervision?: boolean
  finance_certified?: boolean
  outbound_voucher_req?: string
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
  quote_rules?: Record<string, object | undefined>
  fleet_name?: string
  vehicle_certs?: string[]
  driver_certs?: string[]
  images?: string[]
  certificates?: string[]
  description?: string
  status: number
  audit_remark?: string
  created_at: string
  updated_at: string
}

export interface FinanceServiceItem {
  id: number
  enterprise_id: number
  name: string
  finance_type?: string
  min_amount?: number
  max_amount?: number
  term_days?: number
  annual_rate?: number
  fee_rule?: string
  risk_control_rule?: string
  required_documents?: string[]
  supported_scenarios?: string[]
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
  getWarehouse: (id: number) =>
    api.get<unknown, ApiResponse<WarehouseServiceItem>>(`/warehouse-services/${id}`),
  listMyWarehouses: () =>
    api.get<unknown, ApiResponse<WarehouseServiceItem[]>>('/warehouse-services/mine'),
  createWarehouse: (payload: Partial<WarehouseServiceItem>) =>
    api.post<unknown, ApiResponse<WarehouseServiceItem>>('/warehouse-services', payload),
  updateWarehouse: (id: number, payload: Partial<WarehouseServiceItem>) =>
    api.put<unknown, ApiResponse<WarehouseServiceItem>>(`/warehouse-services/${id}`, payload),
  deleteWarehouse: (id: number) =>
    api.delete<unknown, ApiResponse<WarehouseServiceItem>>(`/warehouse-services/${id}`),
  listLogistics: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<LogisticsServiceItem>>>('/logistics-services', { params }),
  getLogistics: (id: number) =>
    api.get<unknown, ApiResponse<LogisticsServiceItem>>(`/logistics-services/${id}`),
  listMyLogistics: () =>
    api.get<unknown, ApiResponse<LogisticsServiceItem[]>>('/logistics-services/mine'),
  createLogistics: (payload: Partial<LogisticsServiceItem>) =>
    api.post<unknown, ApiResponse<LogisticsServiceItem>>('/logistics-services', payload),
  updateLogistics: (id: number, payload: Partial<LogisticsServiceItem>) =>
    api.put<unknown, ApiResponse<LogisticsServiceItem>>(`/logistics-services/${id}`, payload),
  deleteLogistics: (id: number) =>
    api.delete<unknown, ApiResponse<LogisticsServiceItem>>(`/logistics-services/${id}`),
  listFinance: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<FinanceServiceItem>>>('/finance-services', { params }),
  listFinanceAvailableForOrder: (orderId: number) =>
    api.get<unknown, ApiResponse<{ order_id: number; list: FinanceServiceItem[] }>>(`/finance-services/available-for-order/${orderId}`),
  listMyFinance: () =>
    api.get<unknown, ApiResponse<FinanceServiceItem[]>>('/finance-services/mine'),
  createFinance: (payload: Partial<FinanceServiceItem>) =>
    api.post<unknown, ApiResponse<FinanceServiceItem>>('/finance-services', payload),
}
