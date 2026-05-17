import api from './api'
import type { ApiResponse } from '@/types'
import type { PageResponse } from './serviceOfferService'

export interface WarehouseMovementInfo {
  id: number
  movement_no: string
  warehouse_service_id: number
  warehouse_enterprise_id: number
  request_enterprise_id?: number
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
  status:
    | 'task_created'
    | 'pickup_scheduled'
    | 'arrival_signed_in'
    | 'outbound_confirmed'
    | 'loading_confirmed'
    | 'in_transit'
    | 'arrival_confirmed'
    | 'receipt_signed'
    | 'inbound_completed'
    | 'completed'
    | 'pending'
    | 'accepted'
    | 'delivered'
    | string
  current_responsible_party?: 'buyer' | 'seller' | 'warehouse' | 'logistics' | 'unknown' | string
  handover_note?: string
  driver_name: string
  driver_phone: string
  plate_number: string
  guarantee_type: string
  accepted_at?: string
  pickup_appointment_at?: string
  arrival_signed_in_at?: string
  outbound_confirmed_at?: string
  loading_confirmed_at?: string
  arrival_confirmed_at?: string
  receipt_signed_at?: string
  inbound_completed_at?: string
  created_at: string
  updated_at: string
  tracking_events?: TrackingEventInfo[]
}

export interface UploadFulfillmentDocumentPayload {
  doc_type: string
  file_url: string
  remark?: string
  gps_latitude?: number
  gps_longitude?: number
  captured_at?: string
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

export type WarehouseReceiptPledgeStatus =
  | 'submitted'
  | 'risk_approved'
  | 'risk_rejected'
  | 'agreement_signed'
  | 'disbursed'
  | 'released'
  | string

export interface WarehouseReceiptPledgeInfo {
  id: number
  application_no: string
  applicant_enterprise_id: number
  applicant_user_id: number
  applicant_role: string
  finance_service_id: number
  finance_service_name?: string
  funding_enterprise_id: number
  warehouse_service_id: number
  warehouse_enterprise_id: number
  warehouse_name: string
  receipt_no: string
  receipt_voucher_url: string
  goods_name: string
  quantity: number
  quality_grade?: string
  requested_amount: number
  approved_amount?: number
  term_days?: number
  annual_rate?: number
  risk_remark?: string
  pledge_agreement_url?: string
  supervision_agreement_url?: string
  disbursement_voucher_url?: string
  release_voucher_url?: string
  release_remark?: string
  status: WarehouseReceiptPledgeStatus
  submitted_at?: string
  risk_reviewed_at?: string
  agreement_signed_at?: string
  disbursed_at?: string
  released_at?: string
  remark?: string
  created_at: string
  updated_at: string
}

export interface CreateWarehouseReceiptPledgePayload {
  finance_service_id: number
  warehouse_service_id: number
  receipt_no: string
  receipt_voucher_url: string
  goods_name: string
  quantity: number
  quality_grade?: string
  requested_amount: number
  remark?: string
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

export interface CreateLogisticsOrderPayload {
  order_id?: number
  order_no?: string
  logistics_service_id: number
  warehouse_service_id?: number
  origin: string
  destination: string
  cargo_name?: string
  weight: number
  vehicle_type?: string
  guarantee_type?: string
}

export interface CreateWarehouseStoragePayload {
  warehouse_service_id: number
  product_id?: number
  product_name: string
  bundle_no?: string
  order_id?: number
  order_no?: string
  quantity: number
  scheduled_at?: string
  contact_name?: string
  contact_phone?: string
  storage_requirement?: string
  remark?: string
}

export interface CreateGuaranteePayload {
  order_id?: number
  logistics_order_id?: number
  guarantee_type: string
  coverage_amount?: number
  description?: string
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
    api.get<unknown, ApiResponse<PageResponse<WarehouseMovementInfo>>>('/warehouse-movements', {
      params,
    }),
  listWarehouseProducts: (warehouseId: number) =>
    api.get<unknown, ApiResponse<{ list: WarehouseProductInfo[] }>>(
      `/warehouses/${warehouseId}/products`
    ),
  listLogisticsOrders: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<LogisticsOrderInfo>>>('/logistics/orders', {
      params,
    }),
  estimateLogistics: (payload: LogisticsEstimatePayload) =>
    api.post<unknown, ApiResponse<LogisticsEstimateResult>>('/logistics/estimate', payload),
  createLogisticsOrder: (payload: CreateLogisticsOrderPayload) =>
    api.post<unknown, ApiResponse<LogisticsOrderInfo>>('/logistics/orders', payload),
  requestWarehouseStorage: (payload: CreateWarehouseStoragePayload) =>
    api.post<unknown, ApiResponse<WarehouseMovementInfo>>('/warehouse-storage-requests', payload),
  createWarehouseReceiptPledge: (payload: CreateWarehouseReceiptPledgePayload) =>
    api.post<unknown, ApiResponse<WarehouseReceiptPledgeInfo>>('/warehouse-receipt-pledges', payload),
  listMyWarehouseReceiptPledges: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<PageResponse<WarehouseReceiptPledgeInfo>>>('/warehouse-receipt-pledges/mine', {
      params,
    }),
  createGuarantee: (payload: CreateGuaranteePayload) =>
    api.post<unknown, ApiResponse<GuaranteeInfo>>('/fulfillment-guarantees', payload),
  getOrderFulfillment: (orderId: number) =>
    api.get<unknown, ApiResponse<FulfillmentSummary>>(`/orders/${orderId}/service-fulfillment`),
  updateLogisticsOrderStatus: (logisticsOrderId: number, status: string, remark?: string) =>
    api.put<unknown, ApiResponse<LogisticsOrderInfo>>(`/logistics/orders/${logisticsOrderId}/status`, {
      status,
      remark,
    }),
  uploadFulfillmentDocument: (
    logisticsOrderId: number,
    payload: UploadFulfillmentDocumentPayload
  ) =>
    api.post<unknown, ApiResponse<unknown>>(
      `/logistics/orders/${logisticsOrderId}/documents`,
      payload
    ),
}
