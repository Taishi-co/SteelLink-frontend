import api from './api'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface BackendListResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
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
  order_id: number
  supplier_name: string
  saving_rate: number
  started_at: string
  ended_at: string
  closed_at?: string
  quotes?: BackendBiddingQuote[]
}

export interface SubmitBiddingQuotePayload {
  unit_price: number
  quantity: number
  delivery_days: number
  remark?: string
}

function mapQuote(quote: BackendBiddingQuote): BiddingQuote {
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
    orderId: activity.order_id,
    supplierName: activity.supplier_name,
    savingRate: activity.saving_rate,
    startedAt: activity.started_at,
    endedAt: activity.ended_at,
    closedAt: activity.closed_at,
    quotes: (activity.quotes || []).map(mapQuote),
  }
}

export const marketService = {
  listBiddings: async () => {
    const response = await api.get<ApiResponse<BackendListResponse<BackendBiddingActivity>>, ApiResponse<BackendListResponse<BackendBiddingActivity>>>('/biddings', { params: { page: 1, page_size: 50, scope: 'workspace' } })
    return response.data.list.map(mapBidding)
  },

  getBidding: async (id: number) => {
    const response = await api.get<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}`)
    return mapBidding(response.data)
  },

  submitBiddingQuote: async (id: number, payload: SubmitBiddingQuotePayload) => {
    const response = await api.post<ApiResponse<BackendBiddingActivity>, ApiResponse<BackendBiddingActivity>>(`/biddings/${id}/quotes`, payload)
    return mapBidding(response.data)
  },
}
