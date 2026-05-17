import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LogisticsDriver {
  id: number
  enterprise_id: number
  name: string
  phone: string
  id_card: string
  license_no: string
  license_expire_at: string
  qualification_no: string
  qualification_expire_at: string
  status: string
  remark: string
  created_at: string
  updated_at: string
}

export interface LogisticsVehicle {
  id: number
  enterprise_id: number
  plate_number: string
  vehicle_type: string
  load_capacity: number
  vehicle_license: string
  license_expire_at: string
  insurance_no: string
  insurance_expire_at: string
  driver_id: number
  status: string
  remark: string
  created_at: string
  updated_at: string
}

export interface LogisticsDriverPayload {
  name: string
  phone: string
  id_card?: string
  license_no?: string
  license_expire_at?: string
  qualification_no?: string
  qualification_expire_at?: string
  status?: string
  remark?: string
}

export interface LogisticsVehiclePayload {
  plate_number: string
  vehicle_type?: string
  load_capacity?: number
  vehicle_license?: string
  license_expire_at?: string
  insurance_no?: string
  insurance_expire_at?: string
  driver_id?: number
  status?: string
  remark?: string
}

export const fleetService = {
  async listDrivers() {
    const response = await api.get<unknown, ApiResponse<{ list: LogisticsDriver[] }>>('/logistics/drivers')
    return response.data.list
  },

  async createDriver(payload: LogisticsDriverPayload) {
    const response = await api.post<unknown, ApiResponse<LogisticsDriver>>('/logistics/drivers', payload)
    return response.data
  },

  async updateDriver(id: number, payload: LogisticsDriverPayload) {
    const response = await api.put<unknown, ApiResponse<LogisticsDriver>>(`/logistics/drivers/${id}`, payload)
    return response.data
  },

  async listVehicles() {
    const response = await api.get<unknown, ApiResponse<{ list: LogisticsVehicle[] }>>('/logistics/vehicles')
    return response.data.list
  },

  async createVehicle(payload: LogisticsVehiclePayload) {
    const response = await api.post<unknown, ApiResponse<LogisticsVehicle>>('/logistics/vehicles', payload)
    return response.data
  },

  async updateVehicle(id: number, payload: LogisticsVehiclePayload) {
    const response = await api.put<unknown, ApiResponse<LogisticsVehicle>>(`/logistics/vehicles/${id}`, payload)
    return response.data
  },
}
