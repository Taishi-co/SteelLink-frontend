import api from './api'
import type { ApiResponse } from '@/types'

export type AIProcurementStageCode =
  | 'instruction_parsing'
  | 'product_matching'
  | 'logistics_warehouse_matching'
  | 'order_generation'
  | 'financing_matching'
  | 'review_submission'

export type AIProcurementStageStatus = 'pending' | 'processing' | 'completed'

export interface ParsedInstruction {
  product_name: string
  category: string
  quantity: number
  unit: string
  usage: string
  financing_required: boolean
  keywords: string[]
  confidence: number
  delivery_address?: string
  delivery_address_source?: 'manual' | 'buyer_warehouse' | string
  delivery_warehouse_id?: number
  delivery_warehouse_name?: string
}

export interface MatchedProduct {
  product_id: number
  product_no: string
  product_name: string
  category: string
  steel_mill: string
  quantity: number
  available_qty?: number
  unit_price: number
  total_amount: number
  score: number
  match_reason: string
  enterprise_id: number
  spec?: Record<string, unknown>
  warehouse?: Record<string, unknown>
  bundle_no?: string
  delivery_days?: number
  quote_validity?: number
  quality_cert?: string
  description?: string
  origin_warehouse_name?: string
  origin_address?: string
  destination_address?: string
  logistics_service_id?: number
  logistics_service_name?: string
  logistics_route?: string
  logistics_options?: LogisticsOption[]
  logistics_match_status?: 'matched' | 'no_match' | 'destination_missing' | string
  freight_estimate?: number
  landed_total?: number
  unit_landed_price?: number
  selected?: boolean
}

export interface LogisticsOption {
  service_id: number
  service_name: string
  route: string
  route_start?: string
  route_end?: string
  service_scope?: string
  vehicle_type?: string
  load_capacity?: number
  price_rule?: string
  freight_estimate: number
  unit_freight_estimate: number
  landed_total: number
  unit_landed_price: number
  score: number
  match_reason: string
}

export interface OrderFormPayload {
  quantity?: number
  contact_name: string
  contact_phone: string
  warehouse_name: string
  delivery_address: string
  delivery_method: string
  payment_method: string
  delivery_note?: string
  remark?: string
}

export interface OrderDraft {
  order_id?: number
  order_no: string
  orders?: OrderSummary[]
  product_id?: number
  product_name: string
  quantity: number
  unit: string
  estimated_amount: number
  payment_method: string
  delivery_note: string
  contact_name?: string
  contact_phone?: string
  warehouse_name?: string
  delivery_address?: string
  delivery_method?: string
  remark?: string
  order_detail?: Record<string, unknown>
}

export interface OrderSummary {
  order_id: number
  order_no: string
  seller_id: number
  seller_name: string
  quantity: number
  total_amount: number
  product_count: number
  payment_method?: string
  delivery_note?: string
}

export interface FinancePlan {
  provider: string
  product_name: string
  amount: number
  rate: number
  term_days: number
  matched: boolean
  reason: string
}

export interface AuditItem {
  code: string
  name: string
  status: string
  required: boolean
  message: string
}

export interface StageInfo {
  code: AIProcurementStageCode
  name: string
  status: AIProcurementStageStatus
  description: string
}

export interface AIProcurementParseResult {
  parsed: ParsedInstruction
  matched_products: MatchedProduct[]
  order_draft: OrderDraft
  finance_plans: FinancePlan[]
  audit_items: AuditItem[]
  stages: StageInfo[]
}

export interface AIProcurementInfo {
  id: number
  procurement_no: string
  prompt: string
  product_name: string
  category: string
  quantity: number
  unit: string
  usage: string
  financing_required: boolean
  current_stage: AIProcurementStageCode
  status: string
  parsed_instruction: ParsedInstruction
  matched_products: MatchedProduct[]
  order_draft: OrderDraft
  finance_plans: FinancePlan[]
  audit_items: AuditItem[]
  stages: StageInfo[]
  history_saved: boolean
  enterprise_id: number
  created_by: number
  created_at: string
  updated_at: string
  review_submitted_at?: string | null
}

interface AIProcurementListResponse {
  list: AIProcurementInfo[]
  total: number
  page: number
  page_size: number
}

interface MatchProductsResponse {
  matched_products: MatchedProduct[]
  stages: StageInfo[]
}

interface MatchLogisticsWarehouseResponse {
  matched_products: MatchedProduct[]
  stages: StageInfo[]
}

interface GenerateOrderResponse {
  procurement: AIProcurementInfo
  order_draft: OrderDraft
}

export const aiProcurementService = {
  parse: async (prompt: string) => {
    const response = await api.post<ApiResponse<AIProcurementParseResult>, ApiResponse<AIProcurementParseResult>>('/ai-procurements/parse', { prompt })
    return response.data
  },

  confirmInstruction: async (prompt: string, parsed: ParsedInstruction) => {
    const response = await api.post<ApiResponse<AIProcurementParseResult>, ApiResponse<AIProcurementParseResult>>('/ai-procurements/confirm-instruction', { prompt, parsed })
    return response.data
  },

  matchProducts: async (parsed: ParsedInstruction) => {
    const response = await api.post<ApiResponse<MatchProductsResponse>, ApiResponse<MatchProductsResponse>>('/ai-procurements/match-products', { parsed })
    return response.data
  },

  matchLogisticsWarehouse: async (payload: { parsed: ParsedInstruction; selected_products: MatchedProduct[] }) => {
    const response = await api.post<ApiResponse<MatchLogisticsWarehouseResponse>, ApiResponse<MatchLogisticsWarehouseResponse>>('/ai-procurements/match-logistics-warehouse', payload)
    return response.data
  },

  generateOrder: async (payload: { prompt: string; parsed: ParsedInstruction; selected_product?: MatchedProduct; selected_products?: MatchedProduct[]; order_form: OrderFormPayload }) => {
    const response = await api.post<ApiResponse<GenerateOrderResponse>, ApiResponse<GenerateOrderResponse>>('/ai-procurements/generate-order', payload)
    return response.data
  },

  matchFinance: async (id: number, financingRequired: boolean) => {
    const response = await api.post<ApiResponse<AIProcurementInfo>, ApiResponse<AIProcurementInfo>>(`/ai-procurements/${id}/match-finance`, {
      financing_required: financingRequired,
    })
    return response.data
  },

  create: async (prompt: string) => {
    const response = await api.post<ApiResponse<AIProcurementInfo>, ApiResponse<AIProcurementInfo>>('/ai-procurements', { prompt })
    return response.data
  },

  listMine: async (params?: { page?: number; page_size?: number; keyword?: string; status?: string }) => {
    const response = await api.get<ApiResponse<AIProcurementListResponse>, ApiResponse<AIProcurementListResponse>>('/ai-procurements/mine', { params })
    return response.data
  },

  submitReview: async (id: number, saveHistory = true) => {
    const response = await api.post<ApiResponse<AIProcurementInfo>, ApiResponse<AIProcurementInfo>>(`/ai-procurements/${id}/submit-review`, {
      save_history: saveHistory,
    })
    return response.data
  },
}
