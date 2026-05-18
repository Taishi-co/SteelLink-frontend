import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
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
  authorized_warehouse_ids?: number[]
  authorized_logistics_ids?: number[]
  created_at: string
  updated_at: string
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
  pledge_supervision?: boolean
  finance_certified?: boolean
  status: number
}

export interface AuthorizedWarehouseInfo {
  id: number
  finance_service_id: number
  warehouse_service_id: number
  warehouse_enterprise_id: number
  authorization_type: string
  status: string
  created_at: string
}

export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const financeService = {
  async listMine() {
    const response = await api.get<unknown, ApiResponse<FinanceServiceItem[]>>('/finance-services/mine')
    return response.data
  },

  async listWarehouses() {
    const response = await api.get<unknown, ApiResponse<PageResponse<WarehouseServiceItem>>>('/warehouse-services', {
      params: { page_size: 100, status: 2 },
    })
    return response.data
  },

  async create(payload: Partial<FinanceServiceItem>) {
    const response = await api.post<unknown, ApiResponse<FinanceServiceItem>>('/finance-services', payload)
    return response.data
  },

  async update(id: number, payload: Partial<FinanceServiceItem>) {
    const response = await api.put<unknown, ApiResponse<FinanceServiceItem>>(`/finance-services/${id}`, payload)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete<unknown, ApiResponse<void>>(`/finance-services/${id}`)
    return response.data
  },

  async authorizeWarehouse(id: number, warehouseServiceId: number) {
    const response = await api.post<unknown, ApiResponse<AuthorizedWarehouseInfo>>(`/finance-services/${id}/authorize-warehouse`, {
      warehouse_service_id: warehouseServiceId,
      authorization_type: 'pledge_supervision',
    })
    return response.data
  },

  async revokeWarehouse(authId: number) {
    const response = await api.delete<unknown, ApiResponse<{ id: number; status: string }>>(`/finance-services/authorized-warehouses/${authId}`)
    return response.data
  },

  async listAuthorizedWarehouses(id: number) {
    const response = await api.get<unknown, ApiResponse<{ list: AuthorizedWarehouseInfo[] }>>(`/finance-services/${id}/authorized-warehouses`)
    return response.data
  },
}
