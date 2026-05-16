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
  loading_capacity?: string
  business_hours?: string
  pledge_supervision?: boolean
  finance_certified?: boolean
  outbound_voucher_req?: string
  images?: string[]
  certificates?: string[]
  description?: string
  audit_remark?: string
  status: number
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

export const serviceOfferService = {
  listWarehouses: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<WarehouseServiceItem>>>('/warehouse-services', { params }),
  listMyWarehouses: () =>
    api.get<unknown, ApiResponse<WarehouseServiceItem[]>>('/warehouse-services/mine'),
  createWarehouse: (payload: Partial<WarehouseServiceItem>) =>
    api.post<unknown, ApiResponse<WarehouseServiceItem>>('/warehouse-services', payload),
  updateWarehouse: (id: number, payload: Partial<WarehouseServiceItem>) =>
    api.put<unknown, ApiResponse<WarehouseServiceItem>>(`/warehouse-services/${id}`, payload),
  deleteWarehouse: (id: number) =>
    api.delete<unknown, ApiResponse<WarehouseServiceItem>>(`/warehouse-services/${id}`),
  listFinance: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<FinanceServiceItem>>>('/finance-services', { params }),
}
