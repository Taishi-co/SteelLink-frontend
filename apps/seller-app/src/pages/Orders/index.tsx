import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, ReloadOutlined, ClockCircleOutlined, TruckOutlined } from '@ant-design/icons'
import { getErrorMessage, getErrorStatus, timelineColor } from '@steellink/shared/utils'
import {
  sellerOrderService,
  type SellerOrderInfo,
  type LogisticsQuoteInfo,
} from '@/services/orderService'
import {
  sellerServiceFulfillmentService,
  type FulfillmentSummary,
  type LogisticsOrderInfo,
} from '@/services/serviceFulfillmentService'
import { sellerAuthService, updateSellerUser } from '@/services/auth'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Text, Paragraph } = Typography

const statusMeta: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '草稿' },
  1: { color: 'orange', text: '待确认' },
  2: { color: 'gold', text: '待签合同' },
  3: { color: 'orange', text: '待支付' },
  4: { color: 'blue', text: '已支付' },
  5: { color: 'cyan', text: '待提货' },
  6: { color: 'processing', text: '配送中' },
  7: { color: 'green', text: '已送达' },
  8: { color: 'success', text: '已完成' },
  9: { color: 'red', text: '已取消' },
  10: { color: 'volcano', text: '已冻结' },
  11: { color: 'magenta', text: '异常' },
  12: { color: 'geekblue', text: '待选择目的地仓储' },
  13: { color: 'purple', text: '待仓库确认' },
  14: { color: 'orange', text: '待卖方确认' },
  15: { color: 'blue', text: '待买方确认' },
  16: { color: 'cyan', text: '物流竞价中' },
  17: { color: 'gold', text: '待确认物流' },
  18: { color: 'processing', text: '运输中' },
  19: { color: 'green', text: '已收货' },
  20: { color: 'success', text: '已对账' },
  21: { color: 'default', text: '已归档' },
  22: { color: 'purple', text: '融资审批中' },
  23: { color: 'gold', text: '待签署融资合同' },
  24: { color: 'volcano', text: '待重新选仓' },
  25: { color: 'volcano', text: '待重新发起物流' },
}

const shipmentStatusMap: Record<string, string> = {
  pending_pickup: '待提货',
  picked_up: '已提货',
  delivered: '已送达',
  signed: '已签收',
}

const logisticsResponsibilityText: Record<string, string> = {
  buyer: '买方负责',
  seller: '卖方协同',
  warehouse: '仓储方负责',
  logistics: '物流方负责',
  unknown: '待确认',
}

const logisticsFulfillmentStatusMap: Record<string, string> = {
  task_created: '已创建运输任务',
  pickup_scheduled: '已提货预约',
  arrival_signed_in: '已到场签到',
  outbound_confirmed: '已出库确认',
  loading_confirmed: '已装货确认',
  in_transit: '运输中',
  arrival_confirmed: '已到货确认',
  receipt_signed: '已验收签收',
  inbound_completed: '已入库完成',
  completed: '履约完成',
  pending: '待接单',
  accepted: '已接单',
  delivered: '已送达',
}

const fulfillmentStatusOrder = [
  'task_created',
  'pickup_scheduled',
  'arrival_signed_in',
  'outbound_confirmed',
  'loading_confirmed',
  'in_transit',
  'arrival_confirmed',
  'receipt_signed',
  'inbound_completed',
  'completed',
] as const

const fulfillmentStepDefinitions = [
  {
    key: 'task_created',
    title: '运输任务',
    owner: '物流方负责',
    pendingText: '待创建',
    proofHint: '录入运输委托、司机车牌、计划提货时间',
  },
  {
    key: 'pickup_scheduled',
    title: '提货预约',
    owner: '仓储方负责',
    pendingText: '待仓储确认',
    proofHint: '上传或校对提货预约单、仓库预约回执',
  },
  {
    key: 'arrival_signed_in',
    title: '到场签到',
    owner: '仓储方负责',
    pendingText: '待到场',
    proofHint: '上传签到记录、排队号或入场回执',
  },
  {
    key: 'outbound_confirmed',
    title: '出库确认',
    owner: '仓储方负责',
    pendingText: '待仓储出库',
    proofHint: '上传出库单、放行条、过磅单',
  },
  {
    key: 'loading_confirmed',
    title: '装货确认',
    owner: '物流方负责',
    pendingText: '待物流接责',
    proofHint: '上传装车照片，校对车牌、提货码',
  },
  {
    key: 'in_transit',
    title: '运输中',
    owner: '物流方负责',
    pendingText: '待发运',
    proofHint: '回传定位、在途照片、异常说明',
  },
  {
    key: 'arrival_confirmed',
    title: '到货确认',
    owner: '买方负责',
    pendingText: '待到货',
    proofHint: '校对到货时间，上传到货照片、卸货回执',
  },
  {
    key: 'receipt_signed',
    title: '验收签收',
    owner: '买方负责',
    pendingText: '待买方签收',
    proofHint: '上传签收单、质检结果或验收意见',
  },
  {
    key: 'inbound_completed',
    title: '入库完成',
    owner: '仓储方负责',
    pendingText: '按需入库',
    proofHint: '上传入库单、入库磅单、库位回执',
  },
  {
    key: 'completed',
    title: '履约完成',
    owner: '多方闭环',
    pendingText: '未完成',
    proofHint: '校对全套回单、异常结论、结算凭证',
  },
] as const

function normalizeFulfillmentStatus(status?: string) {
  if (!status) return 'task_created'
  if (status === 'pending') return 'task_created'
  if (status === 'accepted') return 'pickup_scheduled'
  if (status === 'picked_up') return 'in_transit'
  if (status === 'delivered') return 'arrival_confirmed'
  return status
}

function getFulfillmentCurrentStep(status?: string) {
  const normalized = normalizeFulfillmentStatus(status)
  const index = fulfillmentStatusOrder.indexOf(
    normalized as (typeof fulfillmentStatusOrder)[number]
  )
  return index >= 0 ? index : 0
}

function getFulfillmentStepDescription(
  stepKey: (typeof fulfillmentStepDefinitions)[number]['key'],
  logistics?: LogisticsOrderInfo
) {
  if (!logistics) {
    return fulfillmentStepDefinitions.find((item) => item.key === stepKey)?.pendingText || '-'
  }
  switch (stepKey) {
    case 'task_created':
      return logistics.created_at ? formatDate(logistics.created_at) : '已创建'
    case 'pickup_scheduled':
      return logistics.pickup_appointment_at
        ? formatDate(logistics.pickup_appointment_at)
        : '待仓储确认'
    case 'arrival_signed_in':
      return logistics.arrival_signed_in_at ? formatDate(logistics.arrival_signed_in_at) : '待到场'
    case 'outbound_confirmed':
      return logistics.outbound_confirmed_at
        ? formatDate(logistics.outbound_confirmed_at)
        : '待仓储出库'
    case 'loading_confirmed':
      return logistics.loading_confirmed_at
        ? formatDate(logistics.loading_confirmed_at)
        : '待物流接责'
    case 'in_transit':
      return normalizeFulfillmentStatus(logistics.status) === 'in_transit'
        ? logistics.tracking_events?.[0]?.description || '在途履约中'
        : '待发运'
    case 'arrival_confirmed':
      return logistics.arrival_confirmed_at ? formatDate(logistics.arrival_confirmed_at) : '待到货'
    case 'receipt_signed':
      return logistics.receipt_signed_at ? formatDate(logistics.receipt_signed_at) : '待买方签收'
    case 'inbound_completed':
      return logistics.inbound_completed_at
        ? formatDate(logistics.inbound_completed_at)
        : '按需入库'
    case 'completed':
      return normalizeFulfillmentStatus(logistics.status) === 'completed' ? '已完成' : '未完成'
    default:
      return '-'
  }
}

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '待确认', value: 1 },
  { label: '待签合同', value: 2 },
  { label: '待支付', value: 3 },
  { label: '待确认收款', value: 4 },
  { label: '待提货', value: 5 },
  { label: '物流竞价中', value: 15 },
  { label: '待确认物流', value: 16 },
  { label: '配送中', value: 6 },
  { label: '已送达', value: 7 },
  { label: '已完成', value: 8 },
  { label: '已取消', value: 9 },
]

const activeOrderStatuses = [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18, 22, 23]

const summaryStatusItems = [
  { key: 'active', label: '进行中', statuses: activeOrderStatuses },
  { key: 1, label: '待确认', statuses: [1] },
  { key: 4, label: '待确认收款', statuses: [4] },
  { key: 5, label: '待提货', statuses: [5] },
  { key: 15, label: '物流竞价中', statuses: [15] },
  { key: 8, label: '已完成', statuses: [8] },
] as const

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`
}

function formatStatus(status: number) {
  return statusMeta[status] ?? { color: 'default', text: `状态${status}` }
}

function formatDate(value?: string) {
  if (!value) {
    return '-'
  }
  return value.replace('T', ' ').slice(0, 19)
}

function formatContractStatus(contractInfo?: { buyer_signed: boolean; seller_signed: boolean }) {
  if (!contractInfo) return '-'
  if (contractInfo.buyer_signed && contractInfo.seller_signed) {
    return '双方已签，已进入下一步'
  }
  if (contractInfo.buyer_signed) {
    return '买家已签，卖家未签'
  }
  if (contractInfo.seller_signed) {
    return '卖家已签，买家未签'
  }
  return '双方未签'
}

function getPrimaryProduct(order: SellerOrderInfo) {
  return order.items[0]
}

function getSellerGuidance(order?: SellerOrderInfo | null) {
  if (!order)
    return { type: 'info' as const, title: '当前状态：订单详情', next: '请查看订单信息。' }
  if (order.status === 14)
    return {
      type: 'warning' as const,
      title: '当前状态：待卖方确认',
      next: '核对条款后确认订单，随后等待买方确认。',
    }
  if (order.status === 15)
    return {
      type: 'info' as const,
      title: '当前状态：待买方最终确认',
      next: '买方正在确认订单条款，等待买方最终确认后进入签署合同节点。',
    }
  if (order.status === 2) {
    if (order.contract_info?.buyer_signed && order.contract_info?.seller_signed) {
      return {
        type: 'success' as const,
        title: '当前状态：双方签署已完成',
        next: '签署状态：买家已签，卖家已签。已进入支付节点。',
      }
    }
    if (order.contract_info?.seller_signed) {
      return {
        type: 'info' as const,
        title: '当前状态：卖方签署已完成',
        next: '签署状态：卖家已签，买家未签。等待买方签署后进入支付节点。',
      }
    }
    if (order.contract_info?.buyer_signed) {
      return {
        type: 'warning' as const,
        title: '当前状态：买方签署已完成',
        next: '签署状态：买家已签，卖家未签。请先查看详情并完成签署。',
      }
    }
    return {
      type: 'warning' as const,
      title: '当前状态：待签合同',
      next: '签署状态：买家未签，卖家未签。请签署合同；双方签署后进入支付节点。',
    }
  }
  if (order.status === 4)
    return {
      type: 'warning' as const,
      title: '当前状态：买方支付已完成',
      next: '请确认收款；之后发起物流竞价。',
    }
  if (order.status === 5)
    return {
      type: 'warning' as const,
      title: '当前状态：待提货',
      next: '请发起物流竞价，物流方报价后选择并等待确认。',
    }
  if (order.status === 16)
    return {
      type: 'info' as const,
      title: '当前状态：物流竞价已发起',
      next: '等待物流方报价，也可在无运力时反馈平台。',
    }
  if (order.status === 17)
    return {
      type: 'warning' as const,
      title: '当前状态：物流报价已完成',
      next: '如合同约定卖方承担运费，请确认物流报价。',
    }
  if (order.status === 25)
    return {
      type: 'warning' as const,
      title: '当前状态：待重新发起物流',
      next: '平台已收到无运力反馈，请重新发起物流竞价。',
    }
  if (order.status === 19)
    return { type: 'success' as const, title: '当前状态：买方收货已完成', next: '请完成对账确认。' }
  if (order.status === 20)
    return {
      type: 'success' as const,
      title: '当前状态：对账已完成',
      next: '等待归档或回工作台查看订单。',
    }
  return {
    type: 'info' as const,
    title: `当前状态：${formatStatus(order.status).text}`,
    next: '请按订单详情中的可用操作继续处理。',
  }
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<SellerOrderInfo[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | number>('all')
  const [selectedOrder, setSelectedOrder] = useState<SellerOrderInfo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'payment' | 'outbound'
    order: SellerOrderInfo
  } | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [logisticsQuotes, setLogisticsQuotes] = useState<LogisticsQuoteInfo[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [quoteModalOrder, setQuoteModalOrder] = useState<SellerOrderInfo | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('orders')
  const [biddingQuoteMap, setBiddingQuoteMap] = useState<Record<number, LogisticsQuoteInfo[]>>({})
  const [biddingQuoteLoadingMap, setBiddingQuoteLoadingMap] = useState<Record<number, boolean>>({})
  const [fulfillmentSummary, setFulfillmentSummary] = useState<FulfillmentSummary | null>(null)
  const [fulfillmentLoading, setFulfillmentLoading] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const list = await sellerOrderService.list()
      setOrders(list)
    } catch (error: unknown) {
      if (getErrorStatus(error) === 403) {
        try {
          const res = await sellerAuthService.me()
          if (res.code === 0 && res.data) {
            updateSellerUser(res.data)
          }
        } catch {
          // Ignore refresh failure; the permission error below is the actionable state.
        }
        message.warning('企业仍在审核中或登录状态未刷新，请先完成企业审核后再访问订单管理')
        navigate('/enterprise', { replace: true })
        return
      }
      message.error(getErrorMessage(error, '订单加载失败'))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (!selectedOrder?.id) {
      setFulfillmentSummary(null)
      return
    }
    let cancelled = false
    setFulfillmentLoading(true)
    sellerServiceFulfillmentService
      .getOrderFulfillment(selectedOrder.id)
      .then((response) => {
        if (!cancelled) {
          setFulfillmentSummary(response.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFulfillmentSummary(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFulfillmentLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [selectedOrder?.id])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const primary = getPrimaryProduct(order)
      const matchesSearch =
        !searchText ||
        order.order_no.includes(searchText) ||
        order.buyer_name.includes(searchText) ||
        primary?.product_name?.includes(searchText)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && activeOrderStatuses.includes(order.status)) ||
        order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchText, statusFilter])

  const orderSummary = useMemo(() => {
    const totalAmount = orders
      .filter((order) => ![0, 9, 10].includes(order.status))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)

    return {
      total: orders.length,
      totalAmount,
      statusCounts: orders.reduce<Record<number, number>>((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1
        return counts
      }, {}),
    }
  }, [orders])

  const logisticsBiddingOrders = useMemo(() => {
    return orders.filter((order) => [16, 17].includes(order.status))
  }, [orders])

  const loadBiddingQuotes = useCallback(async (orderId: number) => {
    setBiddingQuoteLoadingMap((prev) => ({ ...prev, [orderId]: true }))
    try {
      const quotes = await sellerOrderService.listLogisticsQuotes(orderId)
      setBiddingQuoteMap((prev) => ({ ...prev, [orderId]: quotes }))
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '获取物流报价失败'))
    } finally {
      setBiddingQuoteLoadingMap((prev) => ({ ...prev, [orderId]: false }))
    }
  }, [])

  const handleCloseBidding = useCallback(
    async (order: SellerOrderInfo) => {
      setActionLoading(true)
      try {
        const detail = await sellerOrderService.closeLogisticsBidding(order.id)
        message.success('物流报价已结束，请查看报价列表并选择')
        setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
        await loadBiddingQuotes(order.id)
      } catch (error: unknown) {
        message.error(getErrorMessage(error, '结束报价失败'))
      } finally {
        setActionLoading(false)
      }
    },
    [loadBiddingQuotes]
  )

  const handleSelectQuote = useCallback(async (order: SellerOrderInfo, quoteId: number) => {
    setActionLoading(true)
    try {
      const detail = await sellerOrderService.selectLogisticsQuote(order.id, { quote_id: quoteId })
      message.success('物流报价已选择，请等待买家确认')
      setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '选择报价失败'))
    } finally {
      setActionLoading(false)
    }
  }, [])

  const setSummaryFilter = (item: (typeof summaryStatusItems)[number]) => {
    setStatusFilter(item.key)
  }

  const showCompleted = (title: string, next: string, detail?: SellerOrderInfo) => {
    Modal.success({
      title,
      content: (
        <Space direction="vertical" size={8}>
          <Text>已完成：{title.replace('已完成', '')}</Text>
          <Text type="secondary">下一步：{next}</Text>
          <Text type="secondary">管理端可在订单详情中查看本次节点事件记录。</Text>
        </Space>
      ),
      okText: '回订单工作台',
      onOk: () => {
        if (detail) {
          setSelectedOrder(detail)
          setIsModalOpen(true)
        }
      },
    })
  }

  async function openOrderDetail(order: SellerOrderInfo) {
    setActionLoading(true)
    try {
      const detail = await sellerOrderService.getById(order.id)
      setSelectedOrder(detail)
      setIsModalOpen(true)
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '订单详情加载失败'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmOrder(order: SellerOrderInfo) {
    setActionLoading(true)
    try {
      const detail = await sellerOrderService.confirmOrder(order.id)
      showCompleted('订单确认已完成', '等待买卖双方签署合同。', detail)
      setSelectedOrder(detail)
      setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
      setIsModalOpen(true)
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '确认订单失败'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSignContract(order: SellerOrderInfo) {
    setActionLoading(true)
    try {
      const detail = await sellerOrderService.signContract(order.id)
      setSelectedOrder(detail)
      setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
      setIsModalOpen(true)
      if (detail.contract_info?.buyer_signed && detail.contract_info?.seller_signed) {
        message.success('合同已完成双方签署，进入支付节点')
      } else {
        message.success('卖方签署已完成，等待买方签署')
      }
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '签署合同失败'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmPayment(order: SellerOrderInfo) {
    setConfirmAction({ type: 'payment', order })
    setConfirmInput('')
  }

  async function handleConfirmOutbound(order: SellerOrderInfo) {
    setConfirmAction({ type: 'outbound', order })
    setConfirmInput('')
  }

  async function executeConfirmAction() {
    if (!confirmAction) return
    const { type, order } = confirmAction
    const lastFour = order.order_no.slice(-4)
    if (type === 'payment' && confirmInput !== lastFour) {
      message.error(`请输入订单号后 4 位「${lastFour}」以确认操作`)
      return
    }
    if (type === 'outbound' && !confirmInput.trim()) {
      message.error('请输入提货码')
      return
    }
    setActionLoading(true)
    try {
      if (type === 'payment') {
        const detail = await sellerOrderService.confirmPayment(order.id)
        showCompleted('收款确认已完成', '可发起物流竞价或等待提货履约。', detail)
        setSelectedOrder(detail)
        setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
        setIsModalOpen(true)
      } else {
        const detail = await sellerOrderService.confirmOutbound(order.id, {
          pickup_code: confirmInput.trim(),
        })
        showCompleted('出库确认已完成', '等待物流运输并由买方确认收货。', detail)
        setSelectedOrder(detail)
        setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
        setIsModalOpen(true)
      }
      setConfirmAction(null)
      setConfirmInput('')
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '操作失败'))
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnsType<SellerOrderInfo> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 210,
      render: (value: string) => <Text className="text-sm font-medium text-gray-900">{value}</Text>,
    },
    {
      title: '买家企业',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      width: 170,
      ellipsis: true,
    },
    {
      title: '商品',
      key: 'product',
      width: 260,
      render: (_, record) => {
        const product = getPrimaryProduct(record)
        if (!product) {
          return '-'
        }
        return (
          <div>
            <div className="line-clamp-2 font-medium text-gray-900">{product.product_name}</div>
            <div className="text-xs text-gray-500">
              {product.steel_mill || '未填写钢厂'} / {product.bundle_no || '未填捆包号'}
            </div>
          </div>
        )
      },
    },
    {
      title: '数量',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 110,
      render: (value: number) => `${value} 吨`,
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 130,
      render: (value: number) => <Text className="font-medium">{formatCurrency(value)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: number) => {
        const meta = formatStatus(status)
        return <Tag color={meta.color}>{meta.text}</Tag>
      },
    },
    {
      title: '支付凭证',
      key: 'payment',
      width: 120,
      render: (_, record) =>
        record.payment_info?.voucher_url ? <Tag color="blue">已上传</Tag> : <Tag>未上传</Tag>,
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (value: string) => formatDate(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space wrap size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => void openOrderDetail(record)}
          >
            详情
          </Button>
          {record.status === 1 && (
            <Button type="link" size="small" onClick={() => void handleConfirmOrder(record)}>
              确认订单
            </Button>
          )}
          {record.status === 14 && (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.sellerConfirm(record.id)
                  showCompleted('卖方条款确认已完成', '等待买方确认订单最终版本。', detail)
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '确认失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              确认条款
            </Button>
          )}
          {record.status === 2 && !record.contract_info?.seller_signed && (
            <Button type="link" size="small" onClick={() => void openOrderDetail(record)}>
              签署合同
            </Button>
          )}
          {record.status === 4 && (
            <Button type="link" size="small" onClick={() => void handleConfirmPayment(record)}>
              确认收款
            </Button>
          )}
          {(record.status === 4 || record.status === 5 || record.status === 25) && (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.createLogisticsBidding(record.id, {
                    freight_payer: 'buyer',
                  })
                  showCompleted(
                    '物流竞价发起已完成',
                    '等待物流方报价；订单详情和管理端会记录本次发起事件。',
                    detail
                  )
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '发起竞价失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              发起物流竞价
            </Button>
          )}
          {record.status === 16 && (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.closeLogisticsBidding(record.id)
                  message.success('物流报价已结束，请查看报价列表并选择')
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '结束报价失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              结束报价
            </Button>
          )}
          {(record.status === 16 || record.status === 17) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setQuoteModalOrder(record)
                setSelectedQuoteId(null)
                setQuoteLoading(true)
                sellerOrderService
                  .listLogisticsQuotes(record.id)
                  .then((quotes) => {
                    setLogisticsQuotes(quotes)
                  })
                  .catch((error: unknown) => {
                    message.error(getErrorMessage(error, '获取报价列表失败'))
                  })
                  .finally(() => {
                    setQuoteLoading(false)
                  })
              }}
            >
              {record.status === 16 ? '查看物流报价' : '选择物流报价'}
            </Button>
          )}
          {(record.status === 16 || record.status === 17) && (
            <Button
              type="link"
              size="small"
              danger
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.reportLogisticsNoCapacity(record.id, {
                    no_capacity_reason: '暂无合规运力承接',
                  })
                  showCompleted(
                    '无运力反馈已完成',
                    '平台管理端已收到反馈，订单回退为待重新发起物流。',
                    detail
                  )
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '反馈失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              无运力反馈
            </Button>
          )}
          {record.status === 5 && record.delivery_info?.pickup_code && (
            <Button type="link" size="small" onClick={() => void handleConfirmOutbound(record)}>
              确认出库
            </Button>
          )}
          {record.status === 19 && (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.reconcile(record.id)
                  showCompleted('对账确认已完成', '等待归档，交易闭环即将完成。', detail)
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '对账失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              对账确认
            </Button>
          )}
          {record.status === 20 && (
            <Button
              type="link"
              size="small"
              onClick={async () => {
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.archive(record.id)
                  showCompleted(
                    '订单归档完成',
                    '交易闭环已完成，可回工作台查看历史订单记录。',
                    detail
                  )
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '归档失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              订单归档
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const selectedPrimaryProduct = selectedOrder ? getPrimaryProduct(selectedOrder) : null
  const selectedStatus = selectedOrder ? formatStatus(selectedOrder.status) : null
  const selectedGuidance = getSellerGuidance(selectedOrder)
  const selectedFulfillmentLogistics = fulfillmentSummary?.logistics_orders?.[0]
  const selectedFulfillmentMovement = fulfillmentSummary?.warehouse_movements?.[0]

  return (
    <div className="min-w-0">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'orders',
            label: '订单管理',
            children: (
              <Card
                extra={
                  <Button icon={<ReloadOutlined />} onClick={() => void loadOrders()}>
                    刷新
                  </Button>
                }
              >
                <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-6">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      statusFilter === 'all'
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-xs text-gray-500">全部订单</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                      {orderSummary.total}
                    </div>
                  </button>
                  {summaryStatusItems.map((item) => {
                    const count = item.statuses.reduce(
                      (sum, status) => sum + (orderSummary.statusCounts[status] || 0),
                      0
                    )
                    const active = statusFilter === item.key
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSummaryFilter(item)}
                        className={`rounded-lg border px-4 py-3 text-left transition ${
                          active
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                        }`}
                      >
                        <div className="text-xs text-gray-500">{item.label}</div>
                        <div className="mt-1 text-2xl font-semibold text-gray-900">{count}</div>
                      </button>
                    )
                  })}
                </div>

                <Alert
                  className="mb-4"
                  type="info"
                  showIcon
                  message={`当前有效订单金额 ${formatCurrency(orderSummary.totalAmount)}`}
                  description="卖家可在这里确认订单、签署合同、确认收款和核销出库；高风险操作仍会弹窗二次确认。"
                />

                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
                  <Search
                    className="w-full xl:max-w-md"
                    placeholder="搜索订单号 / 买家企业 / 商品名"
                    allowClear
                    onSearch={setSearchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    value={searchText}
                  />
                  <Select
                    className="w-full xl:w-44"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                  />
                </div>

                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={filteredOrders}
                  rowKey="id"
                  size="middle"
                  scroll={{ x: 1520 }}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              </Card>
            ),
          },
          {
            key: 'logistics-bidding',
            label: (
              <span>
                <TruckOutlined style={{ marginRight: 6 }} />
                物流竞价
                {logisticsBiddingOrders.length > 0 && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {logisticsBiddingOrders.length}
                  </Tag>
                )}
              </span>
            ),
            children: (
              <Card
                extra={
                  <Button icon={<ReloadOutlined />} onClick={() => void loadOrders()}>
                    刷新
                  </Button>
                }
              >
                {logisticsBiddingOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <TruckOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <div className="mt-4 text-gray-500">暂无物流竞价订单</div>
                    <div className="mt-2 text-sm text-gray-400">
                      在订单管理中发起物流竞价后，可在此查看竞价情况和管理报价
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert
                      type="info"
                      showIcon
                      message="物流竞价管理"
                      description="在此查看所有物流竞价订单的报价情况，结束竞价后可选择物流报价。"
                    />
                    {logisticsBiddingOrders.map((order) => {
                      const bidding = order.logistics_bidding
                      const quotes = biddingQuoteMap[order.id] || order.logistics_quotes || []
                      const quotesLoading = biddingQuoteLoadingMap[order.id] || false
                      const isOpen = order.status === 16
                      const isPendingConfirm = order.status === 17
                      const lowestAmount =
                        quotes.length > 0 ? Math.min(...quotes.map((q) => q.amount)) : null

                      return (
                        <Card
                          key={order.id}
                          title={
                            <Space>
                              <Tag color={isOpen ? 'processing' : 'gold'}>
                                {isOpen ? '竞价中' : '待确认物流'}
                              </Tag>
                              <Text strong>{order.order_no}</Text>
                              <Text type="secondary">{order.buyer_name}</Text>
                            </Space>
                          }
                          extra={
                            <Space>
                              {isOpen && (
                                <Button
                                  type="primary"
                                  danger
                                  size="small"
                                  loading={actionLoading}
                                  onClick={() => void handleCloseBidding(order)}
                                >
                                  结束竞价
                                </Button>
                              )}
                              <Button
                                size="small"
                                loading={quotesLoading}
                                onClick={() => void loadBiddingQuotes(order.id)}
                              >
                                {quotes.length > 0 ? '刷新报价' : '加载报价'}
                              </Button>
                            </Space>
                          }
                          size="small"
                        >
                          <Descriptions bordered column={4} size="small">
                            <Descriptions.Item label="商品">
                              {getPrimaryProduct(order)?.product_name || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="数量">
                              {order.total_quantity} 吨
                            </Descriptions.Item>
                            <Descriptions.Item label="订单金额">
                              {formatCurrency(order.total_amount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="运费承担方">
                              {bidding?.freight_payer === 'buyer' ? '买家' : '卖家'}
                            </Descriptions.Item>
                            <Descriptions.Item label="竞价发起时间">
                              {formatDate(bidding?.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="报价数量">
                              <Tag color={quotes.length > 0 ? 'blue' : 'default'}>
                                {quotes.length} 条
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="最低报价">
                              {lowestAmount !== null ? (
                                <Text strong style={{ color: '#cf1322' }}>
                                  {formatCurrency(lowestAmount)}
                                </Text>
                              ) : (
                                '暂无报价'
                              )}
                            </Descriptions.Item>
                            <Descriptions.Item label="竞价状态">
                              <Tag color={bidding?.status === 'open' ? 'processing' : 'success'}>
                                {bidding?.status === 'open'
                                  ? '竞价中'
                                  : bidding?.status === 'selected'
                                    ? '已结束'
                                    : bidding?.status || '-'}
                              </Tag>
                            </Descriptions.Item>
                          </Descriptions>

                          {quotes.length > 0 ? (
                            <div style={{ marginTop: 12 }}>
                              <div className="mb-2 flex items-center justify-between">
                                <Text strong>物流报价列表</Text>
                                {isPendingConfirm && (
                                  <Text type="secondary">请选择一个物流报价</Text>
                                )}
                              </div>
                              <Table
                                loading={quotesLoading}
                                dataSource={quotes}
                                rowKey="id"
                                size="small"
                                pagination={false}
                                rowSelection={
                                  isPendingConfirm
                                    ? {
                                        type: 'radio',
                                        selectedRowKeys: bidding?.seller_confirmed_quote_id
                                          ? [bidding.seller_confirmed_quote_id]
                                          : [],
                                        onChange: (selectedRowKeys) => {
                                          if (selectedRowKeys.length > 0) {
                                            void handleSelectQuote(
                                              order,
                                              selectedRowKeys[0] as number
                                            )
                                          }
                                        },
                                      }
                                    : undefined
                                }
                                columns={[
                                  {
                                    title: '物流企业',
                                    dataIndex: 'logistics_name',
                                    key: 'logistics_name',
                                    width: 160,
                                  },
                                  {
                                    title: '报价金额',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    width: 120,
                                    render: (v: number) => (
                                      <Text strong style={{ color: '#cf1322' }}>
                                        {formatCurrency(v)}
                                      </Text>
                                    ),
                                    sorter: (a, b) => a.amount - b.amount,
                                  },
                                  {
                                    title: '车辆信息',
                                    dataIndex: 'vehicle_info',
                                    key: 'vehicle_info',
                                    width: 140,
                                    render: (v: string) => v || '-',
                                  },
                                  {
                                    title: '司机信息',
                                    dataIndex: 'driver_info',
                                    key: 'driver_info',
                                    width: 140,
                                    render: (v: string) => v || '-',
                                  },
                                  {
                                    title: '预计提货',
                                    dataIndex: 'estimated_pickup_at',
                                    key: 'estimated_pickup_at',
                                    width: 160,
                                    render: (v: string) => formatDate(v),
                                  },
                                  {
                                    title: '预计送达',
                                    dataIndex: 'estimated_delivery_at',
                                    key: 'estimated_delivery_at',
                                    width: 160,
                                    render: (v: string) => formatDate(v),
                                  },
                                  {
                                    title: '备注',
                                    dataIndex: 'remark',
                                    key: 'remark',
                                    width: 140,
                                    ellipsis: true,
                                    render: (v: string) => v || '-',
                                  },
                                  {
                                    title: '操作',
                                    key: 'action',
                                    width: 100,
                                    render: (_: unknown, quote: LogisticsQuoteInfo) =>
                                      isPendingConfirm ? (
                                        <Button
                                          type="link"
                                          size="small"
                                          loading={actionLoading}
                                          onClick={() => void handleSelectQuote(order, quote.id)}
                                        >
                                          选择此报价
                                        </Button>
                                      ) : null,
                                  },
                                ]}
                              />
                            </div>
                          ) : (
                            <div className="mt-3 text-center py-6">
                              <ClockCircleOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                              <div className="mt-2 text-gray-400">
                                {quotesLoading
                                  ? '正在加载报价...'
                                  : isOpen
                                    ? '等待物流方报价中...'
                                    : '暂无报价'}
                              </div>
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title="订单详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            关闭
          </Button>,
          selectedOrder?.status === 1 ? (
            <Button
              key="confirm-order"
              type="primary"
              loading={actionLoading}
              onClick={() => selectedOrder && void handleConfirmOrder(selectedOrder)}
            >
              确认订单
            </Button>
          ) : null,
          selectedOrder?.status === 2 && !selectedOrder.contract_info?.seller_signed ? (
            <Button
              key="sign-contract"
              type="primary"
              loading={actionLoading}
              onClick={() => selectedOrder && void handleSignContract(selectedOrder)}
            >
              签署合同
            </Button>
          ) : null,
          selectedOrder?.status === 4 && selectedOrder.payment_info?.voucher_url ? (
            <Button
              key="confirm"
              type="primary"
              loading={actionLoading}
              onClick={() => void handleConfirmPayment(selectedOrder)}
            >
              确认收款
            </Button>
          ) : null,
          selectedOrder?.status === 5 && selectedOrder.delivery_info?.pickup_code ? (
            <Button
              key="outbound"
              type="primary"
              onClick={() => handleConfirmOutbound(selectedOrder)}
            >
              确认出库
            </Button>
          ) : null,
          selectedOrder?.status === 4 ||
          selectedOrder?.status === 5 ||
          selectedOrder?.status === 25 ? (
            <Button
              key="logistics-bidding"
              type="primary"
              loading={actionLoading}
              onClick={async () => {
                if (!selectedOrder) return
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.createLogisticsBidding(selectedOrder.id, {
                    freight_payer: 'buyer',
                  })
                  showCompleted(
                    '物流竞价发起已完成',
                    '等待物流方报价；订单详情和管理端会记录本次发起事件。',
                    detail
                  )
                  setSelectedOrder(detail)
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '发起竞价失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              发起物流竞价
            </Button>
          ) : null,
          selectedOrder?.status === 16 ? (
            <Button
              key="close-bidding"
              type="primary"
              loading={actionLoading}
              onClick={async () => {
                if (!selectedOrder) return
                setActionLoading(true)
                try {
                  const detail = await sellerOrderService.closeLogisticsBidding(selectedOrder.id)
                  message.success('物流报价已结束，请查看报价列表并选择')
                  setSelectedOrder(detail)
                  setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                } catch (error: unknown) {
                  message.error(getErrorMessage(error, '结束报价失败'))
                } finally {
                  setActionLoading(false)
                }
              }}
            >
              结束报价
            </Button>
          ) : null,
          selectedOrder?.status === 16 || selectedOrder?.status === 17 ? (
            <Button
              key="view-quotes"
              onClick={() => {
                if (!selectedOrder) return
                setQuoteModalOrder(selectedOrder)
                setSelectedQuoteId(null)
                setQuoteLoading(true)
                sellerOrderService
                  .listLogisticsQuotes(selectedOrder.id)
                  .then((quotes) => {
                    setLogisticsQuotes(quotes)
                    setQuoteLoading(false)
                  })
                  .catch(() => {
                    message.error('获取物流报价失败')
                    setQuoteLoading(false)
                  })
              }}
            >
              查看物流报价
            </Button>
          ) : null,
        ]}
        width={860}
      >
        {selectedOrder ? (
          <Spin spinning={actionLoading}>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="订单号" span={2}>
                {selectedOrder.order_no}
              </Descriptions.Item>
              <Descriptions.Item label="买家企业">{selectedOrder.buyer_name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedStatus ? (
                  <Tag color={selectedStatus.color}>{selectedStatus.text}</Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="商品名称">
                {selectedPrimaryProduct?.product_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="钢厂 / 捆包号">
                {selectedPrimaryProduct
                  ? `${selectedPrimaryProduct.steel_mill || '未填钢厂'} / ${selectedPrimaryProduct.bundle_no || '未填捆包号'}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数量">{selectedOrder.total_quantity} 吨</Descriptions.Item>
              <Descriptions.Item label="订单金额">
                {formatCurrency(selectedOrder.total_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {formatDate(selectedOrder.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="过期时间">
                {formatDate(selectedOrder.expires_at)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Alert
                type={selectedGuidance.type}
                showIcon
                message={selectedGuidance.title}
                description={`下一步：${selectedGuidance.next}`}
              />
            </div>

            <Descriptions bordered column={2} size="middle" style={{ marginTop: 16 }}>
              <Descriptions.Item label="合同编号">
                {selectedOrder.contract_info?.contract_no || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="合同状态">
                {formatContractStatus(selectedOrder.contract_info)}
              </Descriptions.Item>
              <Descriptions.Item label="买家签署">
                {selectedOrder.contract_info?.buyer_signed ? '已签署' : '未签署'}
              </Descriptions.Item>
              <Descriptions.Item label="卖家签署">
                {selectedOrder.contract_info?.seller_signed ? '已签署' : '未签署'}
              </Descriptions.Item>
              <Descriptions.Item label="合同文件" span={2}>
                {selectedOrder.contract_info?.contract_url ? (
                  <a
                    href={selectedOrder.contract_info.contract_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看合同
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="middle" style={{ marginTop: 16 }}>
              <Descriptions.Item label="交易流水号">
                {selectedOrder.payment_info?.transaction_no || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {formatDate(selectedOrder.payment_info?.payment_time)}
              </Descriptions.Item>
              <Descriptions.Item label="付款账户">
                {selectedOrder.payment_info?.payer_account || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="收款账户">
                {selectedOrder.payment_info?.payee_account || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="上传时间">
                {formatDate(selectedOrder.payment_info?.uploaded_at)}
              </Descriptions.Item>
              <Descriptions.Item label="水印时间">
                {selectedOrder.payment_info?.captured_at || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="支付凭证" span={2}>
                {selectedOrder.payment_info?.voucher_url ? (
                  <a href={selectedOrder.payment_info.voucher_url} target="_blank" rel="noreferrer">
                    查看支付凭证
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="middle" style={{ marginTop: 16 }}>
              <Descriptions.Item label="提货司机">
                {selectedOrder.delivery_info?.driver_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {selectedOrder.delivery_info?.driver_phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="车牌号">
                {selectedOrder.delivery_info?.plate_number || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="提货码">
                {selectedOrder.delivery_info?.pickup_code || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="仓库名称">
                {selectedOrder.delivery_info?.warehouse_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预计时间">
                {selectedOrder.delivery_info?.estimated_time || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="提货地址" span={2}>
                {selectedOrder.delivery_info?.address || '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.logistics_bidding && (
              <Card title="物流竞价信息" size="small" style={{ marginTop: 16 }}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="竞价ID">
                    {selectedOrder.logistics_bidding.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="竞价状态">
                    <Tag
                      color={
                        selectedOrder.logistics_bidding.status === 'open' ? 'processing' : 'success'
                      }
                    >
                      {selectedOrder.logistics_bidding.status === 'open'
                        ? '竞价中'
                        : selectedOrder.logistics_bidding.status === 'selected'
                          ? '已结束'
                          : selectedOrder.logistics_bidding.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="运费承担方">
                    {selectedOrder.logistics_bidding.freight_payer === 'buyer' ? '买家' : '卖家'}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {formatDate(selectedOrder.logistics_bidding.created_at)}
                  </Descriptions.Item>
                </Descriptions>
                {selectedOrder.logistics_quotes && selectedOrder.logistics_quotes.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <Text strong>物流报价列表：</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedOrder.logistics_quotes.map((quote) => (
                        <Card key={quote.id} size="small" style={{ marginBottom: 8 }}>
                          <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="物流企业">
                              {quote.logistics_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="报价金额">
                              {formatCurrency(quote.amount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="车辆信息">
                              {quote.vehicle_info || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="司机信息">
                              {quote.driver_info || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="预计提货时间">
                              {formatDate(quote.estimated_pickup_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="预计送达时间">
                              {formatDate(quote.estimated_delivery_at)}
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert type="info" message="暂无物流报价" style={{ marginTop: 12 }} />
                )}
              </Card>
            )}

            {selectedOrder.shipment_task && (
              <Card title="物流运输进度" size="small" style={{ marginTop: 16 }}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="运输状态">
                    <Tag
                      color={
                        selectedOrder.shipment_task.status === 'pending_pickup'
                          ? 'default'
                          : selectedOrder.shipment_task.status === 'picked_up'
                            ? 'processing'
                            : selectedOrder.shipment_task.status === 'delivered'
                              ? 'cyan'
                              : 'success'
                      }
                    >
                      {shipmentStatusMap[selectedOrder.shipment_task.status] ||
                        selectedOrder.shipment_task.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="提货时间">
                    {selectedOrder.shipment_task.picked_up_at
                      ? formatDate(selectedOrder.shipment_task.picked_up_at)
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="送达时间">
                    {selectedOrder.shipment_task.delivered_at
                      ? formatDate(selectedOrder.shipment_task.delivered_at)
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="签收时间">
                    {selectedOrder.shipment_task.signed_at
                      ? formatDate(selectedOrder.shipment_task.signed_at)
                      : '-'}
                  </Descriptions.Item>
                </Descriptions>
                <Steps
                  style={{ marginTop: 12 }}
                  current={
                    selectedOrder.shipment_task.status === 'signed'
                      ? 3
                      : selectedOrder.shipment_task.status === 'delivered'
                        ? 2
                        : selectedOrder.shipment_task.status === 'picked_up'
                          ? 1
                          : 0
                  }
                  items={[
                    { title: '待提货', description: '等待物流方提货' },
                    {
                      title: '已提货',
                      description: selectedOrder.shipment_task.picked_up_at
                        ? formatDate(selectedOrder.shipment_task.picked_up_at)
                        : '运输中',
                    },
                    {
                      title: '已送达',
                      description: selectedOrder.shipment_task.delivered_at
                        ? formatDate(selectedOrder.shipment_task.delivered_at)
                        : '待送达',
                    },
                    {
                      title: '已签收',
                      description: selectedOrder.shipment_task.signed_at
                        ? formatDate(selectedOrder.shipment_task.signed_at)
                        : '待签收',
                    },
                  ]}
                />
              </Card>
            )}

            {(fulfillmentLoading || selectedFulfillmentLogistics) && (
              <Card title="独立物流履约" size="small" style={{ marginTop: 16 }}>
                <Spin spinning={fulfillmentLoading}>
                  {selectedFulfillmentLogistics ? (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="物流委托单">
                          {selectedFulfillmentLogistics.logistics_no}
                        </Descriptions.Item>
                        <Descriptions.Item label="当前节点">
                          {logisticsFulfillmentStatusMap[selectedFulfillmentLogistics.status] ||
                            selectedFulfillmentLogistics.status}
                        </Descriptions.Item>
                        <Descriptions.Item label="当前责任主体">
                          {logisticsResponsibilityText[
                            selectedFulfillmentLogistics.current_responsible_party || 'unknown'
                          ] ||
                            selectedFulfillmentLogistics.current_responsible_party ||
                            '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="交接说明">
                          {selectedFulfillmentLogistics.handover_note || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="仓储动作">
                          {selectedFulfillmentMovement?.status || '暂无'}
                        </Descriptions.Item>
                        <Descriptions.Item label="司机/车牌">
                          {selectedFulfillmentLogistics.driver_name || '-'} /{' '}
                          {selectedFulfillmentLogistics.plate_number || '-'}
                        </Descriptions.Item>
                      </Descriptions>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {fulfillmentStepDefinitions.map((step, index) => {
                          const currentStep = getFulfillmentCurrentStep(
                            selectedFulfillmentLogistics.status
                          )
                          const stepState =
                            index < currentStep
                              ? 'completed'
                              : index === currentStep
                                ? 'current'
                                : 'pending'
                          const tagColor =
                            stepState === 'completed'
                              ? 'success'
                              : stepState === 'current'
                                ? 'processing'
                                : 'default'
                          return (
                            <div
                              key={step.key}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                            >
                              <div className="mb-2 flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs text-slate-500">节点 {index + 1}</div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {step.title}
                                  </div>
                                </div>
                                <Tag color={tagColor}>
                                  {stepState === 'completed'
                                    ? '已完成'
                                    : stepState === 'current'
                                      ? '进行中'
                                      : '待处理'}
                                </Tag>
                              </div>
                              <div className="space-y-1 text-xs text-slate-600">
                                <div>
                                  <span className="font-medium text-slate-700">责任方：</span>
                                  {step.owner}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">凭证：</span>
                                  {step.proofHint}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">时间：</span>
                                  {getFulfillmentStepDescription(
                                    step.key,
                                    selectedFulfillmentLogistics
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {selectedFulfillmentLogistics.tracking_events &&
                      selectedFulfillmentLogistics.tracking_events.length > 0 ? (
                        <Timeline
                          items={selectedFulfillmentLogistics.tracking_events.map((item) => ({
                            color: 'blue',
                            children: (
                              <div>
                                <div style={{ fontWeight: 500 }}>
                                  {item.description || item.event_type}
                                </div>
                                <Text type="secondary">
                                  {formatDate(item.occurred_at)}{' '}
                                  {item.location ? `· ${item.location}` : ''}
                                </Text>
                              </div>
                            ),
                          }))}
                        />
                      ) : null}
                    </Space>
                  ) : (
                    <Alert
                      type="info"
                      message="当前订单暂无独立物流履约单，仍按订单运输状态展示。"
                    />
                  )}
                </Spin>
              </Card>
            )}

            <Card title="订单时间线" size="small" style={{ marginTop: 16 }}>
              <Timeline
                items={(selectedOrder.timeline || []).map((item) => ({
                  color: timelineColor(item.status),
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.label}</div>
                      {item.time ? <Text type="secondary">{formatDate(item.time)}</Text> : null}
                      {item.description ? (
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          {item.description}
                        </Paragraph>
                      ) : null}
                    </div>
                  ),
                }))}
              />
            </Card>
          </Spin>
        ) : null}
      </Modal>

      <Modal
        title={confirmAction?.type === 'payment' ? '确认收款' : '确认出库'}
        open={confirmAction !== null}
        onCancel={() => {
          setConfirmAction(null)
          setConfirmInput('')
        }}
        onOk={() => void executeConfirmAction()}
        okText="确认执行"
        okButtonProps={{ danger: true, loading: actionLoading, disabled: !confirmInput }}
        destroyOnHidden
      >
        {confirmAction && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{confirmAction.order.order_no}</Descriptions.Item>
              <Descriptions.Item label="买家企业">
                {confirmAction.order.buyer_name}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                {formatCurrency(confirmAction.order.total_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="操作">
                <Tag color="red">{confirmAction.type === 'payment' ? '确认收款' : '确认出库'}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Alert
              type="warning"
              showIcon
              message="此操作不可撤销，请仔细核对订单信息"
              style={{ marginBottom: 16 }}
            />
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                {confirmAction.type === 'payment' ? (
                  <>
                    请输入订单号后 4 位以确认操作：
                    <strong>{confirmAction.order.order_no.slice(-4)}</strong>
                  </>
                ) : (
                  '请输入买家提供的提货码以确认出库'
                )}
              </div>
              <Input
                placeholder={confirmAction.type === 'payment' ? '输入订单号后 4 位' : '输入提货码'}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={quoteModalOrder?.status === 16 ? '查看物流报价' : '选择物流报价'}
        open={!!quoteModalOrder}
        onCancel={() => {
          setQuoteModalOrder(null)
          setLogisticsQuotes([])
          setSelectedQuoteId(null)
        }}
        onOk={
          quoteModalOrder?.status === 17
            ? () => {
                if (!quoteModalOrder || !selectedQuoteId) {
                  message.warning('请先选择一个物流报价')
                  return
                }
                setActionLoading(true)
                sellerOrderService
                  .selectLogisticsQuote(quoteModalOrder.id, { quote_id: selectedQuoteId })
                  .then((detail) => {
                    message.success('物流报价已选择，请等待买家确认')
                    setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
                    setQuoteModalOrder(null)
                    setLogisticsQuotes([])
                    setSelectedQuoteId(null)
                  })
                  .catch((error: unknown) => {
                    message.error(getErrorMessage(error, '选择报价失败'))
                  })
                  .finally(() => {
                    setActionLoading(false)
                  })
              }
            : undefined
        }
        okText={quoteModalOrder?.status === 17 ? '确认选择' : undefined}
        okButtonProps={
          quoteModalOrder?.status === 17
            ? { loading: actionLoading, disabled: !selectedQuoteId }
            : { style: { display: 'none' } }
        }
        cancelText={quoteModalOrder?.status === 17 ? '取消' : '关闭'}
        width={720}
        destroyOnHidden
      >
        {quoteModalOrder && (
          <div>
            <Alert
              type="info"
              showIcon
              message={
                quoteModalOrder.status === 16
                  ? '物流报价进行中，以下是已有的报价。你可以结束报价后选择物流。'
                  : '请从以下物流报价中选择一个，选择后将等待买家确认'
              }
              style={{ marginBottom: 16 }}
            />
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{quoteModalOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="买家企业">{quoteModalOrder.buyer_name}</Descriptions.Item>
              <Descriptions.Item label="商品">
                {getPrimaryProduct(quoteModalOrder)?.product_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数量">
                {quoteModalOrder.total_quantity} 吨
              </Descriptions.Item>
            </Descriptions>
            <Spin spinning={quoteLoading}>
              {logisticsQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                  <div className="text-gray-500">暂无物流报价</div>
                </div>
              ) : (
                <Radio.Group
                  value={selectedQuoteId}
                  onChange={(e) =>
                    quoteModalOrder.status === 16 && setSelectedQuoteId(e.target.value)
                  }
                >
                  <Space direction="vertical" className="w-full">
                    {logisticsQuotes.map((quote) => (
                      <Radio
                        key={quote.id}
                        value={quote.id}
                        className="w-full"
                        disabled={quoteModalOrder.status === 16}
                      >
                        <Card className="w-full" hoverable={quoteModalOrder.status === 17}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {quote.logistics_name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span>车辆信息：{quote.vehicle_info || '未填写'}</span>
                                <span className="mx-2">|</span>
                                <span>司机信息：{quote.driver_info || '未填写'}</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span>预计提货：{quote.estimated_pickup_at || '未填写'}</span>
                                <span className="mx-2">|</span>
                                <span>预计送达：{quote.estimated_delivery_at || '未填写'}</span>
                              </div>
                              {quote.remark && (
                                <div className="text-sm text-gray-500 mt-1">
                                  备注：{quote.remark}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(quote.amount)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                报价时间：{formatDate(quote.created_at)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Spin>
          </div>
        )}
      </Modal>
    </div>
  )
}
