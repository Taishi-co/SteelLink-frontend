import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface SellerOrderItem {
  product_id: number
  product_no: string
  product_name: string
  steel_mill: string
  category: string
  bundle_no: string
  quantity: number
  unit_price: number
  total_amount: number
  tax_rate: number
  tax_amount: number
}

export interface SellerOrderInfo {
  id: number
  order_no: string
  buyer_id: number
  buyer_name: string
  seller_id: number
  seller_name: string
  items: SellerOrderItem[]
  total_quantity: number
  total_amount: number
  tax_total_amount: number
  currency: string
  status: number
  expires_at?: string
  created_at: string
  contract_info?: {
    contract_no?: string
    contract_url?: string
    contract_hash?: string
    sign_status?: string
    buyer_signed: boolean
    seller_signed: boolean
    signed_at?: string
  }
  receipt_voucher?: string
  receipt_info?: VoucherEvidence
  receipt_at?: string
  timeline?: SellerOrderTimelineItem[]
  payment_info?: {
    payment_method: string
    payment_time: string
    transaction_no: string
    payee_account: string
    payer_account: string
    voucher_url: string
    uploaded_by: number
    uploaded_at: string
    captured_at?: string
    gps_latitude?: number
    gps_longitude?: number
  }
  delivery_info?: {
    driver_name: string
    driver_phone: string
    driver_id_card: string
    plate_number: string
    pickup_code: string
    warehouse_id: number
    warehouse_name: string
    address: string
    estimated_time: string
  }
}

export interface VoucherEvidence {
  voucher_url: string
  uploaded_by: number
  uploaded_at: string
  captured_at?: string
  gps_latitude?: number
  gps_longitude?: number
}

export interface SellerOrderTimelineItem {
  key: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'skipped' | string
  time?: string
  description?: string
}

export interface SellerOrderEventInfo {
  id: number
  event_type: string
  actor_user_id: number
  actor_enterprise_id: number
  actor_service: string
  from_status: number
  to_status: number
  payload?: Record<string, unknown>
  created_at: string
}

export const sellerOrderService = {
  async list() {
    const response = await api.get<unknown, ApiResponse<{ list: SellerOrderInfo[] }>>('/orders?role=seller')
    return response.data.list
  },
  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}`)
    return response.data
  },
  async confirmPayment(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm-payment`)
    return response.data
  },
  async confirmOrder(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm`)
    return response.data
  },
  async sellerConfirm(id: number, payload?: { terms_note?: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/seller-confirm`, payload || {})
    return response.data
  },
  async signContract(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/sign-contract`)
    return response.data
  },
  async confirmOutbound(id: number, payload: { pickup_code: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm-outbound`, payload)
    return response.data
  },
  async createLogisticsBidding(id: number, payload?: { pickup_address?: string; destination_address?: string; requirement?: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-biddings`, payload || {})
    return response.data
  },
  async confirmLogisticsQuote(id: number, payload: { quote_id: number }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-confirm`, payload)
    return response.data
  },
  async reconcile(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/reconcile`)
    return response.data
  },
  async archive(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/archive`)
    return response.data
  },
  async listEvents(id: number) {
    const response = await api.get<unknown, ApiResponse<{ list: SellerOrderEventInfo[] }>>(`/orders/${id}/events`)
    return response.data.list
  },
}
