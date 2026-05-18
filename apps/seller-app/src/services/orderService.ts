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
  logistics_bidding?: {
    id: number
    order_id: number
    order_no: string
    status: string
    freight_payer: string
    selected_quote_id: number
    buyer_confirmed_quote_id: number
    seller_confirmed_quote_id: number
    created_at: string
    updated_at: string
  }
  logistics_quotes?: LogisticsQuoteInfo[]
  shipment_task?: ShipmentTaskInfo
  financing_info?: FinancingRequestInfo
  pledge_events?: PledgeEventInfo[]
  logistics_contract?: LogisticsContractInfo
  logistics_settlement?: LogisticsSettlementInfo
}

export interface FinancingRequestInfo {
  id: number
  order_id: number
  order_no: string
  requested_amount: number
  approved_amount: number
  term_days: number
  annual_rate: number
  service_fee: number
  status: string
  risk_result?: string
  risk_remark?: string
  debt_contract_no?: string
  debt_contract_url?: string
  buyer_signed_at?: string
  fee_voucher_url?: string
  fee_paid_at?: string
  disbursement_voucher?: string
  disbursed_at?: string
  pledge_voucher_url?: string
  pledge_remark?: string
  pledged_at?: string
  release_condition?: string
  release_reason?: string
  released_at?: string
}

export interface PledgeEventInfo {
  id: number
  event_type: string
  release_amount: number
  condition?: string
  reason?: string
  order_voucher_url?: string
  repayment_voucher_url?: string
  voucher_url?: string
  actor_enterprise_id: number
  created_at: string
}

export interface LogisticsContractInfo {
  contract_no: string
  contract_url?: string
  freight_amount: number
  status: string
  is_financing_order?: boolean
  buyer_signed_at?: string
  logistics_signed_at?: string
  completed_at?: string
}

export interface LogisticsSettlementInfo {
  settlement_no: string
  freight_amount: number
  platform_commission: number
  net_payable: number
  payment_voucher_url?: string
  commission_voucher_url?: string
  status: string
  paid_at?: string
  commission_paid_at?: string
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

export interface LogisticsQuoteInfo {
  id: number
  bidding_id: number
  order_id: number
  logistics_enterprise_id: number
  logistics_name: string
  vehicle_info: string
  driver_info: string
  amount: number
  estimated_pickup_at: string
  estimated_delivery_at: string
  remark: string
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
  async attachContract(id: number, payload: { contract_no?: string; contract_url: string; contract_hash?: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/contract`, payload)
    return response.data
  },
  async confirmOutbound(id: number, payload: { pickup_code: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/confirm-outbound`, payload)
    return response.data
  },
  async createLogisticsBidding(id: number, payload?: { pickup_address?: string; destination_address?: string; requirement?: string; freight_payer?: 'buyer' | 'seller' }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-biddings`, payload || {})
    return response.data
  },
  async closeLogisticsBidding(id: number) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-biddings/close`)
    return response.data
  },
  async reportLogisticsNoCapacity(id: number, payload?: { no_capacity_reason?: string }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-biddings/no-capacity`, payload || {})
    return response.data
  },
  async listLogisticsQuotes(id: number) {
    const response = await api.get<unknown, ApiResponse<{ list: LogisticsQuoteInfo[] }>>(`/orders/${id}/logistics-quotes`)
    return response.data.list
  },
  async selectLogisticsQuote(id: number, payload: { quote_id: number }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-quotes/select`, payload)
    return response.data
  },
  async confirmLogisticsQuote(id: number, payload: { quote_id: number }) {
    const response = await api.post<unknown, ApiResponse<SellerOrderInfo>>(`/orders/${id}/logistics-confirm`, payload)
    return response.data
  },
  async requestPledgeRelease(id: number, payload: { release_amount: number; order_voucher_url: string; repayment_voucher_url: string; reason?: string }) {
    const response = await api.post<unknown, ApiResponse<PledgeEventInfo>>(`/orders/${id}/pledges/release-requests`, payload)
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
