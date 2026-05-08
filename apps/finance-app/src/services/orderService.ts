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
    order_id: number
    order_no: string
    buyer_enterprise_id: number
    seller_enterprise_id: number
    finance_service_id: number
    funding_enterprise_id: number
    requested_amount: number
    approved_amount?: number
    term_days?: number
    annual_rate?: number
    service_fee?: number
    risk_result?: string
    risk_remark?: string
    buyer_confirmed_at?: string
    debt_contract_no?: string
    debt_contract_url?: string
    debt_contract_hash?: string
    buyer_signed_at?: string
    fee_voucher_url?: string
    fee_paid_at?: string
    funding_commission?: number
    commission_voucher?: string
    commission_paid_at?: string
    disbursement_voucher?: string
    disbursed_at?: string
    pledge_voucher_url?: string
    release_condition?: string
    status: string
  }
}

export type FinancingRequestInfo = NonNullable<OrderInfo['financing_info']>

const withOrderDetails = async (requests: FinancingRequestInfo[]) => {
  const orders = await Promise.all(
    requests.map(async (financing) => {
      const order = await financeOrderService.getById(financing.order_id)
      return { ...order, financing_info: financing }
    })
  )
  return orders
}

export const financeOrderService = {
  async listFinancing() {
    const list = await this.listAll()
    return list.filter((item) => item.financing_info?.status === 'submitted')
  },

  async listPendingDebt() {
    const list = await this.listAll()
    return list.filter((item) => ['buyer_confirmed', 'contract_generated', 'buyer_signed_fee_paid'].includes(item.financing_info?.status || ''))
  },

  async listAll() {
    const response = await api.get<unknown, ApiResponse<{ list: FinancingRequestInfo[] }>>('/orders/financing-requests/mine')
    return withOrderDetails(response.data.list || [])
  },

  async getById(id: number) {
    const response = await api.get<unknown, ApiResponse<OrderInfo>>(`/orders/${id}`)
    return response.data
  },

  async submitRiskResult(orderId: number, payload: { approved: boolean; approved_amount?: number; term_days?: number; annual_rate?: number; service_fee?: number; risk_remark?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/financing-requests/risk-result`, payload)
    return response.data
  },

  async generateDebtContract(orderId: number, payload: { debt_contract_no?: string; debt_contract_url: string; debt_contract_hash?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/financing-requests/debt-contract`, payload)
    return response.data
  },

  async disburse(orderId: number, payload: { disbursement_voucher: string; funding_commission?: number; commission_voucher: string; remark?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/financing-requests/disburse`, payload)
    return response.data
  },

  async recordPledge(orderId: number, payload: { pledge_voucher_url: string; release_condition: string; pledge_remark?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/pledges`, payload)
    return response.data
  },

  async releasePledge(orderId: number, payload: { reason: string; voucher_url?: string }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/pledges/release`, payload)
    return response.data
  },
}
