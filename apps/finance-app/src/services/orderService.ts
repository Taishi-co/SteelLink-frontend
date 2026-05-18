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
  pledge_events?: PledgeEventInfo[]
}

export type FinancingRequestInfo = NonNullable<OrderInfo['financing_info']>

export interface PledgeEventInfo {
  id: number
  event_type: string
  release_amount: number
  reason?: string
  order_voucher_url?: string
  repayment_voucher_url?: string
  voucher_url?: string
  created_at: string
}

export interface WarehouseInventorySnapshotInfo {
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

export interface FulfillmentDocumentInfo {
  id: number
  logistics_order_id: number
  order_id: number
  doc_type: string
  file_url: string
  remark: string
  gps_latitude?: number
  gps_longitude?: number
  captured_at?: string
  uploaded_by: number
  enterprise_id: number
  uploaded_role: string
  created_at: string
}

export interface CollateralMonitorInfo {
  financing_request_id: number
  order_id: number
  order_no: string
  buyer_enterprise_id: number
  seller_enterprise_id: number
  finance_service_id: number
  requested_amount: number
  approved_amount: number
  financing_status: string
  order_status: number
  warehouse_service_id: number
  warehouse_name: string
  warehouse_address: string
  logistics_order_id: number
  logistics_status: string
  last_logistics_event: string
  pledge_voucher_url: string
  pledge_remark: string
  pledged_at?: string
  release_condition: string
  released_at?: string
  inventory_snapshots?: WarehouseInventorySnapshotInfo[]
  fulfillment_docs?: FulfillmentDocumentInfo[]
}

export interface WarehouseReceiptPledgeInfo {
  id: number
  application_no: string
  applicant_enterprise_id: number
  applicant_user_id: number
  applicant_role: string
  finance_service_id: number
  finance_service_name?: string
  funding_enterprise_id: number
  warehouse_service_id: number
  warehouse_enterprise_id: number
  warehouse_name: string
  receipt_no: string
  receipt_voucher_url: string
  goods_name: string
  quantity: number
  quality_grade?: string
  requested_amount: number
  approved_amount?: number
  term_days?: number
  annual_rate?: number
  risk_remark?: string
  pledge_agreement_url?: string
  supervision_agreement_url?: string
  disbursement_voucher_url?: string
  release_voucher_url?: string
  release_remark?: string
  status: string
  submitted_at?: string
  risk_reviewed_at?: string
  agreement_signed_at?: string
  disbursed_at?: string
  released_at?: string
  remark?: string
  created_at: string
  updated_at: string
}

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

  async releasePledge(orderId: number, payload: { reason: string; voucher_url?: string; release_amount?: number }) {
    const response = await api.post<unknown, ApiResponse<OrderInfo['financing_info']>>(`/orders/${orderId}/pledges/release`, payload)
    return response.data
  },

  async listCollateralMonitor() {
    const response = await api.get<unknown, ApiResponse<{ list: CollateralMonitorInfo[] }>>('/finance/collateral-monitor')
    return response.data.list
  },

  async listWarehouseReceiptPledges(params?: Record<string, unknown>) {
    const response = await api.get<unknown, ApiResponse<{ list: WarehouseReceiptPledgeInfo[]; total: number; page: number; page_size: number }>>(
      '/finance/warehouse-receipt-pledges',
      { params },
    )
    return response.data
  },

  async reviewWarehouseReceiptPledge(id: number, payload: { approved: boolean; approved_amount?: number; term_days?: number; annual_rate?: number; risk_remark?: string }) {
    const response = await api.post<unknown, ApiResponse<WarehouseReceiptPledgeInfo>>(`/finance/warehouse-receipt-pledges/${id}/risk-result`, payload)
    return response.data
  },

  async signWarehouseReceiptPledgeAgreement(id: number, payload: { pledge_agreement_url: string; supervision_agreement_url: string }) {
    const response = await api.post<unknown, ApiResponse<WarehouseReceiptPledgeInfo>>(`/finance/warehouse-receipt-pledges/${id}/agreements`, payload)
    return response.data
  },

  async disburseWarehouseReceiptPledge(id: number, payload: { disbursement_voucher_url: string; remark?: string }) {
    const response = await api.post<unknown, ApiResponse<WarehouseReceiptPledgeInfo>>(`/finance/warehouse-receipt-pledges/${id}/disburse`, payload)
    return response.data
  },

  async releaseWarehouseReceiptPledge(id: number, payload: { release_voucher_url?: string; release_remark: string }) {
    const response = await api.post<unknown, ApiResponse<WarehouseReceiptPledgeInfo>>(`/finance/warehouse-receipt-pledges/${id}/release`, payload)
    return response.data
  },

  async confirmCollateralReceipt(logisticsOrderId: number, payload: { receipt_url: string; remark?: string }) {
    const response = await api.put<unknown, ApiResponse<unknown>>(`/logistics/orders/${logisticsOrderId}/status`, {
      status: 'receipt_signed',
      remark: payload.remark,
    })
    return response.data
  },

  async uploadFulfillmentDocument(logisticsOrderId: number, payload: { doc_type: string; file_url: string; remark?: string }) {
    const response = await api.post<unknown, ApiResponse<unknown>>(`/logistics/orders/${logisticsOrderId}/documents`, payload)
    return response.data
  },
}
