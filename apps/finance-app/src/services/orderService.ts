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
  financing_info?: {
    id: number
    finance_service_id: number
    requested_amount: number
    approved_amount?: number
    risk_result?: string
    risk_score?: number
    risk_remark?: string
    debt_contract_url?: string
    fee_voucher_url?: string
    disbursed_amount?: number
    disbursed_at?: string
    status: string
  }
}

export const financeOrderService = {
  async listFinancing() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>('/orders?status=21&role=finance')
    return response.data.list
  },

  async listPendingDebt() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>('/orders?status=22&role=finance')
    return response.data.list
  },

  async listAll() {
    const response = await api.get<unknown, ApiResponse<{ list: OrderInfo[] }>>('/orders?role=finance')
    return response.data.list
  },

  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },

  async submitRiskResult(orderId: number, payload: { approved: boolean; approved_amount?: number; risk_score?: number; risk_remark?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${orderId}/financing-requests/risk-result`, payload)
    return response.data
  },

  async generateDebtContract(orderId: number, payload?: { contract_url?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${orderId}/financing-requests/debt-contract`, payload || {})
    return response.data
  },

  async disburse(orderId: number, payload?: { disbursed_amount?: number; transaction_no?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${orderId}/financing-requests/disburse`, payload || {})
    return response.data
  },

  async recordPledge(orderId: number, payload: { pledge_type: string; collateral_description: string; estimated_value?: number }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${orderId}/pledges`, payload)
    return response.data
  },

  async releasePledge(orderId: number, payload?: { release_remark?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo>>(`/orders/${orderId}/pledges/release`, payload || {})
    return response.data
  },
}
