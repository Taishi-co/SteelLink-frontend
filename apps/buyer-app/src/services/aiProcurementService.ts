import api from './api'
import type { ApiResponse } from '@/types'

export type AIProcurementStageCode =
  | 'instruction_parsing'
  | 'product_matching'
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
}

export interface MatchedProduct {
  product_id: number
  product_no: string
  product_name: string
  category: string
  steel_mill: string
  quantity: number
  unit_price: number
  total_amount: number
  score: number
  match_reason: string
  enterprise_id: number
}

export interface OrderDraft {
  order_no: string
  product_name: string
  quantity: number
  unit: string
  estimated_amount: number
  payment_method: string
  delivery_note: string
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

export const aiProcurementService = {
  parse: async (prompt: string) => {
    const response = await api.post<ApiResponse<AIProcurementParseResult>, ApiResponse<AIProcurementParseResult>>('/ai-procurements/parse', { prompt })
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

  submitReview: async (id: number) => {
    const response = await api.post<ApiResponse<AIProcurementInfo>, ApiResponse<AIProcurementInfo>>(`/ai-procurements/${id}/submit-review`, {})
    return response.data
  },
}
