import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LogisticsResource {
  id: number
  enterprise_id: number
  name: string
  route_start: string
  route_end: string
  service_scope: string
  vehicle_type: string
  load_capacity: number
  price_rule: string
  quote_rules: Record<string, unknown>
  fleet_name: string
  vehicle_certs: string[]
  driver_certs: string[]
  images: string[]
  certificates: string[]
  description: string
  status: number
  audit_remark: string
  created_at: string
  updated_at: string
}

export interface LogisticsResourcePayload {
  name: string
  route_start: string
  route_end: string
  service_scope?: string
  vehicle_type?: string
  load_capacity?: number
  price_rule?: string
  quote_rules?: Record<string, unknown>
  fleet_name?: string
  vehicle_certs?: string[]
  driver_certs?: string[]
  images?: string[]
  certificates?: string[]
  description?: string
}

export const logisticsResourceService = {
  async listMine() {
    const response = await api.get<unknown, ApiResponse<LogisticsResource[]>>('/logistics-services/mine')
    return response.data
  },

  async create(payload: LogisticsResourcePayload) {
    const response = await api.post<unknown, ApiResponse<LogisticsResource>>('/logistics-services', payload)
    return response.data
  },

  async update(id: number, payload: Partial<LogisticsResourcePayload>) {
    const response = await api.put<unknown, ApiResponse<LogisticsResource>>(`/logistics-services/${id}`, payload)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete<unknown, ApiResponse<void>>(`/logistics-services/${id}`)
    return response.data
  },
}
