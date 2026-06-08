import api from './api'
import type { ApiResponse } from '@/types'

interface BackendListResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export interface MarketListResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface BiddingStats {
  activeCount: number
  successCount: number
  totalTransaction: number
  participatingCompany: number
}

interface BackendBiddingStats {
  active_count: number
  success_count: number
  total_transaction: number
  participating_company: number
}

export interface BiddingActivity {
  id: number
  biddingNo: string
  title: string
  category: string
  quantity: number
  unit: string
  startPrice: number
  currentPrice: number
  dealAmount: number
  priceChangeRate: number
  participants: number
  progress: number
  status: string
  buyerId: number
  buyerName: string
  deliveryRegion: string
  quoteCount: number
  awardQuoteId: number
  awardSupplierId: number
  orderId: number
  supplierName: string
  savingRate: number
  startedAt: string
  endedAt: string
  closedAt?: string
  quotes?: BiddingQuote[]
}

interface BackendBiddingActivity {
  id: number
  bidding_no: string
  title: string
  category: string
  quantity: number
  unit: string
  start_price: number
  current_price: number
  deal_amount: number
  price_change_rate: number
  participants: number
  progress: number
  status: string
  buyer_id: number
  buyer_name: string
  delivery_region: string
  quote_count: number
  award_quote_id: number
  award_supplier_id: number
  order_id: number
  supplier_name: string
  saving_rate: number
  started_at: string
  ended_at: string
  closed_at?: string
  quotes?: BackendBiddingQuote[]
}

export interface BiddingQuote {
  id: number
  biddingId: number
  supplierId: number
  supplierName: string
  unitPrice: number
  quantity: number
  deliveryDays: number
  remark: string
  round: number
  isAwarded: boolean
  createdAt: string
}

interface BackendBiddingQuote {
  id: number
  bidding_id: number
  supplier_id: number
  supplier_name: string
  unit_price: number
  quantity: number
  delivery_days: number
  remark: string
  round: number
  is_awarded: boolean
  created_at: string
}

export interface CreateBiddingPayload {
  title: string
  category: string
  quantity: number
  unit?: string
  start_price: number
  delivery_region: string
  ended_at: string
}

export interface SubmitBiddingQuotePayload {
  unit_price: number
  quantity: number
  delivery_days: number
  remark?: string
}

export interface ProcurementStats {
  activityCount: number
  preparingCount: number
  successCount: number
  totalTransaction: number
  participatingCompany: number
  demandQuantity: number
}

interface BackendProcurementStats {
  activity_count: number
  preparing_count: number
  success_count: number
  total_transaction: number
  participating_company: number
  demand_quantity: number
}

export interface ProcurementLog {
  id: number
  content: string
  color: string
  createdAt: string
}

interface BackendProcurementLog {
  id: number
  content: string
  color: string
  created_at: string
}

export interface ProcurementActivity {
  id: number
  procurementNo: string
  title: string
  leaderName: string
  status: string
  productId: number
  productNo: string
  productName: string
  sellerEnterpriseId: number
  sellerName: string
  groupPrice: number
  minGroupQuantity: number
  maxGroupQuantity: number
  category: string
  target: string
  targetQuantity: number
  unit: string
  budgetMin: number
  budgetMax: number
  budgetDisplay: string
  stage: string
  progress: number
  region: string
  openDate: string
  participatingCount: number
  demandQuantity: number
  qualifiedSuppliers: number
  quoteCount: number
  contractCount: number
  deliveryDays: number
  quoteMode: string
  evaluationMode: string
  documents: string[]
  adminRemark: string
  sellerRemark: string
  source: string
  startedAt?: string
  endedAt?: string
  sellerRespondedAt?: string
  closedAt?: string
  masterOrderId: number
  masterOrderNo: string
  participants: ProcurementParticipant[]
  logs: ProcurementLog[]
  createdAt: string
  updatedAt: string
}

export interface ProcurementParticipant {
  id: number
  activityId: number
  buyerEnterpriseId: number
  buyerUserId: number
  buyerName: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  contactName: string
  contactPhone: string
  deliveryAddressSource?: string
  destWarehouseServiceId?: number
  destWarehouseEnterpriseId?: number
  destWarehouseName?: string
  destWarehouseProvince?: string
  destWarehouseCity?: string
  destWarehouseDistrict?: string
  destWarehouseAddress?: string
  deliveryAddress: string
  deliveryMethod?: string
  paymentMethod?: string
  deliveryNote?: string
  agreementSigned: boolean
  agreementSignedAt?: string
  status: string
  childOrderId: number
  childOrderNo: string
  remark: string
  createdAt: string
  updatedAt: string
}

interface BackendProcurementActivity {
  id: number
  procurement_no: string
  title: string
  leader_name: string
  status: string
  product_id: number
  product_no: string
  product_name: string
  seller_enterprise_id: number
  seller_name: string
  group_price: number
  min_group_quantity: number
  max_group_quantity: number
  category: string
  target: string
  target_quantity: number
  unit: string
  budget_min: number
  budget_max: number
  budget_display: string
  stage: string
  progress: number
  region: string
  open_date: string
  participating_count: number
  demand_quantity: number
  qualified_suppliers: number
  quote_count: number
  contract_count: number
  delivery_days: number
  quote_mode: string
  evaluation_mode: string
  documents: string[] | null
  admin_remark: string
  seller_remark: string
  source: string
  started_at?: string
  ended_at?: string
  seller_responded_at?: string
  closed_at?: string
  master_order_id: number
  master_order_no: string
  participants?: BackendProcurementParticipant[]
  logs?: BackendProcurementLog[]
  created_at: string
  updated_at: string
}

interface BackendProcurementParticipant {
  id: number
  activity_id: number
  buyer_enterprise_id: number
  buyer_user_id: number
  buyer_name: string
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  contact_name: string
  contact_phone: string
  delivery_address_source?: string
  dest_warehouse_service_id?: number
  dest_warehouse_enterprise_id?: number
  dest_warehouse_name?: string
  dest_warehouse_province?: string
  dest_warehouse_city?: string
  dest_warehouse_district?: string
  dest_warehouse_address?: string
  delivery_address: string
  delivery_method?: string
  payment_method?: string
  delivery_note?: string
  agreement_signed: boolean
  agreement_signed_at?: string
  status: string
  child_order_id: number
  child_order_no: string
  remark: string
  created_at: string
  updated_at: string
}

export interface JoinProcurementPayload {
  quantity: number
  contact_name: string
  contact_phone: string
  delivery_address_source?: 'manual' | 'warehouse'
  dest_warehouse_service_id?: number
  delivery_address: string
  delivery_method?: string
  payment_method?: string
  delivery_note?: string
  agreement_signed: boolean
  remark?: string
}

export interface RequestGroupProcurementPayload {
  source?: string
  source_product_id?: number
  ai_procurement_id?: number
  category: string
  sub_category?: string
  product_name: string
  material?: string
  spec?: string
  quantity: number
  unit?: string
  target_price?: number
  contact_name: string
  contact_phone: string
  delivery_address_source?: 'manual' | 'warehouse'
  dest_warehouse_service_id?: number
  delivery_address?: string
  delivery_method?: string
  payment_method?: string
  delivery_note?: string
  remark?: string
}

export interface ProcurementRequest {
  id: number
  requestNo: string
  source: string
  sourceProductId: number
  aiProcurementId: number
  category: string
  subCategory: string
  productName: string
  material: string
  spec: string
  quantity: number
  unit: string
  targetPrice: number
  contactName: string
  contactPhone: string
  deliveryAddressSource: string
  destWarehouseServiceId: number
  deliveryAddress: string
  deliveryMethod: string
  paymentMethod: string
  deliveryNote: string
  buyerEnterpriseId: number
  buyerUserId: number
  buyerName: string
  status: string
  activityId: number
  remark: string
  createdAt: string
  updatedAt: string
}

interface BackendProcurementRequest {
  id: number
  request_no: string
  source: string
  source_product_id: number
  ai_procurement_id: number
  category: string
  sub_category: string
  product_name: string
  material: string
  spec: string
  quantity: number
  unit: string
  target_price: number
  contact_name: string
  contact_phone: string
  delivery_address_source: string
  dest_warehouse_service_id: number
  delivery_address: string
  delivery_method: string
  payment_method: string
  delivery_note: string
  buyer_enterprise_id: number
  buyer_user_id: number
  buyer_name: string
  status: string
  activity_id: number
  remark: string
  created_at: string
  updated_at: string
}

export interface ProcurementInvitation {
  id: number
  invitationNo: string
  activityId: number
  requestId: number
  buyerEnterpriseId: number
  buyerUserId: number
  buyerName: string
  status: string
  participantId: number
  remark: string
  expiresAt?: string
  acceptedAt?: string
  declinedAt?: string
  activity?: ProcurementActivity
  request?: ProcurementRequest
  createdAt: string
  updatedAt: string
}

export interface ProcurementProjectEnrollment {
  id: number
  projectId: number
  sellerEnterpriseId: number
  sellerUserId: number
  sellerName: string
  productId: number
  productNo: string
  productName: string
  status: string
  remark: string
  reviewedBy: number
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ProcurementProjectQuote {
  id: number
  projectId: number
  enrollmentId: number
  sellerEnterpriseId: number
  sellerUserId: number
  sellerName: string
  productId: number
  productNo: string
  productName: string
  unitPrice: number
  supplyQuantity: number
  unit: string
  deliveryDays: number
  deliveryWarehouse: string
  taxIncluded: boolean
  taxRate: number
  paymentTerms: string
  remark: string
  isLatest: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export interface ProcurementProject {
  id: number
  projectNo: string
  title: string
  status: string
  category: string
  subCategory: string
  productName: string
  material: string
  spec: string
  targetQuantity: number
  demandQuantity: number
  unit: string
  targetPrice: number
  deliveryAddress: string
  buyerRequestCount: number
  buyerEnterpriseCount: number
  invitedSupplierCount: number
  quotedSupplierCount: number
  quoteDeadline?: string
  awardedAt?: string
  orderedAt?: string
  awardQuoteId: number
  awardSupplierId: number
  awardSupplierName: string
  awardProductId: number
  awardProductNo: string
  awardProductName: string
  awardUnitPrice: number
  awardDeliveryDays: number
  orderId: number
  orderNo: string
  adminRemark: string
  requests: ProcurementRequest[]
  enrollments: ProcurementProjectEnrollment[]
  quotes: ProcurementProjectQuote[]
  logs: ProcurementLog[]
  viewerEnrollment?: ProcurementProjectEnrollment
  viewerQuote?: ProcurementProjectQuote
  createdAt: string
  updatedAt: string
}

interface BackendProcurementProjectEnrollment {
  id: number
  project_id: number
  seller_enterprise_id: number
  seller_user_id: number
  seller_name: string
  product_id: number
  product_no: string
  product_name: string
  status: string
  remark: string
  reviewed_by: number
  reviewed_at?: string
  created_at: string
  updated_at: string
}

interface BackendProcurementProjectQuote {
  id: number
  project_id: number
  enrollment_id: number
  seller_enterprise_id: number
  seller_user_id: number
  seller_name: string
  product_id: number
  product_no: string
  product_name: string
  unit_price: number
  supply_quantity: number
  unit: string
  delivery_days: number
  delivery_warehouse: string
  tax_included: boolean
  tax_rate: number
  payment_terms: string
  remark: string
  is_latest: boolean
  status: string
  created_at: string
  updated_at: string
}

interface BackendProcurementProject {
  id: number
  project_no: string
  title: string
  status: string
  category: string
  sub_category: string
  product_name: string
  material: string
  spec: string
  target_quantity: number
  demand_quantity: number
  unit: string
  target_price: number
  delivery_address: string
  buyer_request_count: number
  buyer_enterprise_count: number
  invited_supplier_count: number
  quoted_supplier_count: number
  quote_deadline?: string
  awarded_at?: string
  ordered_at?: string
  award_quote_id: number
  award_supplier_id: number
  award_supplier_name: string
  award_product_id: number
  award_product_no: string
  award_product_name: string
  award_unit_price: number
  award_delivery_days: number
  order_id: number
  order_no: string
  admin_remark: string
  requests?: BackendProcurementRequest[]
  enrollments?: BackendProcurementProjectEnrollment[]
  quotes?: BackendProcurementProjectQuote[]
  logs?: BackendProcurementLog[]
  viewer_enrollment?: BackendProcurementProjectEnrollment
  viewer_quote?: BackendProcurementProjectQuote
  created_at: string
  updated_at: string
}

interface BackendProcurementInvitation {
  id: number
  invitation_no: string
  activity_id: number
  request_id: number
  buyer_enterprise_id: number
  buyer_user_id: number
  buyer_name: string
  status: string
  participant_id: number
  remark: string
  expires_at?: string
  accepted_at?: string
  declined_at?: string
  activity?: BackendProcurementActivity
  request?: BackendProcurementRequest
  created_at: string
  updated_at: string
}

export interface MarketListParams {
  page?: number
  page_size?: number
  status?: string
  keyword?: string
  category?: string
  scope?: 'public' | 'workspace'
}

function mapBidding(activity: BackendBiddingActivity): BiddingActivity {
  return {
    id: activity.id,
    biddingNo: activity.bidding_no,
    title: activity.title,
    category: activity.category,
    quantity: activity.quantity,
    unit: activity.unit,
    startPrice: activity.start_price,
    currentPrice: activity.current_price,
    dealAmount: activity.deal_amount,
    priceChangeRate: activity.price_change_rate,
    participants: activity.participants,
    progress: activity.progress,
    status: activity.status,
    buyerId: activity.buyer_id,
    buyerName: activity.buyer_name,
    deliveryRegion: activity.delivery_region,
    quoteCount: activity.quote_count,
    awardQuoteId: activity.award_quote_id,
    awardSupplierId: activity.award_supplier_id,
    orderId: activity.order_id,
    supplierName: activity.supplier_name,
    savingRate: activity.saving_rate,
    startedAt: activity.started_at,
    endedAt: activity.ended_at,
    closedAt: activity.closed_at,
    quotes: (activity.quotes || []).map(mapBiddingQuote),
  }
}

function mapBiddingQuote(quote: BackendBiddingQuote): BiddingQuote {
  return {
    id: quote.id,
    biddingId: quote.bidding_id,
    supplierId: quote.supplier_id,
    supplierName: quote.supplier_name,
    unitPrice: quote.unit_price,
    quantity: quote.quantity,
    deliveryDays: quote.delivery_days,
    remark: quote.remark,
    round: quote.round,
    isAwarded: quote.is_awarded,
    createdAt: quote.created_at,
  }
}

function mapProcurement(activity: BackendProcurementActivity): ProcurementActivity {
  return {
    id: activity.id,
    procurementNo: activity.procurement_no,
    title: activity.title,
    leaderName: activity.leader_name,
    status: activity.status,
    productId: activity.product_id,
    productNo: activity.product_no,
    productName: activity.product_name,
    sellerEnterpriseId: activity.seller_enterprise_id,
    sellerName: activity.seller_name,
    groupPrice: activity.group_price,
    minGroupQuantity: activity.min_group_quantity,
    maxGroupQuantity: activity.max_group_quantity,
    category: activity.category,
    target: activity.target,
    targetQuantity: activity.target_quantity,
    unit: activity.unit,
    budgetMin: activity.budget_min,
    budgetMax: activity.budget_max,
    budgetDisplay: activity.budget_display,
    stage: activity.stage,
    progress: activity.progress,
    region: activity.region,
    openDate: activity.open_date,
    participatingCount: activity.participating_count,
    demandQuantity: activity.demand_quantity,
    qualifiedSuppliers: activity.qualified_suppliers,
    quoteCount: activity.quote_count,
    contractCount: activity.contract_count,
    deliveryDays: activity.delivery_days,
    quoteMode: activity.quote_mode,
    evaluationMode: activity.evaluation_mode,
    documents: activity.documents || [],
    adminRemark: activity.admin_remark,
    sellerRemark: activity.seller_remark,
    source: activity.source,
    startedAt: activity.started_at,
    endedAt: activity.ended_at,
    sellerRespondedAt: activity.seller_responded_at,
    closedAt: activity.closed_at,
    masterOrderId: activity.master_order_id,
    masterOrderNo: activity.master_order_no,
    participants: (activity.participants || []).map((participant) => ({
      id: participant.id,
      activityId: participant.activity_id,
      buyerEnterpriseId: participant.buyer_enterprise_id,
      buyerUserId: participant.buyer_user_id,
      buyerName: participant.buyer_name,
      quantity: participant.quantity,
      unit: participant.unit,
      unitPrice: participant.unit_price,
      totalAmount: participant.total_amount,
      contactName: participant.contact_name,
      contactPhone: participant.contact_phone,
      deliveryAddressSource: participant.delivery_address_source,
      destWarehouseServiceId: participant.dest_warehouse_service_id,
      destWarehouseEnterpriseId: participant.dest_warehouse_enterprise_id,
      destWarehouseName: participant.dest_warehouse_name,
      destWarehouseProvince: participant.dest_warehouse_province,
      destWarehouseCity: participant.dest_warehouse_city,
      destWarehouseDistrict: participant.dest_warehouse_district,
      destWarehouseAddress: participant.dest_warehouse_address,
      deliveryAddress: participant.delivery_address,
      deliveryMethod: participant.delivery_method,
      paymentMethod: participant.payment_method,
      deliveryNote: participant.delivery_note,
      agreementSigned: participant.agreement_signed,
      agreementSignedAt: participant.agreement_signed_at,
      status: participant.status,
      childOrderId: participant.child_order_id,
      childOrderNo: participant.child_order_no,
      remark: participant.remark,
      createdAt: participant.created_at,
      updatedAt: participant.updated_at,
    })),
    logs: (activity.logs || []).map((log) => ({
      id: log.id,
      content: log.content,
      color: log.color,
      createdAt: log.created_at,
    })),
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  }
}

function mapList<TBackend, TFrontend>(
  response: BackendListResponse<TBackend>,
  mapper: (item: TBackend) => TFrontend,
): MarketListResponse<TFrontend> {
  return {
    list: response.list.map(mapper),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
  }
}

function mapProcurementRequest(item: BackendProcurementRequest): ProcurementRequest {
  return {
    id: item.id,
    requestNo: item.request_no,
    source: item.source,
    sourceProductId: item.source_product_id,
    aiProcurementId: item.ai_procurement_id,
    category: item.category,
    subCategory: item.sub_category,
    productName: item.product_name,
    material: item.material,
    spec: item.spec,
    quantity: item.quantity,
    unit: item.unit,
    targetPrice: item.target_price,
    contactName: item.contact_name,
    contactPhone: item.contact_phone,
    deliveryAddressSource: item.delivery_address_source,
    destWarehouseServiceId: item.dest_warehouse_service_id,
    deliveryAddress: item.delivery_address,
    deliveryMethod: item.delivery_method,
    paymentMethod: item.payment_method,
    deliveryNote: item.delivery_note,
    buyerEnterpriseId: item.buyer_enterprise_id,
    buyerUserId: item.buyer_user_id,
    buyerName: item.buyer_name,
    status: item.status,
    activityId: item.activity_id,
    remark: item.remark,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapProcurementInvitation(item: BackendProcurementInvitation): ProcurementInvitation {
  return {
    id: item.id,
    invitationNo: item.invitation_no,
    activityId: item.activity_id,
    requestId: item.request_id,
    buyerEnterpriseId: item.buyer_enterprise_id,
    buyerUserId: item.buyer_user_id,
    buyerName: item.buyer_name,
    status: item.status,
    participantId: item.participant_id,
    remark: item.remark,
    expiresAt: item.expires_at,
    acceptedAt: item.accepted_at,
    declinedAt: item.declined_at,
    activity: item.activity ? mapProcurement(item.activity) : undefined,
    request: item.request ? mapProcurementRequest(item.request) : undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapProcurementProjectEnrollment(item: BackendProcurementProjectEnrollment): ProcurementProjectEnrollment {
  return {
    id: item.id,
    projectId: item.project_id,
    sellerEnterpriseId: item.seller_enterprise_id,
    sellerUserId: item.seller_user_id,
    sellerName: item.seller_name,
    productId: item.product_id,
    productNo: item.product_no,
    productName: item.product_name,
    status: item.status,
    remark: item.remark,
    reviewedBy: item.reviewed_by,
    reviewedAt: item.reviewed_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapProcurementProjectQuote(item: BackendProcurementProjectQuote): ProcurementProjectQuote {
  return {
    id: item.id,
    projectId: item.project_id,
    enrollmentId: item.enrollment_id,
    sellerEnterpriseId: item.seller_enterprise_id,
    sellerUserId: item.seller_user_id,
    sellerName: item.seller_name,
    productId: item.product_id,
    productNo: item.product_no,
    productName: item.product_name,
    unitPrice: item.unit_price,
    supplyQuantity: item.supply_quantity,
    unit: item.unit,
    deliveryDays: item.delivery_days,
    deliveryWarehouse: item.delivery_warehouse,
    taxIncluded: item.tax_included,
    taxRate: item.tax_rate,
    paymentTerms: item.payment_terms,
    remark: item.remark,
    isLatest: item.is_latest,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapProcurementProject(item: BackendProcurementProject): ProcurementProject {
  return {
    id: item.id,
    projectNo: item.project_no,
    title: item.title,
    status: item.status,
    category: item.category,
    subCategory: item.sub_category,
    productName: item.product_name,
    material: item.material,
    spec: item.spec,
    targetQuantity: item.target_quantity,
    demandQuantity: item.demand_quantity,
    unit: item.unit,
    targetPrice: item.target_price,
    deliveryAddress: item.delivery_address,
    buyerRequestCount: item.buyer_request_count,
    buyerEnterpriseCount: item.buyer_enterprise_count,
    invitedSupplierCount: item.invited_supplier_count,
    quotedSupplierCount: item.quoted_supplier_count,
    quoteDeadline: item.quote_deadline,
    awardedAt: item.awarded_at,
    orderedAt: item.ordered_at,
    awardQuoteId: item.award_quote_id,
    awardSupplierId: item.award_supplier_id,
    awardSupplierName: item.award_supplier_name,
    awardProductId: item.award_product_id,
    awardProductNo: item.award_product_no,
    awardProductName: item.award_product_name,
    awardUnitPrice: item.award_unit_price,
    awardDeliveryDays: item.award_delivery_days,
    orderId: item.order_id,
    orderNo: item.order_no,
    adminRemark: item.admin_remark,
    requests: (item.requests || []).map(mapProcurementRequest),
    enrollments: (item.enrollments || []).map(mapProcurementProjectEnrollment),
    quotes: (item.quotes || []).map(mapProcurementProjectQuote),
    logs: (item.logs || []).map((log) => ({
      id: log.id,
      content: log.content,
      color: log.color,
      createdAt: log.created_at,
    })),
    viewerEnrollment: item.viewer_enrollment ? mapProcurementProjectEnrollment(item.viewer_enrollment) : undefined,
    viewerQuote: item.viewer_quote ? mapProcurementProjectQuote(item.viewer_quote) : undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export const marketService = {
  getBiddingStats: async () => {
    const response = await api.get<ApiResponse<BackendBiddingStats>, ApiResponse<BackendBiddingStats>>('/biddings/stats')
    return {
      activeCount: response.data.active_count,
      successCount: response.data.success_count,
      totalTransaction: response.data.total_transaction,
      participatingCompany: response.data.participating_company,
    }
  },

  listBiddings: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendBiddingActivity>>, ApiResponse<BackendListResponse<BackendBiddingActivity>>>('/biddings', { params })
    return mapList(response.data, mapBidding)
  },

  getBidding: async (id: number) => {
    const response = await api.get<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}`)
    return mapBidding(response.data)
  },

  createBidding: async (payload: CreateBiddingPayload) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>('/biddings', payload)
    return mapBidding(response.data)
  },

  submitBiddingQuote: async (id: number, payload: SubmitBiddingQuotePayload) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}/quotes`, payload)
    return mapBidding(response.data)
  },

  awardBidding: async (id: number, quoteId: number) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}/award`, { quote_id: quoteId })
    return mapBidding(response.data)
  },

  createBiddingOrder: async (id: number) => {
    const response = await api.post<ApiResponse<{ bidding: BackendBiddingActivity; order_id: number; order_no: string }>, ApiResponse<{ bidding: BackendBiddingActivity; order_id: number; order_no: string }>>(`/biddings/${id}/orders`)
    return {
      bidding: mapBidding(response.data.bidding),
      orderId: response.data.order_id,
      orderNo: response.data.order_no,
    }
  },

  getProcurementStats: async () => {
    const response = await api.get<ApiResponse<BackendProcurementStats>, ApiResponse<BackendProcurementStats>>('/procurements/stats')
    return {
      activityCount: response.data.activity_count,
      preparingCount: response.data.preparing_count,
      successCount: response.data.success_count,
      totalTransaction: response.data.total_transaction,
      participatingCompany: response.data.participating_company,
      demandQuantity: response.data.demand_quantity,
    }
  },

  listProcurements: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementActivity>>, ApiResponse<BackendListResponse<BackendProcurementActivity>>>('/procurements', { params })
    return mapList(response.data, mapProcurement)
  },

  listMyProcurements: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementActivity>>, ApiResponse<BackendListResponse<BackendProcurementActivity>>>('/procurements/mine', { params })
    return mapList(response.data, mapProcurement)
  },

  getProcurement: async (id: number) => {
    const response = await api.get<ApiResponse<BackendProcurementActivity>, ApiResponse<BackendProcurementActivity>>(`/procurements/${id}`)
    return mapProcurement(response.data)
  },

  joinProcurement: async (id: number, payload: JoinProcurementPayload) => {
    const response = await api.post<ApiResponse<BackendProcurementActivity>, ApiResponse<BackendProcurementActivity>>(`/procurements/${id}/join`, payload)
    return mapProcurement(response.data)
  },

  requestGroupProcurement: async (payload: RequestGroupProcurementPayload) => {
    const response = await api.post<ApiResponse<BackendProcurementRequest>, ApiResponse<BackendProcurementRequest>>('/procurements/requests', payload)
    return mapProcurementRequest(response.data)
  },

  listMyProcurementRequests: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementRequest>>, ApiResponse<BackendListResponse<BackendProcurementRequest>>>('/procurements/requests/mine', { params })
    return mapList(response.data, mapProcurementRequest)
  },

  listMyProcurementInvitations: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementInvitation>>, ApiResponse<BackendListResponse<BackendProcurementInvitation>>>('/procurements/invitations/mine', { params })
    return mapList(response.data, mapProcurementInvitation)
  },

  acceptProcurementInvitation: async (id: number, payload: JoinProcurementPayload) => {
    const response = await api.post<ApiResponse<BackendProcurementActivity>, ApiResponse<BackendProcurementActivity>>(`/procurements/invitations/${id}/accept`, payload)
    return mapProcurement(response.data)
  },

  listProcurementProjects: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementProject>>, ApiResponse<BackendListResponse<BackendProcurementProject>>>('/procurements/projects', { params })
    return mapList(response.data, mapProcurementProject)
  },

  listMyProcurementProjects: async (params?: MarketListParams) => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendProcurementProject>>, ApiResponse<BackendListResponse<BackendProcurementProject>>>('/procurements/projects/mine', { params })
    return mapList(response.data, mapProcurementProject)
  },

  getProcurementProject: async (id: number) => {
    const response = await api.get<ApiResponse<BackendProcurementProject>, ApiResponse<BackendProcurementProject>>(`/procurements/projects/${id}`)
    return mapProcurementProject(response.data)
  },
}
