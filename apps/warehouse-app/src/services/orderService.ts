import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface OrderItem {
  product_id: number
  product_no: string
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
}

export interface OrderInfo {
  id: number
  order_no: string
  buyer_id: number
  buyer_name: string
  seller_id: number
  seller_name: string
  items: OrderItem[]
  total_quantity: number
  total_amount: number
  status: number
  created_at: string
  delivery_info?: {
    warehouse_id: number
    warehouse_name: string
    warehouse_code?: string
    warehouse_address?: string
    address: string
  }
}

export interface OrderEventInfo {
  id: number
  event_type: string
  actor_user_id: number
  actor_service: string
  from_status: number
  to_status: number
  payload?: Record<string, unknown>
  created_at: string
}

export interface WarehouseMovement {
  id: number
  warehouse_service_id: number
  product_id: number
  product_name: string
  order_id: number
  order_no: string
  movement_type: 'inbound' | 'outbound'
  quantity: number
  status: string
  scheduled_at?: string
  remark?: string
  created_at: string
}

export const warehouseOrderService = {
  async listPending() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>('/orders?status=12&role=warehouse')
    return response.data.list
  },

  async listAll() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>('/orders?role=warehouse')
    return response.data.list
  },

  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },

  async warehouseConfirm(id: number, payload?: { confirmed: boolean; condition_note?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${id}/warehouse-confirm`, payload || {})
    return response.data
  },

  async listEvents(id: number) {
    const response = await api.get<unknown, ApiResponse<{ list: OrderEventInfo[] }>>(`/orders/${id}/events`)
    return response.data.list
  },
}

export const warehouseMovementService = {
  async list() {
    const response = await api.get<unknown, ApiResponse<{ list: WarehouseMovement[] }>>('/warehouse-movements')
    return response.data.list
  },

  async create(payload: {
    warehouse_service_id: number
    product_id?: number
    product_name?: string
    order_id?: number
    order_no?: string
    movement_type: 'inbound' | 'outbound'
    quantity: number
    scheduled_at?: string
    remark?: string
  }) {
    const response = await api.post<unknown, ApiResponse<WarehouseMovement>>('/warehouse-movements', payload)
    return response.data
  },

  async updateStatus(id: number, payload: { status: string; remark?: string }) {
    const response = await api.put<unknown, ApiResponse<WarehouseMovement>>(`/warehouse-movements/${id}/status`, payload)
    return response.data
  },
}
