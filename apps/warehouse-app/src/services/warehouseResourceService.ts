import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface WarehouseResource {
  id: number
  enterprise_id: number
  warehouse_name: string
  province: string
  city: string
  district: string
  address: string
  capacity: number
  available_capacity: number
  service_types: string[]
  price_rule: string
  loading_capacity: string
  business_hours: string
  pledge_supervision: boolean
  outbound_voucher_req: string
  images: string[]
  certificates: string[]
  description: string
  status: number
  audit_remark: string
  created_at: string
  updated_at: string
}

export interface WarehouseResourcePayload {
  warehouse_name: string
  province?: string
  city?: string
  district?: string
  address: string
  capacity?: number
  available_capacity?: number
  service_types?: string[]
  price_rule?: string
  loading_capacity?: string
  business_hours?: string
  pledge_supervision?: boolean
  outbound_voucher_req?: string
  images?: string[]
  certificates?: string[]
  description?: string
}

export const warehouseResourceService = {
  async listMine() {
    const response = await api.get<unknown, ApiResponse<WarehouseResource[]>>('/warehouse-services/mine')
    return response.data
  },

  async create(payload: WarehouseResourcePayload) {
    const response = await api.post<unknown, ApiResponse<WarehouseResource>>('/warehouse-services', payload)
    return response.data
  },

  async update(id: number, payload: Partial<WarehouseResourcePayload>) {
    const response = await api.put<unknown, ApiResponse<WarehouseResource>>(`/warehouse-services/${id}`, payload)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete<unknown, ApiResponse<void>>(`/warehouse-services/${id}`)
    return response.data
  },
}
