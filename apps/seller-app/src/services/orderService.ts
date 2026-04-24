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

export const sellerOrderService = {
  async list() {
    const response = await api.get<ApiResponse<{ list: SellerOrderInfo[] }>>('/orders?role=seller')
    return response.data.data.list
  },
  async getById(id: number) {
    const response = await api.get<ApiResponse<SellerOrderInfo>>(`/orders/${id}`)
    return response.data.data
  },
  async confirmPayment(id: number) {
    const response = await api.post<ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm-payment`)
    return response.data.data
  },
  async confirmOutbound(id: number) {
    const response = await api.post<ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm-outbound`)
    return response.data.data
  },
}
