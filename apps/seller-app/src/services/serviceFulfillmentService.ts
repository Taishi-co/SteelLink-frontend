import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface WarehouseMovementInfo {
  id: number
  movement_no: string
  status: string
  scheduled_at: string
  completed_at?: string
  remark: string
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

export interface LogisticsOrderInfo {
  id: number
  logistics_no: string
  order_id?: number
  order_no?: string
  status: string
  current_responsible_party?: string
  handover_note?: string
  driver_name: string
  driver_phone: string
  plate_number: string
  pickup_appointment_at?: string
  arrival_signed_in_at?: string
  outbound_confirmed_at?: string
  loading_confirmed_at?: string
  arrival_confirmed_at?: string
  receipt_signed_at?: string
  inbound_completed_at?: string
  created_at?: string
  updated_at?: string
  tracking_events?: TrackingEventInfo[]
  status_requirements?: Array<{
    status: string
    label: string
    actor: string
    description: string
    required_doc_types: string[]
    satisfied: boolean
  }>
}

export interface GuaranteeInfo {
  id: number
  guarantee_no: string
  guarantee_type: string
  status: string
  coverage_amount: number
}

export interface FulfillmentSummary {
  order_id: number
  warehouse_movements: WarehouseMovementInfo[]
  logistics_orders: LogisticsOrderInfo[]
  guarantees: GuaranteeInfo[]
}

export const sellerServiceFulfillmentService = {
  getOrderFulfillment: (orderId: number) =>
    api.get<unknown, ApiResponse<FulfillmentSummary>>(`/orders/${orderId}/service-fulfillment`),
  uploadLogisticsDocument: (
    logisticsOrderId: number,
    payload: { doc_type: string; file_url: string; remark?: string }
  ) =>
    api.post<unknown, ApiResponse<unknown>>(
      `/logistics/orders/${logisticsOrderId}/documents`,
      payload
    ),
}
