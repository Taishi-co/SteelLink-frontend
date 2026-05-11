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

export interface ShipmentTaskInfo {
  id: number
  order_id: number
  order_no: string
  logistics_enterprise_id: number
  logistics_quote_id: number
  status: 'pending_pickup' | 'picked_up' | 'delivered' | 'signed'
  pickup_voucher?: string
  delivery_voucher?: string
  signature_voucher?: string
  picked_up_at?: string
  delivered_at?: string
  signed_at?: string
  created_at: string
  updated_at: string
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
    address: string
    warehouse_name: string
  }
  logistics_bidding?: {
    id: number
    pickup_address?: string
    destination_address?: string
    requirement?: string
    quotes?: LogisticsQuote[]
    selected_quote_id?: number
  }
  shipment_task?: ShipmentTaskInfo
}

export interface LogisticsQuote {
  id: number
  logistics_service_id: number
  order_id: number
  price: number
  estimated_days: number
  remark?: string
  created_at: string
}

export interface LogisticsOrder {
  id: number
  order_id: number
  order_no: string
  logistics_service_id: number
  origin: string
  destination: string
  cargo_name: string
  weight: number
  vehicle_type?: string
  status: string
  current_responsible_party?: string
  handover_note?: string
  pickup_appointment_at?: string
  arrival_signed_in_at?: string
  outbound_confirmed_at?: string
  loading_confirmed_at?: string
  arrival_confirmed_at?: string
  receipt_signed_at?: string
  inbound_completed_at?: string
  driver_name?: string
  driver_phone?: string
  plate_number?: string
  created_at: string
}

export interface EstimateResult {
  logistics_service_id: number
  origin: string
  destination: string
  weight: number
  unit_price: number
  estimated_price: number
  price_rule: string
}

export const logisticsOrderService = {
  async listBidding() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>(
      '/orders?status=16&role=logistics'
    )
    return response.data.list
  },

  async listAll() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>(
      '/orders?role=logistics'
    )
    return response.data.list
  },

  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },

  async createQuote(
    orderId: number,
    payload: {
      vehicle_info: string
      driver_info: string
      amount: number
      estimated_delivery_at?: string
      remark?: string
    }
  ) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(
      `/orders/${orderId}/logistics-quotes`,
      payload
    )
    return response.data
  },

  async shipmentProgress(orderId: number, action: string, payload?: Record<string, unknown>) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(
      `/orders/${orderId}/shipments/${action}`,
      payload || {}
    )
    return response.data
  },

  async confirmLogisticsQuote(orderId: number, quoteId: number) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(
      `/orders/${orderId}/logistics-confirm`,
      { quote_id: quoteId }
    )
    return response.data
  },
}

export const logisticsFulfillmentService = {
  async estimate(payload: {
    logistics_service_id: number
    origin?: string
    destination: string
    weight: number
  }) {
    const response = await api.post<unknown, ApiResponse<EstimateResult>>(
      '/logistics/estimate',
      payload
    )
    return response.data
  },

  async listOrders() {
    const response = await api.get<unknown, ApiResponse<{ list: LogisticsOrder[] }>>(
      '/logistics/orders'
    )
    return response.data.list
  },

  async createOrder(payload: {
    order_id?: number
    order_no?: string
    logistics_service_id: number
    origin: string
    destination: string
    cargo_name?: string
    weight: number
    vehicle_type?: string
  }) {
    const response = await api.post<unknown, ApiResponse<LogisticsOrder>>(
      '/logistics/orders',
      payload
    )
    return response.data
  },

  async acceptOrder(
    id: number,
    payload?: { vehicle_type?: string; driver_name?: string; driver_phone?: string }
  ) {
    const response = await api.post<unknown, ApiResponse<LogisticsOrder>>(
      `/logistics/orders/${id}/accept`,
      payload || {}
    )
    return response.data
  },

  async updateOrderStatus(id: number, payload: { status: string }) {
    const response = await api.put<unknown, ApiResponse<LogisticsOrder>>(
      `/logistics/orders/${id}/status`,
      payload
    )
    return response.data
  },

  async addTrackingEvent(
    id: number,
    payload: { event_type: string; description: string; location?: string }
  ) {
    const response = await api.post<unknown, ApiResponse<unknown>>(
      `/logistics/orders/${id}/tracking-events`,
      payload
    )
    return response.data
  },
}
