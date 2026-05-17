import api from './api'
import type { ApiResponse, PaginatedResponse, Product } from '@/types'

interface BackendProduct {
  id: number
  product_no: string
  name: string
  goods_type?: 'spot' | 'futures'
  category: string
  sub_category: string
  steel_mill: string
  spec: {
    material: string
    spec: string
    thickness?: string
    width?: string
    length?: string
    surface?: string
    edge?: string
    processing?: string
  }
  warehouse_info: {
    warehouse_id: number
    warehouse_service_id?: number
    warehouse_enterprise_id?: number
    warehouse_name: string
    warehouse_code: string
    address: string
    province: string
    city: string
    district: string
  }
  warehouse_service_id?: number
  warehouse_enterprise_id?: number
  bundle_no: string
  quantity: number
  available_qty: number
  locked_qty: number
  unit_price: number
  min_order_qty: number
  currency: string
  tax_included: boolean
  tax_rate: number
  status: number
  enterprise_id: number
  quality_cert?: string
  title_voucher_url?: string
  title_voucher_remark?: string
  images: string[]
  description?: string
  delivery_days: number
  quote_validity: number
  created_at: string
  updated_at: string
}

function mapProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    productNo: product.product_no,
    name: product.name,
    goodsType: product.goods_type || 'spot',
    category: product.category,
    subCategory: product.sub_category,
    steelMill: product.steel_mill,
    spec: product.spec,
    warehouseServiceId: product.warehouse_service_id || product.warehouse_info?.warehouse_service_id,
    warehouseEnterpriseId: product.warehouse_enterprise_id || product.warehouse_info?.warehouse_enterprise_id,
    warehouseInfo: product.warehouse_info,
    bundleNo: product.bundle_no,
    quantity: product.quantity,
    availableQty: product.available_qty,
    lockedQty: product.locked_qty,
    unitPrice: product.unit_price,
    minOrderQty: product.min_order_qty,
    currency: product.currency,
    taxIncluded: product.tax_included,
    taxRate: product.tax_rate,
    status: product.status,
    enterpriseId: product.enterprise_id,
    qualityCert: product.quality_cert,
    titleVoucherUrl: product.title_voucher_url,
    titleVoucherRemark: product.title_voucher_remark,
    titleConfirmed: Boolean(product.title_voucher_url),
    images: product.images || [],
    description: product.description,
    deliveryDays: product.delivery_days,
    quoteValidity: product.quote_validity,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  }
}

export const productService = {
  getProducts: async (params?: {
    category?: string
    sub_category?: string
    keyword?: string
    steel_mill?: string
    min_unit_price?: number
    max_unit_price?: number
    min_available?: number
    province?: string
    city?: string
    page?: number
    page_size?: number
    sort_by?: string
    goods_type?: 'spot' | 'futures'
    warehouse_service_id?: number
  }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<BackendProduct>>, ApiResponse<PaginatedResponse<BackendProduct>>>('/products', { params })
    return {
      ...response,
      data: {
        ...response.data,
        list: response.data.list.map(mapProduct),
      },
    }
  },

  getProduct: async (id: number) => {
    const response = await api.get<ApiResponse<BackendProduct>, ApiResponse<BackendProduct>>(`/products/${id}`)
    return {
      ...response,
      data: mapProduct(response.data),
    }
  },
}
