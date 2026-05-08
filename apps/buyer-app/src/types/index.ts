// API Response Types
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// Product Types
export interface ProductSpec {
  material: string
  spec: string
  thickness?: string
  width?: string
  length?: string
  surface?: string
  edge?: string
  processing?: string
}

export interface WarehouseInfo {
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

export interface Product {
  id: number
  productNo: string
  name: string
  goodsType: 'spot' | 'futures'
  category: string
  subCategory: string
  steelMill: string
  spec: ProductSpec
  warehouseServiceId?: number
  warehouseEnterpriseId?: number
  warehouseInfo: WarehouseInfo
  bundleNo: string
  quantity: number
  availableQty: number
  lockedQty: number
  unitPrice: number
  minOrderQty: number
  currency: string
  taxIncluded: boolean
  taxRate: number
  status: number
  enterpriseId: number
  qualityCert?: string
  images: string[]
  description?: string
  deliveryDays: number
  quoteValidity: number
  createdAt: string
  updatedAt: string
}

// Cart Types
export interface CartItem {
  id: number
  productId: number
  productName: string
  imageUrl?: string
  specs: string
  price: number
  quantity: number
  seller: string
  warehouseInfo?: WarehouseInfo
  unit?: string
  subTotal?: number
}

export interface CartItemDTO {
  id: number
  product_id: number
  product_name: string
  image_url?: string
  spec: string
  price: number
  quantity: number
  seller_id: number
  seller_name: string
  warehouse_info?: WarehouseInfo
  unit: string
  sub_total: number
}

export interface AddCartRequest {
  product_id: number
  quantity: number
}

export interface UpdateCartRequest {
  quantity: number
}

// Favorite Types
export interface Favorite {
  id: number
  productId: number
  productName: string
  category: string
  spec: string
  price: number
  image: string
  sellerId: number
  sellerName: string
  createdAt: string
}

export interface FavoriteDTO {
  id: number
  product_id: number
  product_name: string
  category: string
  spec: string
  price: number
  image: string
  seller_id: number
  seller_name: string
  created_at: string
}

export interface AddFavoriteRequest {
  product_id: number
}

// User Types
export interface User {
  id: number
  username: string
  mobile: string
  companyName: string
  role: 'guest' | 'personal' | 'enterprise'
  realName: string
  identityStatus: number
  identityReject: string
  enterpriseCode: string
  enterpriseRole: string
}

// Order Types
export interface Order {
  id: number
  orderNo: string
  status: OrderStatus
  totalAmount: number
  totalWeight: number
  items: OrderItem[]
  createdAt: string
}

export type OrderStatus =
  | 'pending'
  | 'pending_contract'
  | 'pending_payment'
  | 'pending_payment_audit'
  | 'pending_pickup'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  productId: number
  productName: string
  price: number
  quantity: number
}
