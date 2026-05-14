import api from './api'
import { getSellerEnterpriseID } from './auth'

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
  goods_type: 'spot' | 'futures'
  seller_id: number
  seller_uid: string
  seller_name: string
  name: string
  category_id?: number
  grade_id?: number
  steel_mill_id?: number
  category: string
  sub_category: string
  steel_mill: string
  specs: string
  material: string
  height_spec_type?: string
  height_spec_value?: number
  height_spec_unit?: string
  width_spec_type?: string
  width_spec_value?: number
  width_spec_unit?: string
  length_type?: string
  length_value?: number
  length_unit?: string
  warehouse_name: string
  warehouse_code: string
  warehouse_service_id?: number
  warehouse_enterprise_id?: number
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
  goods_type?: 'spot' | 'futures'
  category_id?: number
  grade_id?: number
  steel_mill_id?: number
  category: string
  sub_category: string
  steel_mill: string
  spec: {
    material: string
    spec: string
    thickness?: string
    width?: string
    length?: string
    height_spec_type?: string
    height_spec_value?: number
    height_spec_unit?: string
    width_spec_type?: string
    width_spec_value?: number
    width_spec_unit?: string
    length_type?: string
    length_value?: number
    length_unit?: string
  }
  spec_raw?: string
  height_spec_type?: string
  height_spec_value?: number
  height_spec_unit?: string
  width_spec_type?: string
  width_spec_value?: number
  width_spec_unit?: string
  length_type?: string
  length_value?: number
  length_unit?: string
  warehouse_info: {
    warehouse_service_id?: number
    warehouse_enterprise_id?: number
    warehouse_name: string
    warehouse_code: string
    province: string
    city: string
    district: string
    address: string
  }
  warehouse_service_id?: number
  warehouse_enterprise_id?: number
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
  goods_type?: 'spot' | 'futures'
  category_id?: number
  grade_id?: number
  steel_mill_id?: number
  category: string
  sub_category: string
  steel_mill: string
  spec: {
    material: string
    spec: string
    thickness?: string
    width?: string
    length?: string
    height_spec_type?: string
    height_spec_value?: number
    height_spec_unit?: string
    width_spec_type?: string
    width_spec_value?: number
    width_spec_unit?: string
    length_type?: string
    length_value?: number
    length_unit?: string
  }
  warehouse_service_id?: number
  warehouse_info: {
    warehouse_service_id?: number
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

export interface UpdateProductDisplayPayload {
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

function toSellerProductRecord(product: BackendProductInfo): SellerProductRecord {
  const mappedStatus = mapStatus(product.status)
  return {
    id: product.id,
    sku_id: product.product_no,
    goods_type: product.goods_type || 'spot',
    seller_id: product.enterprise_id,
    seller_uid: String(product.enterprise_id),
    seller_name: `企业 ${product.enterprise_id}`,
    name: product.name,
    category_id: product.category_id,
    grade_id: product.grade_id,
    steel_mill_id: product.steel_mill_id,
    category: product.category,
    sub_category: product.sub_category,
    steel_mill: product.steel_mill,
    specs: product.spec?.spec || product.spec_raw || '',
    material: product.spec?.material || '',
    height_spec_type: product.spec?.height_spec_type || product.height_spec_type,
    height_spec_value: product.spec?.height_spec_value || product.height_spec_value,
    height_spec_unit: product.spec?.height_spec_unit || product.height_spec_unit,
    width_spec_type: product.spec?.width_spec_type || product.width_spec_type,
    width_spec_value: product.spec?.width_spec_value || product.width_spec_value,
    width_spec_unit: product.spec?.width_spec_unit || product.width_spec_unit,
    length_type: product.spec?.length_type || product.length_type,
    length_value: product.spec?.length_value || product.length_value,
    length_unit: product.spec?.length_unit || product.length_unit,
    warehouse_name: product.warehouse_info?.warehouse_name || '',
    warehouse_code: product.warehouse_info?.warehouse_code || '',
    warehouse_service_id: product.warehouse_service_id || product.warehouse_info?.warehouse_service_id,
    warehouse_enterprise_id: product.warehouse_enterprise_id || product.warehouse_info?.warehouse_enterprise_id,
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
    const enterpriseId = getSellerEnterpriseID()
    const response = await api.get<unknown, ApiResponse<BackendProductListResponse>>('/products', {
      params: {
        enterprise_id: enterpriseId || undefined,
        page_size: 100,
        sort_by: 'updated_desc',
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
  update: (id: number, payload: UpsertProductPayload) =>
    api.put<unknown, ApiResponse<BackendProductInfo>>(`/products/${id}`, payload),
  updateDisplay: (id: number, payload: UpdateProductDisplayPayload) =>
    api.put<unknown, ApiResponse<BackendProductInfo>>(`/products/${id}/display`, payload),
  remove: (id: number) =>
    api.delete<unknown, ApiResponse<{ message: string }>>(`/products/${id}`),
}
