import api from './api'
import type { ApiResponse } from '@/types'

export type SupplyDemandType = 'supply' | 'demand' | 'warehouse' | 'logistics'

export interface SupplyDemandPost {
  id: number
  postNo: string
  type: SupplyDemandType
  title: string
  category: string
  material: string
  spec: string
  quantity: number
  unit: string
  targetPrice: number
  budget: number
  currency: string
  province: string
  city: string
  district: string
  deliveryAddress: string
  description: string
  tags: string[]
  contactName: string
  contactPhone: string
  financingRequired: boolean
  matchCount: number
  matchAmount: number
  status: number
  enterpriseId: number
  publisherType: 'personal' | 'enterprise'
  publisherName: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

interface BackendSupplyDemandPost {
  id: number
  post_no: string
  type: SupplyDemandType
  title: string
  category: string
  material: string
  spec: string
  quantity: number
  unit: string
  target_price: number
  budget: number
  currency: string
  province: string
  city: string
  district: string
  delivery_address: string
  description: string
  tags: string[] | null
  contact_name: string
  contact_phone: string
  financing_required: boolean
  match_count: number
  match_amount: number
  status: number
  enterprise_id: number
  publisher_type?: 'personal' | 'enterprise'
  publisher_name?: string
  created_by: number
  created_at: string
  updated_at: string
}

interface BackendPostListResponse {
  list: BackendSupplyDemandPost[]
  total: number
  page: number
  page_size: number
}

export interface SupplyDemandListResponse {
  list: SupplyDemandPost[]
  total: number
  page: number
  pageSize: number
}

export interface SupplyDemandStats {
  publishedCount: number
  matchedCount: number
  matchedAmount: number
  todayNewCount: number
}

interface BackendSupplyDemandStats {
  published_count: number
  matched_count: number
  matched_amount: number
  today_new_count: number
}

export interface SupplyDemandListParams {
  page?: number
  page_size?: number
  type?: SupplyDemandType
  keyword?: string
  category?: string
  province?: string
  city?: string
  sort_by?: string
}

export interface CreateSupplyDemandPayload {
  type: SupplyDemandType
  title: string
  category: string
  material?: string
  spec?: string
  quantity?: number
  unit?: string
  target_price?: number
  budget?: number
  province?: string
  city?: string
  district?: string
  delivery_address?: string
  description?: string
  tags?: string[]
  contact_name?: string
  contact_phone?: string
  financing_required?: boolean
}

function mapPost(post: BackendSupplyDemandPost): SupplyDemandPost {
  return {
    id: post.id,
    postNo: post.post_no,
    type: post.type,
    title: post.title,
    category: post.category,
    material: post.material,
    spec: post.spec,
    quantity: post.quantity,
    unit: post.unit,
    targetPrice: post.target_price,
    budget: post.budget,
    currency: post.currency,
    province: post.province,
    city: post.city,
    district: post.district,
    deliveryAddress: post.delivery_address,
    description: post.description,
    tags: post.tags || [],
    contactName: post.contact_name,
    contactPhone: post.contact_phone,
    financingRequired: post.financing_required,
    matchCount: post.match_count,
    matchAmount: post.match_amount,
    status: post.status,
    enterpriseId: post.enterprise_id,
    publisherType: post.publisher_type || (post.enterprise_id > 0 ? 'enterprise' : 'personal'),
    publisherName: post.publisher_name || (post.enterprise_id > 0 ? '认证企业' : '实名个人'),
    createdBy: post.created_by,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  }
}

function mapList(response: BackendPostListResponse): SupplyDemandListResponse {
  return {
    list: response.list.map(mapPost),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
  }
}

export const supplyDemandService = {
  getStats: async () => {
    const response = await api.get<ApiResponse<BackendSupplyDemandStats>, ApiResponse<BackendSupplyDemandStats>>('/supply-demands/stats')
    return {
      publishedCount: response.data.published_count,
      matchedCount: response.data.matched_count,
      matchedAmount: response.data.matched_amount,
      todayNewCount: response.data.today_new_count,
    }
  },

  list: async (params?: SupplyDemandListParams) => {
    const response = await api.get<ApiResponse<BackendPostListResponse>, ApiResponse<BackendPostListResponse>>('/supply-demands', { params })
    return mapList(response.data)
  },

  listMine: async (params?: SupplyDemandListParams) => {
    const response = await api.get<ApiResponse<BackendPostListResponse>, ApiResponse<BackendPostListResponse>>('/supply-demands/mine', { params })
    return mapList(response.data)
  },

  create: async (payload: CreateSupplyDemandPayload) => {
    const response = await api.post<ApiResponse<BackendSupplyDemandPost>, ApiResponse<BackendSupplyDemandPost>>('/supply-demands', payload)
    return mapPost(response.data)
  },
}
