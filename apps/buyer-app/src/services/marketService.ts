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
  buyerName: string
  supplierName: string
  savingRate: number
  startedAt: string
  endedAt: string
  closedAt?: string
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
  buyer_name: string
  supplier_name: string
  saving_rate: number
  started_at: string
  ended_at: string
  closed_at?: string
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
    buyerName: activity.buyer_name,
    supplierName: activity.supplier_name,
    savingRate: activity.saving_rate,
    startedAt: activity.started_at,
    endedAt: activity.ended_at,
    closedAt: activity.closed_at,
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
