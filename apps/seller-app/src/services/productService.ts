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

type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'offline'

export interface SellerProductRecord {
  id: number
  sku_id: string
  seller_id: number
  seller_uid: string
  seller_name: string
  name: string
  category: string
  sub_category: string
  steel_mill: string
  specs: string
  material: string
  warehouse_name: string
  warehouse_code: string
  province: string
  city: string
  district: string
  address: string
  bundle_no: string
  price: number
  unit: string
  stock: number
  visible_stock: number
  sales: number
  min_order_qty: number
  delivery_days: number
  quote_validity: number
  description: string
  image_urls: string[]
  qualification_urls: string[]
  status: ProductStatus
  audit_remark?: string
  submitted_at?: string
  approved_at?: string
  review_status_text?: string
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

interface SellerProductListServiceResponse extends ApiResponse<ProductListResponse> {}

interface BackendProductInfo {
  id: number
  product_no: string
  name: string
  category: string
  sub_category: string
  steel_mill: string
  spec: {
    material: string
    spec: string
  }
  warehouse_info: {
    warehouse_name: string
    warehouse_code: string
    province: string
    city: string
    district: string
    address: string
  }
  bundle_no: string
  quantity: number
  available_qty: number
  unit_price: number
  min_order_qty: number
  status: number
  enterprise_id: number
  audit_remark?: string
  approved_at?: string
  quality_cert?: string
  images: string[]
  description: string
  delivery_days: number
  quote_validity: number
  created_at: string
  updated_at: string
}

interface BackendProductListResponse {
  list: BackendProductInfo[]
  total: number
  page: number
  page_size: number
}

export interface UpsertProductPayload {
  name: string
  category: string
  sub_category: string
  steel_mill: string
  spec: {
    material: string
    spec: string
  }
  warehouse_info: {
    warehouse_name: string
    warehouse_code: string
    province: string
    city: string
    district: string
    address: string
  }
  bundle_no: string
  quantity: number
  unit_price: number
  min_order_qty: number
  images: string[]
  quality_cert?: string
  description: string
  delivery_days: number
  quote_validity: number
}

function mapStatus(status: number): ProductStatus {
  switch (status) {
    case 0:
      return 'draft'
    case 1:
      return 'pending_review'
    case 2:
      return 'approved'
    case 3:
      return 'offline'
    case 4:
      return 'rejected'
    default:
      return 'draft'
  }
}

function parseJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    return JSON.parse(window.atob(padded))
  } catch {
    return null
  }
}

function getEnterpriseIdFromToken(): number | undefined {
  const payload = parseJwtPayload(localStorage.getItem('token'))
  const enterpriseId = payload?.enterprise_id
  return typeof enterpriseId === 'number' && enterpriseId > 0 ? enterpriseId : undefined
}

function toSellerProductRecord(product: BackendProductInfo): SellerProductRecord {
  const mappedStatus = mapStatus(product.status)
  return {
    id: product.id,
    sku_id: product.product_no,
    seller_id: product.enterprise_id,
    seller_uid: String(product.enterprise_id),
    seller_name: `企业 ${product.enterprise_id}`,
    name: product.name,
    category: product.category,
    sub_category: product.sub_category,
    steel_mill: product.steel_mill,
    specs: product.spec?.spec || '',
    material: product.spec?.material || '',
    warehouse_name: product.warehouse_info?.warehouse_name || '',
    warehouse_code: product.warehouse_info?.warehouse_code || '',
    province: product.warehouse_info?.province || '',
    city: product.warehouse_info?.city || '',
    district: product.warehouse_info?.district || '',
    address: product.warehouse_info?.address || '',
    bundle_no: product.bundle_no,
    price: product.unit_price,
    unit: '吨',
    stock: product.quantity,
    visible_stock: product.available_qty,
    sales: 0,
    min_order_qty: product.min_order_qty,
    delivery_days: product.delivery_days,
    quote_validity: product.quote_validity,
    description: product.description,
    image_urls: product.images || [],
    qualification_urls: product.quality_cert ? [product.quality_cert] : [],
    status: mappedStatus,
    audit_remark: product.audit_remark || undefined,
    submitted_at: product.created_at,
    approved_at: product.approved_at || (product.status === 2 ? product.updated_at : undefined),
    review_status_text:
      mappedStatus === 'approved'
        ? '平台已审核通过，商品已进入商城展示'
        : mappedStatus === 'rejected'
          ? '平台已驳回，请根据审核说明补充后重新提交'
          : mappedStatus === 'pending_review'
            ? '平台审核中，审核通过后会在买家端展示'
            : mappedStatus === 'offline'
              ? '商品已下架，当前不会在商城展示'
              : '商品草稿尚未进入审核流程',
    created_at: product.created_at,
    updated_at: product.updated_at,
    audit_logs: [],
  }
}

export const sellerProductService = {
  list: async (): Promise<SellerProductListServiceResponse> => {
    const enterpriseId = getEnterpriseIdFromToken()
    const response = await api.get<unknown, ApiResponse<BackendProductListResponse>>('/products', {
      params: {
        enterprise_id: enterpriseId,
      },
    })

    return {
      ...response,
      data: {
        ...response.data,
        list: response.data.list.map(toSellerProductRecord) as SellerProductRecord[],
      },
    } as ApiResponse<ProductListResponse>
  },
  create: (payload: UpsertProductPayload) =>
    api.post<unknown, ApiResponse<BackendProductInfo>>('/products', payload),
}
