import api from './api'
import type { ApiResponse } from '@/types'

interface BackendListResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export interface MarketListResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface BiddingStats {
  activeCount: number
  successCount: number
  totalTransaction: number
  participatingCompany: number
}

interface BackendBiddingStats {
  active_count: number
  success_count: number
  total_transaction: number
  participating_company: number
}

export interface BiddingActivity {
  id: number
  biddingNo: string
  title: string
  category: string
  quantity: number
  unit: string
  startPrice: number
  currentPrice: number
  dealAmount: number
  priceChangeRate: number
  participants: number
  progress: number
  status: string
  buyerId: number
  buyerName: string
  deliveryRegion: string
  quoteCount: number
  awardQuoteId: number
  awardSupplierId: number
  orderId: number
  supplierName: string
  savingRate: number
  startedAt: string
  endedAt: string
  closedAt?: string
  quotes?: BiddingQuote[]
}

interface BackendBiddingActivity {
  id: number
  bidding_no: string
  title: string
  category: string
  quantity: number
  unit: string
  start_price: number
  current_price: number
  deal_amount: number
  price_change_rate: number
  participants: number
  progress: number
  status: string
  buyer_id: number
  buyer_name: string
  delivery_region: string
  quote_count: number
  award_quote_id: number
  award_supplier_id: number
  order_id: number
  supplier_name: string
  saving_rate: number
  started_at: string
  ended_at: string
  closed_at?: string
  quotes?: BackendBiddingQuote[]
}

export interface BiddingQuote {
  id: number
  biddingId: number
  supplierId: number
  supplierName: string
  unitPrice: number
  quantity: number
  deliveryDays: number
  remark: string
  round: number
  isAwarded: boolean
  createdAt: string
}

interface BackendBiddingQuote {
  id: number
  bidding_id: number
  supplier_id: number
  supplier_name: string
  unit_price: number
  quantity: number
  delivery_days: number
  remark: string
  round: number
  is_awarded: boolean
  created_at: string
}

export interface CreateBiddingPayload {
  title: string
  category: string
  quantity: number
  unit?: string
  start_price: number
  delivery_region: string
  ended_at: string
}

export interface SubmitBiddingQuotePayload {
  unit_price: number
  quantity: number
  delivery_days: number
  remark?: string
}

export interface ProcurementStats {
  activityCount: number
  preparingCount: number
  successCount: number
  totalTransaction: number
  participatingCompany: number
  demandQuantity: number
}

interface BackendProcurementStats {
  activity_count: number
  preparing_count: number
  success_count: number
  total_transaction: number
  participating_company: number
  demand_quantity: number
}

export interface ProcurementLog {
  id: number
  content: string
  color: string
  createdAt: string
}

interface BackendProcurementLog {
  id: number
  content: string
  color: string
  created_at: string
}

export interface ProcurementActivity {
  id: number
  procurementNo: string
  title: string
  leaderName: string
  status: string
  category: string
  target: string
  targetQuantity: number
  unit: string
  budgetMin: number
  budgetMax: number
  budgetDisplay: string
  stage: string
  progress: number
  region: string
  openDate: string
  participatingCount: number
  demandQuantity: number
  qualifiedSuppliers: number
  quoteCount: number
  contractCount: number
  deliveryDays: number
  quoteMode: string
  evaluationMode: string
  documents: string[]
  logs: ProcurementLog[]
  createdAt: string
  updatedAt: string
}

interface BackendProcurementActivity {
  id: number
  procurement_no: string
  title: string
  leader_name: string
  status: string
  category: string
  target: string
  target_quantity: number
  unit: string
  budget_min: number
  budget_max: number
  budget_display: string
  stage: string
  progress: number
  region: string
  open_date: string
  participating_count: number
  demand_quantity: number
  qualified_suppliers: number
  quote_count: number
  contract_count: number
  delivery_days: number
  quote_mode: string
  evaluation_mode: string
  documents: string[] | null
  logs?: BackendProcurementLog[]
  created_at: string
  updated_at: string
}

export interface MarketListParams {
  page?: number
  page_size?: number
  status?: string
  keyword?: string
  category?: string
  scope?: 'public' | 'workspace'
}

function mapBidding(activity: BackendBiddingActivity): BiddingActivity {
  return {
    id: activity.id,
    biddingNo: activity.bidding_no,
    title: activity.title,
    category: activity.category,
    quantity: activity.quantity,
    unit: activity.unit,
    startPrice: activity.start_price,
    currentPrice: activity.current_price,
    dealAmount: activity.deal_amount,
    priceChangeRate: activity.price_change_rate,
    participants: activity.participants,
    progress: activity.progress,
    status: activity.status,
    buyerId: activity.buyer_id,
    buyerName: activity.buyer_name,
    deliveryRegion: activity.delivery_region,
    quoteCount: activity.quote_count,
    awardQuoteId: activity.award_quote_id,
    awardSupplierId: activity.award_supplier_id,
    orderId: activity.order_id,
    supplierName: activity.supplier_name,
    savingRate: activity.saving_rate,
    startedAt: activity.started_at,
    endedAt: activity.ended_at,
    closedAt: activity.closed_at,
    quotes: (activity.quotes || []).map(mapBiddingQuote),
  }
}

function mapBiddingQuote(quote: BackendBiddingQuote): BiddingQuote {
  return {
    id: quote.id,
    biddingId: quote.bidding_id,
    supplierId: quote.supplier_id,
    supplierName: quote.supplier_name,
    unitPrice: quote.unit_price,
    quantity: quote.quantity,
    deliveryDays: quote.delivery_days,
    remark: quote.remark,
    round: quote.round,
    isAwarded: quote.is_awarded,
    createdAt: quote.created_at,
  }
}

function mapProcurement(activity: BackendProcurementActivity): ProcurementActivity {
  return {
    id: activity.id,
    procurementNo: activity.procurement_no,
    title: activity.title,
    leaderName: activity.leader_name,
    status: activity.status,
    category: activity.category,
    target: activity.target,
    targetQuantity: activity.target_quantity,
    unit: activity.unit,
    budgetMin: activity.budget_min,
    budgetMax: activity.budget_max,
    budgetDisplay: activity.budget_display,
    stage: activity.stage,
    progress: activity.progress,
    region: activity.region,
    openDate: activity.open_date,
    participatingCount: activity.participating_count,
    demandQuantity: activity.demand_quantity,
    qualifiedSuppliers: activity.qualified_suppliers,
    quoteCount: activity.quote_count,
    contractCount: activity.contract_count,
    deliveryDays: activity.delivery_days,
    quoteMode: activity.quote_mode,
    evaluationMode: activity.evaluation_mode,
    documents: activity.documents || [],
    logs: (activity.logs || []).map((log) => ({
      id: log.id,
      content: log.content,
      color: log.color,
      createdAt: log.created_at,
    })),
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  }
}

function mapList<TBackend, TFrontend>(
  response: BackendListResponse<TBackend>,
  mapper: (item: TBackend) => TFrontend,
): MarketListResponse<TFrontend> {
  return {
    list: response.list.map(mapper),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
  }
}

export const marketService = {
  getBiddingStats: async () => {
    const response = await api.get<ApiResponse<BackendBiddingStats>, ApiResponse<BackendBiddingStats>>('/biddings/stats')
    return {
      activeCount: response.data.active_count,
      successCount: response.data.success_count,
      totalTransaction: response.data.total_transaction,
      participatingCompany: response.data.participating_company,
    }
  },

  listBiddings: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendBiddingActivity>>, ApiResponse<BackendListResponse<BackendBiddingActivity>>>('/biddings', { params })
    return mapList(response.data, mapBidding)
  },

  getBidding: async (id: number) => {
    const response = await api.get<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}`)
    return mapBidding(response.data)
  },

  createBidding: async (payload: CreateBiddingPayload) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>('/biddings', payload)
    return mapBidding(response.data)
  },

  submitBiddingQuote: async (id: number, payload: SubmitBiddingQuotePayload) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}/quotes`, payload)
    return mapBidding(response.data)
  },

  awardBidding: async (id: number, quoteId: number) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}/award`, { quote_id: quoteId })
    return mapBidding(response.data)
  },

  createBiddingOrder: async (id: number) => {
    const response = await api.post<ApiResponse<{ bidding: BackendBiddingActivity; order_id: number; order_no: string }>, ApiResponse<{ bidding: BackendBiddingActivity; order_id: number; order_no: string }>>(`/biddings/${id}/orders`)
    return {
      bidding: mapBidding(response.data.bidding),
      orderId: response.data.order_id,
      orderNo: response.data.order_no,
    }
  },

  getProcurementStats: async () => {
    const response = await api.get<ApiResponse<BackendProcurementStats>, ApiResponse<BackendProcurementStats>>('/procurements/stats')
    return {
      activityCount: response.data.activity_count,
      preparingCount: response.data.preparing_count,
      successCount: response.data.success_count,
      totalTransaction: response.data.total_transaction,
      participatingCompany: response.data.participating_company,
      demandQuantity: response.data.demand_quantity,
    }
  },

  listProcurements: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementActivity>>, ApiResponse<BackendListResponse<BackendProcurementActivity>>>('/procurements', { params })
    return mapList(response.data, mapProcurement)
  },

  getProcurement: async (id: number) => {
    const response = await api.get<ApiResponse<BackendProcurementActivity>, ApiResponse<BackendProcurementActivity>>(`/procurements/${id}`)
    return mapProcurement(response.data)
  },
}
