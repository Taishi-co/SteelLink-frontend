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
  receipt_voucher?: string
  receipt_at?: string
  payment_info?: {
    payment_method: string
    payment_time: string
    transaction_no: string
    payee_account: string
    payer_account: string
    voucher_url: string
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
    const response = await api.get<ApiResponse<{ list: OrderInfo[] }>, ApiResponse<{ list: OrderInfo[] }>>('/orders')
    return response.data
  },
  uploadPaymentVoucher: (
    id: number,
    payload: {
      voucher_url: string
      transaction_no?: string
      payer_account?: string
      payee_account?: string
    },
  ) => api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`orders/${id}/payment-voucher`, payload).then((response) => response.data),
  setDeliveryInfo: (
    id: number,
    payload: {
      driver_name: string
      driver_phone: string
      driver_id_card?: string
      plate_number: string
      warehouse_id?: number
      warehouse_name: string
      address: string
      estimated_time?: string
    },
  ) => api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/delivery-info`, payload).then((response) => response.data),
  confirmReceipt: (id: number, payload: { receipt_voucher: string }) =>
    api.post<ApiResponse<OrderInfo>, ApiResponse<OrderInfo>>(`/orders/${id}/confirm-receipt`, payload).then((response) => response.data),
}
