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
  tax_total_amount?: number
  currency?: string
  status: number
  created_at: string
  remark?: Record<string, unknown>
  delivery_info?: {
    warehouse_id: number
    warehouse_service_id?: number
    warehouse_enterprise_id?: number
    warehouse_name: string
    warehouse_code?: string
    warehouse_province?: string
    warehouse_city?: string
    warehouse_district?: string
    warehouse_address?: string
    address: string
  }
}

export interface OrderEventInfo {
  id: number
  event_type: string
  actor_user_id: number
  actor_enterprise_id?: number
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

export interface WarehouseInventorySnapshot {
  id: number
  snapshot_no: string
  warehouse_service_id: number
  warehouse_enterprise_id: number
  product_name: string
  bundle_no: string
  batch_no: string
  location_code: string
  quantity: number
  frozen_quantity: number
  quality_status: string
  pledge_status: string
  external_system: string
  external_ref_no: string
  sync_status: string
  remark: string
  created_at: string
  updated_at: string
}

export interface WarehouseInventorySnapshotPayload {
  warehouse_service_id: number
  product_name: string
  bundle_no?: string
  batch_no?: string
  location_code?: string
  quantity: number
  frozen_quantity?: number
  quality_status?: string
  pledge_status?: string
  external_system?: string
  external_ref_no?: string
  sync_status?: string
  remark?: string
}

export interface LogisticsOrder {
  id: number
  order_id: number
  order_no: string
  origin: string
  destination: string
  cargo_name: string
  weight: number
  status: string
  current_responsible_party?: string
  warehouse_service_id: number
  created_at: string
}

export interface FulfillmentDocumentPayload {
  doc_type: string
  file_url: string
  remark?: string
  gps_latitude?: number
  gps_longitude?: number
  captured_at?: string
}

export const warehouseOrderService = {
  async listPending() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>(
      '/orders?status=13&role=warehouse'
    )
    return response.data.list
  },

  async listAll() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>(
      '/orders?role=warehouse'
    )
    return response.data.list
  },

  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },

  async warehouseConfirm(id: number, payload?: { confirmed: boolean; condition_note?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(
      `/orders/${id}/warehouse-confirm`,
      payload || {}
    )
    return response.data
  },

  async listEvents(id: number) {
    const response = await api.get<unknown, ApiResponse<{ list: OrderEventInfo[] }>>(
      `/orders/${id}/events`
    )
    return response.data.list
  },
}

export const warehouseMovementService = {
  async list() {
    const response = await api.get<unknown, ApiResponse<{ list: WarehouseMovement[] }>>(
      '/warehouse-movements'
    )
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
    const response = await api.post<unknown, ApiResponse<WarehouseMovement>>(
      '/warehouse-movements',
      payload
    )
    return response.data
  },

  async updateStatus(id: number, payload: { status: string; remark?: string }) {
    const response = await api.put<unknown, ApiResponse<WarehouseMovement>>(
      `/warehouse-movements/${id}/status`,
      payload
    )
    return response.data
  },
}

export const warehouseInventoryService = {
  async list() {
    const response = await api.get<unknown, ApiResponse<{ list: WarehouseInventorySnapshot[] }>>(
      '/warehouse-inventory-snapshots'
    )
    return response.data.list
  },

  async create(payload: WarehouseInventorySnapshotPayload) {
    const response = await api.post<unknown, ApiResponse<WarehouseInventorySnapshot>>(
      '/warehouse-inventory-snapshots',
      payload
    )
    return response.data
  },

  async update(id: number, payload: WarehouseInventorySnapshotPayload) {
    const response = await api.put<unknown, ApiResponse<WarehouseInventorySnapshot>>(
      `/warehouse-inventory-snapshots/${id}`,
      payload
    )
    return response.data
  },
}

export const warehouseLogisticsService = {
  async listOrders() {
    const response = await api.get<unknown, ApiResponse<{ list: LogisticsOrder[] }>>(
      '/logistics/orders?role=warehouse'
    )
    return response.data.list
  },

  async updateStatus(id: number, payload: { status: string; remark?: string }) {
    const response = await api.put<unknown, ApiResponse<LogisticsOrder>>(
      `/logistics/orders/${id}/status`,
      payload
    )
    return response.data
  },

  async uploadDocument(id: number, payload: FulfillmentDocumentPayload) {
    const response = await api.post<unknown, ApiResponse<unknown>>(
      `/logistics/orders/${id}/documents`,
      payload
    )
    return response.data
  },
}
