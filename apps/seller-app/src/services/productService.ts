import api from './api'

export interface AuditLogItem {
  id: number
  action: string
  status: string
  operator_id: number
  operator_name: string
  remark: string
  created_at: string
}

export interface SellerProductRecord {
  id: number
  sku_id: string
  seller_id: number
  seller_uid: string
  seller_name: string
  name: string
  category: string
  specs: string
  price: number
  unit: string
  stock: number
  visible_stock: number
  sales: number
  description: string
  image_urls: string[]
  qualification_urls: string[]
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'offline'
  audit_remark?: string
  submitted_at?: string
  approved_at?: string
  created_at: string
  updated_at: string
  audit_logs: AuditLogItem[]
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ProductListResponse {
  list: SellerProductRecord[]
  total: number
  page: number
  page_size: number
}

interface UpsertProductPayload {
  name: string
  category: string
  specs: string
  price: number
  stock: number
  description: string
  image_urls: string[]
  qualification_urls: string[]
}

export const sellerProductService = {
  list: () => api.get<ApiResponse<ProductListResponse>>('/seller/products'),
  create: (payload: UpsertProductPayload) => api.post<ApiResponse<SellerProductRecord>>('/seller/products', payload),
  update: (id: number, payload: UpsertProductPayload) =>
    api.put<ApiResponse<SellerProductRecord>>(`/seller/products/${id}`, payload),
}
