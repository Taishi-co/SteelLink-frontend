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
  category: string
  subCategory: string
  steelMill: string
  spec: ProductSpec
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
  specs: string
  price: number
  quantity: number
  seller: string
}

// User Types
export interface User {
  id: number
  username: string
  mobile: string
  companyName: string
  role: 'buyer' | 'seller'
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
