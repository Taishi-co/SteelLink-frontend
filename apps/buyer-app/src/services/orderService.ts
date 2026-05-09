import api from './api'
import type { ApiResponse } from '@/types'

export interface CreateOrderPayload {
  product_id: number
  quantity: number
}

export interface OrderItem {
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
  timeline?: OrderTimelineItem[]
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
    warehouse_service_id?: number
    warehouse_enterprise_id?: number
    warehouse_name: string
    warehouse_code?: string
    warehouse_province?: string
    warehouse_city?: string
    warehouse_district?: string
    warehouse_address?: string
    address: string
    estimated_time: string
  }
  remark?: Record<string, unknown>
  financing_info?: FinancingRequestInfo
}

export interface FinancingRequestInfo {
  id: number
  order_id: number
  order_no: string
  finance_service_id: number
  funding_enterprise_id: number
  requested_amount: number
  approved_amount: number
  term_days: number
  annual_rate: number
  status: string
}

export interface VoucherEvidence {
  voucher_url: string
  uploaded_by: number
  uploaded_at: string
  captured_at?: string
  gps_latitude?: number
  gps_longitude?: number
}

export interface OrderTimelineItem {
  key: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'skipped' | string
  time?: string
  description?: string
}

export interface OrderEventInfo {
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

export interface WarehouseOrderInfo {
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

export const warehouseOrderService = {
  listPending: async () => {
    const response = await api.get<ApiResponse<{ list: WarehouseOrderInfo[] }>, ApiResponse<{ list: WarehouseOrderInfo[] }>>('/orders?status=12&role=warehouse')
    return response.data.list
  },
  listAll: async () => {
    const response = await api.get<ApiResponse<{ list: WarehouseOrderInfo[] }>, ApiResponse<{ list: WarehouseOrderInfo[] }>>('/orders?role=warehouse')
    return response.data.list
  },
  warehouseConfirm: async (id: number, payload?: { confirmed: boolean; condition_note?: string }) => {
    const response = await api.post<ApiResponse<WarehouseOrderInfo>, ApiResponse<WarehouseOrderInfo>>(`/orders/${id}/warehouse-confirm`, payload || {})
    return response.data
  },
}

export const orderService = {
  create: async (payload: CreateOrderPayload) => {
    const response = await api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>('/orders', payload)
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },
  list: async () => {
    const response = await api.get<ApiResponse<{ list: OrderInfo[] }>, ApiResponse<{ list: OrderInfo[] }>>('/orders?role=buyer')
    return response.data
  },
  cancel: (id: number) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/cancel`).then((response) => response.data),
  signContract: (id: number) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/sign-contract`).then((response) => response.data),
  attachContract: (id: number, payload: { contract_no?: string; contract_url: string; contract_hash?: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/contract`, payload).then((response) => response.data),
  uploadPaymentVoucher: (
    id: number,
    payload: {
      voucher_url: string
      transaction_no?: string
      payer_account?: string
      payee_account?: string
      captured_at?: string
      gps_latitude?: number
      gps_longitude?: number
    },
  ) => api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`orders/${id}/payment-voucher`, payload).then((response) => response.data),
  directPayment: (
    id: number,
    payload: {
      voucher_url: string
      transaction_no?: string
      payer_account?: string
      payee_account?: string
      title_voucher_url: string
      title_remark?: string
      captured_at?: string
      gps_latitude?: number
      gps_longitude?: number
    },
  ) => api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/payments/direct`, payload).then((response) => response.data),
  reselectWarehouse: (id: number, payload: { warehouse_service_id: number; confirm_note?: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/warehouse-selection`, payload).then((response) => response.data),
  buyerConfirm: (id: number, payload?: { confirm_note?: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/buyer-confirm`, payload || {}).then((response) => response.data),
  setDeliveryInfo: (
    id: number,
    payload: {
      driver_name: string
      driver_phone: string
      driver_id_card?: string
      plate_number: string
      warehouse_id?: number
      warehouse_service_id?: number
      warehouse_name: string
      address: string
      estimated_time?: string
    },
  ) => api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/delivery-info`, payload).then((response) => response.data),
  confirmReceipt: (id: number, payload: { receipt_voucher: string; captured_at?: string; gps_latitude?: number; gps_longitude?: number }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/receipts/confirm`, payload).then((response) => response.data),
  createFinancingRequest: (id: number, payload: { finance_service_id: number; requested_amount?: number }) =>
    api.post<ApiResponse<FinancingRequestInfo>, ApiResponse<FinancingRequestInfo>>(`/orders/${id}/financing-requests`, payload).then((response) => response.data),
  buyerConfirmFinancing: (id: number, payload: { confirmed: boolean; remark?: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/financing-requests/buyer-confirm`, payload).then((response) => response.data),
  buyerSignDebtAndPayFee: (id: number, payload: { fee_voucher_url: string; remark?: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/financing-requests/debt-sign`, payload).then((response) => response.data),
  confirmLogisticsQuote: (id: number, payload: { quote_id: number }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/logistics-confirm`, payload).then((response) => response.data),
  listEvents: async (id: number) => {
    const response = await api.get<ApiResponse<{ list: OrderEventInfo[] }>, ApiResponse<{ list: OrderEventInfo[] }>>(`/orders/${id}/events`)
    return response.data
  },
}
