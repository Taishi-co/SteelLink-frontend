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
export interface Product {
  id: number
  name: string
  category: string
  specs: string
  price: number
  unit: string
  stock: number
  description?: string
  parameters?: ProductParameter[]
  seller?: Seller
}

export interface ProductParameter {
  label: string
  value: string
}

// Seller Types
export interface Seller {
  id: number
  name: string
  location: string
  rating: number
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

export interface OrderTimelineItem {
  key: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'skipped' | string
  time?: string
  description?: string
}
