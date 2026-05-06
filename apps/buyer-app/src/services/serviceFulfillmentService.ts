import api from './api'
import type { ApiResponse } from '@/types'
import type { PageResponse } from './serviceOfferService'

export interface WarehouseMovementInfo {
  id: number
  movement_no: string
  warehouse_service_id: number
  warehouse_enterprise_id: number
  product_id: number
  product_name: string
  bundle_no: string
  order_id: number
  order_no: string
  movement_type: 'inbound' | 'outbound' | string
  quantity: number
  status: 'pending' | 'processing' | 'completed' | string
  scheduled_at: string
  completed_at?: string
  remark: string
  created_at: string
  updated_at: string
}

export interface LogisticsOrderInfo {
  id: number
  logistics_no: string
  order_id: number
  order_no: string
  buyer_enterprise_id: number
  logistics_service_id: number
  carrier_enterprise_id: number
  warehouse_service_id: number
  origin: string
  destination: string
  cargo_name: string
  weight: number
  vehicle_type: string
  estimated_price: number
  final_price: number
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'completed' | string
  driver_name: string
  driver_phone: string
  plate_number: string
  guarantee_type: string
  accepted_at?: string
  created_at: string
  updated_at: string
  tracking_events?: TrackingEventInfo[]
}

export interface TrackingEventInfo {
  id: number
  logistics_order_id: number
  event_type: string
  location: string
  description: string
  occurred_at: string
  created_at: string
}

export interface GuaranteeInfo {
  id: number
  guarantee_no: string
  order_id: number
  logistics_order_id: number
  enterprise_id: number
  guarantee_type: string
  status: 'active' | 'claiming' | 'resolved' | string
  coverage_amount: number
  description: string
  resolution: string
  created_at: string
  updated_at: string
}

export interface FulfillmentSummary {
  order_id: number
  warehouse_movements: WarehouseMovementInfo[]
  logistics_orders: LogisticsOrderInfo[]
  guarantees: GuaranteeInfo[]
}

export interface LogisticsEstimatePayload {
  logistics_service_id: number
  warehouse_service_id?: number
  origin?: string
  destination: string
  weight: number
}

export interface LogisticsEstimateResult {
  logistics_service_id: number
  warehouse_service_id: number
  origin: string
  destination: string
  weight: number
  unit_price: number
  estimated_price: number
  price_rule: string
}

export interface WarehouseProductInfo {
  id: number
  product_no: string
  name: string
  bundle_no: string
  quantity: number
  available_qty: number
  locked_qty: number
  warehouse_info?: {
    warehouse_id?: number
    warehouse_name?: string
    warehouse_code?: string
    province?: string
    city?: string
    district?: string
    address?: string
  }
}

export const serviceFulfillmentService = {
  listWarehouseMovements: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<WarehouseMovementInfo>>>('/warehouse-movements', { params }),
  listWarehouseProducts: (warehouseId: number) =>
    api.get<unknown, ApiResponse<{ list: WarehouseProductInfo[] }>>(`/warehouses/${warehouseId}/products`),
  listLogisticsOrders: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<LogisticsOrderInfo>>>('/logistics/orders', { params }),
  estimateLogistics: (payload: LogisticsEstimatePayload) =>
    api.post<unknown, ApiResponse<LogisticsEstimateResult>>('/logistics/estimate', payload),
  getOrderFulfillment: (orderId: number) =>
    api.get<unknown, ApiResponse<FulfillmentSummary>>(`/orders/${orderId}/service-fulfillment`),
}
