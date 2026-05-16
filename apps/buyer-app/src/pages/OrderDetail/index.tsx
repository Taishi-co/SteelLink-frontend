import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from 'antd'
import {
  ArrowLeftOutlined,
  BankOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { getErrorMessage, hasFormErrorFields, timelineColor } from '@steellink/shared/utils'
import { orderService, type LogisticsQuoteInfo } from '@/services/orderService'
import { productService } from '@/services/productService'
import { uploadService } from '@/services/uploadService'
import {
  serviceFulfillmentService,
  type LogisticsOrderInfo,
} from '@/services/serviceFulfillmentService'
import {
  serviceOfferService,
  type FinanceServiceItem,
  type WarehouseServiceItem,
} from '@/services/serviceOfferService'

const { Title, Paragraph, Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'orange' },
  2: { label: '待签合同', color: 'gold' },
  3: { label: '待支付', color: 'orange' },
  4: { label: '已支付', color: 'blue' },
  5: { label: '待提货', color: 'cyan' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'green' },
  8: { label: '已完成', color: 'green' },
  9: { label: '已取消', color: 'red' },
  10: { label: '已冻结', color: 'volcano' },
  11: { label: '异常', color: 'magenta' },
  12: { label: '待选择目的地仓储', color: 'geekblue' },
  13: { label: '待仓库确认', color: 'purple' },
  14: { label: '待卖方确认', color: 'orange' },
  15: { label: '待买方确认', color: 'blue' },
  16: { label: '物流竞价中', color: 'cyan' },
  17: { label: '待确认物流', color: 'gold' },
  18: { label: '运输中', color: 'processing' },
  19: { label: '已收货', color: 'green' },
  20: { label: '已对账', color: 'success' },
  21: { label: '已归档', color: 'default' },
  22: { label: '融资审批中', color: 'purple' },
  23: { label: '待签署融资合同', color: 'gold' },
  24: { label: '待重新选仓', color: 'volcano' },
  25: { label: '待重新发起物流', color: 'volcano' },
  26: { label: '待选择仓库', color: 'geekblue' },
}

const shipmentStatusText: Record<string, string> = {
  pending_pickup: '待提货',
  picked_up: '已提货',
  delivered: '已送达',
  signed: '已签收',
}

const orderSteps = [
  { title: '订单创建' },
  { title: '选择目的地仓储' },
  { title: '仓库确认' },
  { title: '卖方确认' },
  { title: '买方确认' },
  { title: '签署合同' },
  { title: '支付/融资' },
  { title: '物流竞价' },
  { title: '运输交付' },
  { title: '签收对账' },
  { title: '归档' },
]

const logisticsStatusText: Record<string, string> = {
  task_created: '已创建运输任务',
  pickup_scheduled: '已提货预约',
  arrival_signed_in: '已到场签到',
  outbound_confirmed: '已出库确认',
  loading_confirmed: '已装货确认',
  in_transit: '运输中',
  arrival_confirmed: '已到货确认',
  receipt_signed: '已验收签收',
  inbound_completed: '已入库完成',
  pending: '待接单',
  accepted: '已接单',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
}

const responsiblePartyText: Record<string, string> = {
  buyer: '买方负责',
  seller: '卖方协同',
  warehouse: '仓储方负责',
  logistics: '物流方负责',
  unknown: '待确认',
}

const movementStatusText: Record<string, string> = {
  pending: '待作业',
  processing: '作业中',
  completed: '已完成',
}

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

function getCurrentStep(status: number) {
  if (status === 0 || status === 1) return 0
  if (status === 12) return 1
  if (status === 13 || status === 24 || status === 25) return 2
  if (status === 14) return 3
  if (status === 15) return 4
  if (status === 2) return 5
  if (status === 3 || status === 22 || status === 23) return 6
  if (status === 4) return 6
  if (status === 16 || status === 17 || status === 27) return 7
  if (status === 5 || status === 6 || status === 18 || status === 7) return 8
  if (status === 19 || status === 20) return 9
  if (status === 8 || status === 21) return 10
  return 0
}

const fulfillmentStepOrder = [
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
  const index = fulfillmentStepOrder.indexOf(normalized as (typeof fulfillmentStepOrder)[number])
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
      return logistics.created_at ? new Date(logistics.created_at).toLocaleString() : '已创建'
    case 'pickup_scheduled':
      return logistics.pickup_appointment_at
        ? new Date(logistics.pickup_appointment_at).toLocaleString()
        : '待仓储确认'
    case 'arrival_signed_in':
      return logistics.arrival_signed_in_at
        ? new Date(logistics.arrival_signed_in_at).toLocaleString()
        : '待到场'
    case 'outbound_confirmed':
      return logistics.outbound_confirmed_at
        ? new Date(logistics.outbound_confirmed_at).toLocaleString()
        : '待仓储出库'
    case 'loading_confirmed':
      return logistics.loading_confirmed_at
        ? new Date(logistics.loading_confirmed_at).toLocaleString()
        : '待物流接责'
    case 'in_transit':
      return normalizeFulfillmentStatus(logistics.status) === 'in_transit'
        ? logistics.tracking_events?.[0]?.description || '在途履约中'
        : '待发运'
    case 'arrival_confirmed':
      return logistics.arrival_confirmed_at
        ? new Date(logistics.arrival_confirmed_at).toLocaleString()
        : '待到货'
    case 'receipt_signed':
      return logistics.receipt_signed_at
        ? new Date(logistics.receipt_signed_at).toLocaleString()
        : '待买方签收'
    case 'inbound_completed':
      return logistics.inbound_completed_at
        ? new Date(logistics.inbound_completed_at).toLocaleString()
        : '按需入库'
    case 'completed':
      return normalizeFulfillmentStatus(logistics.status) === 'completed' ? '已完成' : '未完成'
    default:
      return '-'
  }
}

function getStatusNotice(
  status: number,
  _hasPaymentVoucher: boolean,
  _hasDeliveryInfo: boolean,
  contractInfo?: { buyer_signed: boolean; seller_signed: boolean }
) {
  if (status === 1) {
    return {
      type: 'warning' as const,
      title: '当前状态：订单已提交',
      message: '下一步：等待卖家确认。',
    }
  }
  if (status === 12) {
    return {
      type: 'info' as const,
      title: '当前状态：待选择目的地仓储',
      message: '请选择物流送达的目的地仓库，选择后进入仓库确认环节。',
    }
  }
  if (status === 13) {
    return {
      type: 'warning' as const,
      title: '当前状态：待仓库确认',
      message: '下一步：等待仓储方确认仓库条件。',
    }
  }
  if (status === 25) {
    return {
      type: 'warning' as const,
      title: '当前状态：待选择仓库',
      message: '下一步：请选择收货仓库，由仓储方确认后继续订单流程。',
    }
  }
  if (status === 24) {
    return {
      type: 'warning' as const,
      title: '当前状态：待重新选仓',
      message: '下一步：请重新选择仓储方，平台管理端已收到异常反馈。',
    }
  }
  if (status === 14) {
    return {
      type: 'warning' as const,
      title: '当前状态：仓储确认已完成',
      message: '下一步：等待卖方确认条款。',
    }
  }
  if (status === 15) {
    return {
      type: 'warning' as const,
      title: '当前状态：卖方确认已完成',
      message: '下一步：请确认订单最终版本。',
    }
  }
  if (status === 2) {
    if (contractInfo?.buyer_signed && contractInfo?.seller_signed) {
      return {
        type: 'success' as const,
        title: '当前状态：双方签署已完成',
        message: '签署状态：买家已签，卖家已签。下一步：进入支付或融资阶段。',
      }
    }
    if (contractInfo?.buyer_signed) {
      return {
        type: 'info' as const,
        title: '当前状态：买方签署已完成',
        message: '签署状态：买家已签，卖家未签。下一步：等待卖家签署后进入支付阶段。',
      }
    }
    if (contractInfo?.seller_signed) {
      return {
        type: 'warning' as const,
        title: '当前状态：卖方签署已完成',
        message: '签署状态：卖家已签，买家未签。下一步：请签署交易合同；双方签署后进入支付阶段。',
      }
    }
    return {
      type: 'warning' as const,
      title: '当前状态：待签合同',
      message: '签署状态：买家未签，卖家未签。下一步：请签署交易合同；双方签署后进入支付阶段。',
    }
  }
  if (status === 3) {
    return {
      type: 'warning' as const,
      title: '当前状态：待支付/融资',
      message: '下一步：请上传支付凭证，或申请托盘融资。',
    }
  }
  if (status === 21) {
    return {
      type: 'info' as const,
      title: '当前状态：融资申请已完成',
      message: '下一步：等待资金方进行风控审批。',
    }
  }
  if (status === 22) {
    return {
      type: 'info' as const,
      title: '当前状态：资金方风控审批中',
      message: '请耐心等待资金方完成风控审批，审批通过后可签署融资合同。',
    }
  }
  if (status === 23) {
    return {
      type: 'warning' as const,
      title: '当前状态：风控审批已通过',
      message: '下一步：请签署融资合同并支付手续费。',
    }
  }
  if (status === 4) {
    return {
      type: 'success' as const,
      title: '当前状态：支付/监管已完成',
      message: '下一步：等待卖方发起物流竞价。',
    }
  }
  if (status === 16) {
    return {
      type: 'info' as const,
      title: '当前状态：物流竞价已发起',
      message: '下一步：等待物流方报价。',
    }
  }
  if (status === 17) {
    return {
      type: 'warning' as const,
      title: '当前状态：物流报价已完成',
      message: '下一步：请按合同约定确认物流资源。',
    }
  }
  if (status === 24) {
    return {
      type: 'warning' as const,
      title: '当前状态：待重新发起物流',
      message: '下一步：等待卖方重新发起物流，平台管理端已收到异常反馈。',
    }
  }
  if (status === 5) {
    return {
      type: 'info' as const,
      title: '当前状态：物流确认已完成',
      message: '下一步：等待物流方运输履约。',
    }
  }
  if (status === 17) {
    return {
      type: 'info' as const,
      title: '当前状态：发货任务执行中',
      message: '下一步：等待发货任务完成，收到货物后确认签收。',
    }
  }
  if (status === 6 || status === 7) {
    return {
      type: 'info' as const,
      title: '当前状态：运输履约中',
      message: '下一步：收到货物后确认签收。',
    }
  }
  if (status === 18) {
    return {
      type: 'success' as const,
      title: '当前状态：收货确认已完成',
      message: '下一步：等待卖方对账确认。',
    }
  }
  if (status === 19) {
    return {
      type: 'success' as const,
      title: '当前状态：已收货',
      message: '下一步：等待卖方对账确认。',
    }
  }
  if (status === 20) {
    return {
      type: 'success' as const,
      title: '当前状态：已对账',
      message: '下一步：等待归档。',
    }
  }
  if (status === 8 || status === 21) {
    return {
      type: 'success' as const,
      title: '当前状态：交易闭环已完成',
      message: '订单已完成归档，可回工作台查看订单记录。',
    }
  }
  if (status === 9) {
    return {
      type: 'error' as const,
      title: '当前状态：订单已取消',
      message: '订单已取消，可回工作台查看记录。',
    }
  }
  if (status === 11) {
    return {
      type: 'error' as const,
      title: '当前状态：订单异常',
      message: '下一步：等待平台运营介入。',
    }
  }
  return {
    type: 'info' as const,
    title: '当前状态：订单状态已更新',
    message: '请回工作台查看订单进度。',
  }
}

function isValidHttpUrl(value?: string) {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function formatTimelineTime(value?: string) {
  return value ? new Date(value).toLocaleString() : ''
}

function formatMoney(value?: number) {
  if (!value) return '待评估'
  return `¥${Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function formatRate(value?: number) {
  if (!value) return '按授信评估'
  return `年化 ${Number(value).toFixed(1)}%`
}

interface AIFinanceRecommendation {
  finance_service_id?: number
  product_name?: string
  finance_type?: string
  amount?: number
  annual_rate?: number
  term_days?: number
  ai_recommended?: boolean
}

function getAIFinanceRecommendation(
  remark?: Record<string, unknown>
): AIFinanceRecommendation | undefined {
  const value = remark?.ai_finance_recommendation
  if (!value || typeof value !== 'object') return undefined
  return value as AIFinanceRecommendation
}

function getUploadFile(fileList?: UploadFile[]) {
  const file = fileList?.[0]?.originFileObj
  if (!file) {
    throw new Error('请先选择凭证文件')
  }
  return file
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [inspectionSignOpen, setInspectionSignOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [confirmingReceipt, setConfirmingReceipt] = useState(false)
  const [confirmingInspectionSign, setConfirmingInspectionSign] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [signing, setSigning] = useState(false)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [savingWarehouse, setSavingWarehouse] = useState(false)
  const [destWarehouseOpen, setDestWarehouseOpen] = useState(false)
  const [savingDestWarehouse, setSavingDestWarehouse] = useState(false)
  const [destWarehouseForm] = Form.useForm()
  const [logisticsQuotes, setLogisticsQuotes] = useState<LogisticsQuoteInfo[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [logisticsModalOpen, setLogisticsModalOpen] = useState(false)
  const [logisticsLoading, setLogisticsLoading] = useState(false)
  const [confirmingLogistics, setConfirmingLogistics] = useState(false)
  const [financeOpen, setFinanceOpen] = useState(false)
  const [creatingFinance, setCreatingFinance] = useState(false)
  const [selectedFinanceServiceId, setSelectedFinanceServiceId] = useState<number | undefined>()
  const [confirmingFinancing, setConfirmingFinancing] = useState(false)
  const [signingDebt, setSigningDebt] = useState(false)
  const [feeVoucherFileList, setFeeVoucherFileList] = useState<UploadFile[]>([])
  const [debtSigningOpen, setDebtSigningOpen] = useState(false)
  const [form] = Form.useForm()
  const [deliveryForm] = Form.useForm()
  const [receiptForm] = Form.useForm()
  const [inspectionSignForm] = Form.useForm()
  const [warehouseForm] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderService.getById(Number(id)),
    enabled: Boolean(id),
  })

  const order = data
  const item = order?.items?.[0]
  const { data: productDetail } = useQuery({
    queryKey: ['order-product-detail', item?.product_id],
    queryFn: async () => (await productService.getProduct(Number(item?.product_id))).data,
    enabled: Boolean(item?.product_id),
  })
  const { data: fulfillmentData } = useQuery({
    queryKey: ['order-service-fulfillment', id],
    queryFn: async () => (await serviceFulfillmentService.getOrderFulfillment(Number(id))).data,
    enabled: Boolean(id),
  })
  const fulfillment = fulfillmentData
  const aiFinanceRecommendation = getAIFinanceRecommendation(order?.remark)
  const { data: financeProductsData, isLoading: financeProductsLoading } = useQuery({
    queryKey: ['available-finance-services', order?.id],
    queryFn: async () =>
      (await serviceOfferService.listFinanceAvailableForOrder(Number(order?.id))).data.list,
    enabled: Boolean(order?.id && financeOpen),
  })
  const { data: publicWarehousesData } = useQuery({
    queryKey: ['public-warehouse-services-for-dest'],
    queryFn: () => serviceOfferService.listWarehouses({ page: 1, page_size: 200, status: 2 }),
  })
  const publicWarehouses = publicWarehousesData?.data.list ?? []
  const financeProducts = (financeProductsData || []).slice().sort((left, right) => {
    if (left.id === aiFinanceRecommendation?.finance_service_id) return -1
    if (right.id === aiFinanceRecommendation?.finance_service_id) return 1
    return Number(left.annual_rate || 0) - Number(right.annual_rate || 0)
  })
  const logisticsOrder = fulfillment?.logistics_orders?.[0]
  const isFinancingOrder = Boolean(order?.financing_info || order?.logistics_contract?.is_financing_order)
  const latestMovement = fulfillment?.warehouse_movements?.[0]
  const activeGuarantee = fulfillment?.guarantees?.[0]
  const status = statusMap[order?.status || 0] || {
    label: `状态${order?.status ?? '-'}`,
    color: 'default',
  }
  const statusNotice = getStatusNotice(
    order?.status || 0,
    Boolean(order?.payment_info?.voucher_url),
    Boolean(order?.delivery_info?.pickup_code),
    order?.contract_info
  )
  const pickupWarehouseName =
    order?.delivery_info?.warehouse_name || productDetail?.warehouseInfo?.warehouse_name || ''
  const pickupWarehouseId =
    order?.delivery_info?.warehouse_id || productDetail?.warehouseInfo?.warehouse_id || 0
  const pickupWarehouseServiceId =
    order?.delivery_info?.warehouse_service_id || productDetail?.warehouseServiceId || 0
  const pickupWarehouseAddress =
    order?.delivery_info?.warehouse_address || productDetail?.warehouseInfo?.address || ''
  const pickupWarehouseCode =
    order?.delivery_info?.warehouse_code || productDetail?.warehouseInfo?.warehouse_code || ''
  const pickupWarehouseRegion = [
    order?.delivery_info?.warehouse_province || productDetail?.warehouseInfo?.province,
    order?.delivery_info?.warehouse_city || productDetail?.warehouseInfo?.city,
    order?.delivery_info?.warehouse_district || productDetail?.warehouseInfo?.district,
  ]
    .filter(Boolean)
    .join(' ')
  const canCancelOrder =
    (order?.status === 1 ||
      order?.status === 2 ||
      order?.status === 3 ||
      order?.status === 12 ||
      order?.status === 24 ||
      order?.status === 25) &&
    !order?.payment_info?.voucher_url

  const openFinanceModal = () => {
    setSelectedFinanceServiceId(aiFinanceRecommendation?.finance_service_id)
    setFinanceOpen(true)
  }

  const showCompleted = (title: string, next: string) => {
    Modal.success({
      title,
      content: (
        <Space direction="vertical" size={8}>
          <Text>已完成：{title.replace('已完成', '')}</Text>
          <Text type="secondary">下一步：{next}</Text>
          <Text type="secondary">管理端可在订单详情中查看本次节点事件记录。</Text>
        </Space>
      ),
      okText: '回工作台看订单',
      onOk: () => navigate('/orders'),
    })
  }

  const handleUploadVoucher = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)
      const uploaded = await uploadService.upload(
        getUploadFile(values.voucher_file),
        'payment_voucher'
      )
      await orderService.directPayment(Number(id), {
        voucher_url: uploaded.url,
        transaction_no: values.transaction_no,
        payer_account: values.payer_account,
        payee_account: values.payee_account,
      })
      showCompleted('支付凭证已完成', '等待卖方发起物流竞价。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      form.resetFields()
      setOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '上传失败'))
    } finally {
      setUploading(false)
    }
  }

  const handleReselectWarehouse = async () => {
    try {
      const values = await warehouseForm.validateFields()
      setSavingWarehouse(true)
      await orderService.reselectWarehouse(Number(id), {
        warehouse_service_id: Number(values.warehouse_service_id),
        confirm_note: values.confirm_note,
      })
      showCompleted('重新选仓已完成', '等待新仓储方确认仓库条件。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      warehouseForm.resetFields()
      setWarehouseOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '重新选仓失败'))
    } finally {
      setSavingWarehouse(false)
    }
  }

  const handleSelectDestWarehouse = async () => {
    try {
      const values = await destWarehouseForm.validateFields()
      setSavingDestWarehouse(true)
      await orderService.selectDestWarehouse(Number(id), {
        dest_warehouse_service_id: Number(values.dest_warehouse_service_id),
        dest_confirm_note: values.dest_confirm_note,
      })
      showCompleted('目的地仓库已选择', '请等待仓储方确认。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      destWarehouseForm.resetFields()
      setDestWarehouseOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '选择目的地仓库失败'))
    } finally {
      setSavingDestWarehouse(false)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      const values = await deliveryForm.validateFields()
      setSavingDelivery(true)
      await orderService.setDeliveryInfo(Number(id), {
        ...values,
        warehouse_id: pickupWarehouseId,
        warehouse_service_id: pickupWarehouseServiceId,
        warehouse_name: pickupWarehouseName,
      })
      showCompleted('提货信息已完成', '卖方可使用提货码核销出库。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      deliveryForm.resetFields()
      setDeliveryOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '保存失败'))
    } finally {
      setSavingDelivery(false)
    }
  }

  const handleConfirmReceipt = async () => {
    try {
      const values = await receiptForm.validateFields()
      setConfirmingReceipt(true)
      const uploaded = await uploadService.upload(
        getUploadFile(values.receipt_file),
        'receipt_voucher'
      )
      await orderService.confirmReceipt(Number(id), {
        receipt_voucher: uploaded.url,
      })
      showCompleted('收货确认已完成', '等待卖方对账确认。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      receiptForm.resetFields()
      setReceiptOpen(false)
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '确认收货失败'))
    } finally {
      setConfirmingReceipt(false)
    }
  }

  const handleInspectionSign = async () => {
    if (!logisticsOrder) {
      message.error('物流订单不存在')
      return
    }
    try {
      const values = await inspectionSignForm.validateFields()
      setConfirmingInspectionSign(true)
      const uploaded = await uploadService.upload(
        getUploadFile(values.receipt_file),
        'receipt_voucher'
      )
      await serviceFulfillmentService.uploadFulfillmentDocument(logisticsOrder.id, {
        doc_type: 'receipt_order',
        file_url: uploaded.url,
        remark: values.remark || '买方验货签收单',
      })
      await serviceFulfillmentService.updateLogisticsOrderStatus(
        logisticsOrder.id,
        'receipt_signed',
        values.remark
      )
      message.success('验货签收已完成')
      setInspectionSignOpen(false)
      inspectionSignForm.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      await queryClient.invalidateQueries({ queryKey: ['order-service-fulfillment', id] })
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '验货签收失败'))
    } finally {
      setConfirmingInspectionSign(false)
    }
  }

  const handleSignContract = async () => {
    try {
      setSigning(true)
      await orderService.signContract(Number(id))
      showCompleted('合同签署已完成', '等待对方签署；双方签署后进入支付节点。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '签署失败'))
    } finally {
      setSigning(false)
    }
  }

  const handleCreateFinancingRequest = async () => {
    if (!selectedFinanceServiceId) {
      message.warning('请选择金融服务产品')
      return
    }
    try {
      setCreatingFinance(true)
      await orderService.createFinancingRequest(Number(id), {
        finance_service_id: selectedFinanceServiceId,
        requested_amount: order?.tax_total_amount || order?.total_amount,
      })
      showCompleted('融资申请已提交', '等待资金方完成风控审批。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      setFinanceOpen(false)
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '融资申请失败'))
    } finally {
      setCreatingFinance(false)
    }
  }

  const handleBuyerConfirmFinancing = async (confirmed: boolean) => {
    try {
      setConfirmingFinancing(true)
      await orderService.buyerConfirmFinancing(Number(id), {
        confirmed,
        remark: confirmed ? '买方确认融资方案' : '买方放弃融资，选择直接支付',
      })
      showCompleted(
        confirmed ? '融资方案确认已完成' : '已放弃融资',
        confirmed ? '等待资金方生成债务质押合同。' : '订单已恢复为待支付，可直接上传支付凭证。',
      )
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
    } catch (error: unknown) {
      message.error(getErrorMessage(error, confirmed ? '确认融资方案失败' : '放弃融资失败'))
    } finally {
      setConfirmingFinancing(false)
    }
  }

  const handleSignDebtAndPayFee = async () => {
    try {
      const feeFile = feeVoucherFileList[0]
      if (!feeFile?.originFileObj) {
        message.warning('请上传手续费支付凭证')
        return
      }
      setSigningDebt(true)
      const uploaded = await uploadService.upload(feeFile.originFileObj, 'fee_voucher')
      await orderService.buyerSignDebtAndPayFee(Number(id), {
        fee_voucher_url: uploaded.url,
      })
      showCompleted('融资合同签署已完成', '等待资金方放款。')
      await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      setDebtSigningOpen(false)
      setFeeVoucherFileList([])
    } catch (error: unknown) {
      if (hasFormErrorFields(error)) return
      message.error(getErrorMessage(error, '签署融资合同失败'))
    } finally {
      setSigningDebt(false)
    }
  }

  const handleCancelOrder = () => {
    Modal.confirm({
      title: '确认取消订单？',
      content: '取消后将释放锁定库存，订单会进入已取消状态。已上传支付凭证的订单不能直接取消。',
      okText: '确认取消',
      cancelText: '暂不取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setCancelling(true)
          await orderService.cancel(Number(id))
          showCompleted('订单取消已完成', '订单已回到工作台记录，库存已释放。')
          await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
          await queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
        } catch (error: unknown) {
          message.error(getErrorMessage(error, '取消失败'))
        } finally {
          setCancelling(false)
        }
      },
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spin size="large" />
          </div>
        ) : !order || !item ? (
          <Card className="mt-6">
            <Empty description="订单不存在或无权查看" />
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <div className="flex justify-between items-start">
                <div>
                  <Title level={3} className="!mb-2">
                    订单号：{order.order_no}
                  </Title>
                  <Text type="secondary">
                    创建时间：{new Date(order.created_at).toLocaleString()}
                  </Text>
                </div>
                <Tag color={status.color} className="px-4 py-1 text-base">
                  {status.label}
                </Tag>
              </div>
            </Card>

            <Card className="mt-6">
              <Steps current={getCurrentStep(order.status)} items={orderSteps} />
            </Card>

            <Card title="订单时间线" className="mt-6">
              <Timeline
                items={(order.timeline || []).map((item) => ({
                  color: timelineColor(item.status),
                  children: (
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.time && <Text type="secondary">{formatTimelineTime(item.time)}</Text>}
                      {item.description && (
                        <Paragraph className="!mb-0" type="secondary">
                          {item.description}
                        </Paragraph>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>

            <Alert
              type={statusNotice.type}
              showIcon
              className="mt-6"
              message={statusNotice.title}
              description={statusNotice.message}
            />

            <Card title="订单商品" className="mt-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="商品名称">{item.product_name}</Descriptions.Item>
                <Descriptions.Item label="商品编号">{item.product_no}</Descriptions.Item>
                <Descriptions.Item label="钢厂">{item.steel_mill}</Descriptions.Item>
                <Descriptions.Item label="分类">{item.category}</Descriptions.Item>
                <Descriptions.Item label="捆包号">{item.bundle_no}</Descriptions.Item>
                <Descriptions.Item label="数量">{item.quantity} 吨</Descriptions.Item>
                <Descriptions.Item label="单价">
                  ¥{item.unit_price.toLocaleString()}/吨
                </Descriptions.Item>
                <Descriptions.Item label="小计">
                  ¥{item.total_amount.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {order.delivery_info && (
              <Card title="订单仓库快照" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="提货仓库">
                    {pickupWarehouseName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓库编码">
                    {pickupWarehouseCode || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓储资源">
                    {pickupWarehouseServiceId ? (
                      <Link to={`/warehouses/${pickupWarehouseServiceId}`}>
                        #{pickupWarehouseServiceId}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓储方企业">
                    {order.delivery_info.warehouse_enterprise_id
                      ? `#${order.delivery_info.warehouse_enterprise_id}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓库地区">
                    {pickupWarehouseRegion || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓库地址">
                    {pickupWarehouseAddress || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card title="交易双方" className="mt-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="买家企业">{order.buyer_name}</Descriptions.Item>
                <Descriptions.Item label="卖家企业">{order.seller_name}</Descriptions.Item>
                <Descriptions.Item label="订单总量">{order.total_quantity} 吨</Descriptions.Item>
                <Descriptions.Item label="订单总额">
                  ¥{order.tax_total_amount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="币种">{order.currency}</Descriptions.Item>
                <Descriptions.Item label="支付截止">
                  {order.expires_at ? new Date(order.expires_at).toLocaleString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {order.contract_info && (
              <Card title="合同信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="合同编号">
                    {order.contract_info.contract_no || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="签署状态">
                    {formatContractStatus(order.contract_info)}
                  </Descriptions.Item>
                  <Descriptions.Item label="买家签署">
                    {order.contract_info.buyer_signed ? '已签署' : '未签署'}
                  </Descriptions.Item>
                  <Descriptions.Item label="卖家签署">
                    {order.contract_info.seller_signed ? '已签署' : '未签署'}
                  </Descriptions.Item>
                  <Descriptions.Item label="签署时间">
                    {order.contract_info.signed_at
                      ? new Date(order.contract_info.signed_at).toLocaleString()
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="合同文件">
                    {isValidHttpUrl(order.contract_info.contract_url) ? (
                      <a href={order.contract_info.contract_url} target="_blank" rel="noreferrer">
                        查看合同
                      </a>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {order.payment_info && (
              <Card title="支付信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="支付方式">
                    {order.payment_info.payment_method}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付时间">
                    {new Date(order.payment_info.payment_time).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="交易流水号">
                    {order.payment_info.transaction_no || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="付款账户">
                    {order.payment_info.payer_account || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="收款账户">
                    {order.payment_info.payee_account || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="上传时间">
                    {order.payment_info.uploaded_at
                      ? new Date(order.payment_info.uploaded_at).toLocaleString()
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="水印时间">
                    {order.payment_info.captured_at || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="GPS">
                    {order.payment_info.gps_latitude && order.payment_info.gps_longitude
                      ? `${order.payment_info.gps_latitude}, ${order.payment_info.gps_longitude}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付凭证">
                    {isValidHttpUrl(order.payment_info.voucher_url) ? (
                      <a href={order.payment_info.voucher_url} target="_blank" rel="noreferrer">
                        查看支付凭证
                      </a>
                    ) : (
                      <Text type="secondary">凭证地址无效</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {order.status >= 5 && (
              <Card title="提货信息" className="mt-6">
                {order.delivery_info ? (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="司机姓名">
                      {order.delivery_info.driver_name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="司机电话">
                      {order.delivery_info.driver_phone || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="司机身份证">
                      {order.delivery_info.driver_id_card || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="车牌号">
                      {order.delivery_info.plate_number || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="提货仓库">
                      {order.delivery_info.warehouse_name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓库编码">
                      {pickupWarehouseCode || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓储资源">
                      {pickupWarehouseServiceId ? (
                        <Link to={`/warehouses/${pickupWarehouseServiceId}`}>
                          #{pickupWarehouseServiceId}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓储方企业">
                      {order.delivery_info.warehouse_enterprise_id
                        ? `#${order.delivery_info.warehouse_enterprise_id}`
                        : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="提货码">
                      {order.delivery_info.pickup_code ? (
                        <Text strong copyable>
                          {order.delivery_info.pickup_code}
                        </Text>
                      ) : (
                        '-'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓库地区">
                      {pickupWarehouseRegion || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="预计提货时间">
                      {order.delivery_info.estimated_time || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="仓库地址">
                      {pickupWarehouseAddress || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="送达地址" span={2}>
                      {order.delivery_info.address || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="待录入提货信息" />
                )}
              </Card>
            )}

            <Card title="物流仓储履约" className="mt-6">
              <Space direction="vertical" size="middle" className="w-full">
                <Alert
                  showIcon
                  type={pickupWarehouseName ? 'success' : 'warning'}
                  message={
                    pickupWarehouseName
                      ? '订单已关联提货仓库，物流履约可从仓库出库节点开始追踪。'
                      : '订单商品缺少仓库绑定，需先在物流平台确认提货点。'
                  }
                  description={
                    pickupWarehouseName
                      ? `${pickupWarehouseName}${pickupWarehouseCode ? `（${pickupWarehouseCode}）` : ''} -> ${order.delivery_info?.address || '买家收货地址待录入'}`
                      : '无仓库商品不会自动推荐仓库线路，买家需发起物流委托后由物流商接单。'
                  }
                />
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="仓储节点">
                    {pickupWarehouseName || '待确认提货点'}
                  </Descriptions.Item>
                  <Descriptions.Item label="物流委托">
                    {logisticsOrder?.logistics_no || order.shipment_task?.id ? `#${order.shipment_task?.id}` : '待发起物流委托'}
                  </Descriptions.Item>
                  <Descriptions.Item label="估算价格">
                    {logisticsOrder
                      ? `¥${Number(logisticsOrder.estimated_price || 0).toLocaleString()}`
                      : '待物流平台估算'}
                  </Descriptions.Item>
                  <Descriptions.Item label="保障方式">
                    {activeGuarantee?.guarantee_type ||
                      logisticsOrder?.guarantee_type ||
                      '待创建履约保障'}
                  </Descriptions.Item>
                  <Descriptions.Item label="出入库状态">
                    {latestMovement
                      ? movementStatusText[latestMovement.status] || latestMovement.status
                      : '暂无出入库记录'}
                  </Descriptions.Item>
                  <Descriptions.Item label="物流状态">
                    {logisticsOrder
                      ? logisticsStatusText[logisticsOrder.status] || logisticsOrder.status
                      : order.shipment_task
                        ? shipmentStatusText[order.shipment_task.status] ||
                          order.shipment_task.status
                        : '暂无物流订单'}
                  </Descriptions.Item>
                  <Descriptions.Item label="当前责任主体">
                    {logisticsOrder
                      ? responsiblePartyText[
                          logisticsOrder.current_responsible_party || 'unknown'
                        ] || logisticsOrder.current_responsible_party
                      : '待物流履约单创建'}
                  </Descriptions.Item>
                  <Descriptions.Item label="交接说明">
                    {logisticsOrder?.handover_note || '暂无'}
                  </Descriptions.Item>
                </Descriptions>
                {logisticsOrder ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {fulfillmentStepDefinitions.map((step, index) => {
                      const currentStep = getFulfillmentCurrentStep(logisticsOrder.status)
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
                              <div className="text-sm font-medium text-slate-900">{step.title}</div>
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
                              {getFulfillmentStepDescription(step.key, logisticsOrder)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : order.shipment_task ? (
                  <Steps
                    current={
                      order.shipment_task.status === 'signed'
                        ? 3
                        : order.shipment_task.status === 'delivered'
                          ? 2
                          : order.shipment_task.status === 'picked_up'
                            ? 1
                            : 0
                    }
                    items={[
                      {
                        title: '待提货',
                        description:
                          order.shipment_task.status === 'pending_pickup'
                            ? '等待物流方提货'
                            : '已安排提货',
                        icon: <ClockCircleOutlined />,
                      },
                      {
                        title: '已提货',
                        description: order.shipment_task.picked_up_at
                          ? new Date(order.shipment_task.picked_up_at).toLocaleString()
                          : order.delivery_info?.plate_number || '运输中',
                        icon: <CarOutlined />,
                      },
                      {
                        title: '已送达',
                        description: order.shipment_task.delivered_at
                          ? new Date(order.shipment_task.delivered_at).toLocaleString()
                          : '待送达',
                        icon: <EnvironmentOutlined />,
                      },
                      {
                        title: '已签收',
                        description: order.shipment_task.signed_at
                          ? new Date(order.shipment_task.signed_at).toLocaleString()
                          : '待签收',
                        icon: <CheckCircleOutlined />,
                      },
                    ]}
                  />
                ) : (
                  <Steps
                    current={latestMovement?.status === 'completed' ? 1 : 0}
                    items={[
                      {
                        title: '仓库锁货',
                        description: '订单创建后锁定捆包库存',
                        icon: <SafetyCertificateOutlined />,
                      },
                      {
                        title: '出库作业',
                        description: latestMovement
                          ? movementStatusText[latestMovement.status] || latestMovement.status
                          : pickupWarehouseName || '等待提货点',
                        icon: <CarOutlined />,
                      },
                      {
                        title: '物流接单',
                        description: order.delivery_info?.plate_number || '待物流商接单',
                        icon: <EnvironmentOutlined />,
                      },
                      {
                        title: '在途跟踪',
                        description: '待发车',
                        icon: <CarOutlined />,
                      },
                      {
                        title: '签收归档',
                        description: order.receipt_voucher ? '回单已上传' : '待买家确认',
                        icon: <CheckCircleOutlined />,
                      },
                    ]}
                  />
                )}
                {logisticsOrder?.tracking_events?.length ? (
                  <Timeline
                    items={logisticsOrder.tracking_events.map((event) => ({
                      color: 'blue',
                      children: (
                        <div>
                          <div className="font-medium">{event.description || event.event_type}</div>
                          <Text type="secondary">
                            {event.location || '-'} · {new Date(event.occurred_at).toLocaleString()}
                          </Text>
                        </div>
                      ),
                    }))}
                  />
                ) : null}
              </Space>
            </Card>

            {order.financing_info && (
              <Card title="融资信息" className="mt-6">
                <Space direction="vertical" size="middle" className="w-full">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="融资状态">
                      {order.financing_info.status === 'pending' && '待审批'}
                      {order.financing_info.status === 'risk_approved' && '风控通过'}
                      {order.financing_info.status === 'buyer_confirmed' && '买方已确认'}
                      {order.financing_info.status === 'contract_generated' && '合同已生成'}
                      {order.financing_info.status === 'completed' && '已完成'}
                      {order.financing_info.status === 'cancelled' && '已取消'}
                    </Descriptions.Item>
                    <Descriptions.Item label="授信金额">
                      ¥{Number(order.financing_info.approved_amount || 0).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="融资期限">
                      {order.financing_info.term_days} 天
                    </Descriptions.Item>
                    <Descriptions.Item label="年化利率">
                      {order.financing_info.annual_rate}%
                    </Descriptions.Item>
                    <Descriptions.Item label="手续费">
                      ¥{Number(order.financing_info.service_fee || 0).toLocaleString()}
                    </Descriptions.Item>
                    {order.financing_info.debt_contract_no && (
                      <Descriptions.Item label="合同编号">
                        {order.financing_info.debt_contract_no}
                      </Descriptions.Item>
                    )}
                    {order.financing_info.debt_contract_url && (
                      <Descriptions.Item label="合同文件">
                        <a href={order.financing_info.debt_contract_url} target="_blank" rel="noreferrer">
                          查看合同
                        </a>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      { key: 'applied', title: '申请提交', owner: '买方负责', hint: '提交融资申请，填写申请信息' },
                      { key: 'risk_review', title: '风控审批', owner: '资金方负责', hint: '资金方进行风控审核，给出授信额度' },
                      { key: 'buyer_confirm', title: '确认方案', owner: '买方负责', hint: '确认融资方案，同意授信条件' },
                      { key: 'sign_contract', title: '签署合同', owner: '双方签署', hint: '签署债务质押合同，支付手续费' },
                      { key: 'funded', title: '放款完成', owner: '资金方负责', hint: '资金方放款，订单进入支付完成状态' },
                    ].map((step, index) => {
                      const statusOrder = ['pending', 'risk_approved', 'buyer_confirmed', 'contract_generated', 'completed']
                      const currentStep = statusOrder.indexOf(order.financing_info!.status)
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
                              <div className="text-sm font-medium text-slate-900">{step.title}</div>
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
                              <span className="font-medium text-slate-700">说明：</span>
                              {step.hint}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Space>
              </Card>
            )}

            {(order.receipt_voucher || order.receipt_at || order.status === 8) && (
              <Card title="签收信息" className="mt-6">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="签收时间">
                    {order.receipt_at ? new Date(order.receipt_at).toLocaleString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="上传时间">
                    {order.receipt_info?.uploaded_at
                      ? new Date(order.receipt_info.uploaded_at).toLocaleString()
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="水印时间">
                    {order.receipt_info?.captured_at || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="GPS">
                    {order.receipt_info?.gps_latitude && order.receipt_info?.gps_longitude
                      ? `${order.receipt_info.gps_latitude}, ${order.receipt_info.gps_longitude}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="签收凭证">
                    {isValidHttpUrl(order.receipt_voucher) ? (
                      <a href={order.receipt_voucher} target="_blank" rel="noreferrer">
                        查看签收凭证
                      </a>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card className="mt-6">
              <Title level={5}>订单操作</Title>
              <Space wrap>
                {(order.status === 14 || order.status === 15) && (
                  <Button
                    type="primary"
                    onClick={async () => {
                      try {
                        await orderService.buyerConfirm(Number(id), {
                          confirm_note: '买方确认订单',
                        })
                        showCompleted('买方确认已完成', '进入合同签署节点，请签署交易合同。')
                        await queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                      } catch (error: unknown) {
                        message.error(getErrorMessage(error, '确认失败'))
                      }
                    }}
                  >
                    确认订单
                  </Button>
                )}
                {order.status === 2 && !order.contract_info?.buyer_signed && (
                  <Button type="primary" loading={signing} onClick={handleSignContract}>
                    签署合同
                  </Button>
                )}
                {order.status === 3 && (
                  <Button type="primary" icon={<UploadOutlined />} onClick={() => setOpen(true)}>
                    上传支付凭证
                  </Button>
                )}
                {(order.status === 24 || order.status === 25) && (
                  <Button
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    onClick={() => setWarehouseOpen(true)}
                  >
                    {order.status === 25 ? '选择仓储方' : '重新选择仓储方'}
                  </Button>
                )}
                {order.status === 12 && (
                  <Button
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    onClick={() => setDestWarehouseOpen(true)}
                  >
                    选择目的地仓库
                  </Button>
                )}
                {order.status === 3 && (
                  <Button type="default" icon={<BankOutlined />} onClick={openFinanceModal}>
                    申请融资
                  </Button>
                )}
                {order.status === 22 && order.financing_info?.status === 'risk_approved' && (
                  <>
                    <Button type="primary" loading={confirmingFinancing} onClick={() => handleBuyerConfirmFinancing(true)}>
                      确认融资方案
                    </Button>
                    <Button loading={confirmingFinancing} onClick={() => {
                      Modal.confirm({
                        title: '放弃融资？',
                        content: '放弃后将恢复为待支付状态，可直接上传支付凭证完成付款。',
                        okText: '确认放弃',
                        cancelText: '取消',
                        onOk: () => handleBuyerConfirmFinancing(false),
                      })
                    }}>
                      放弃融资，直接支付
                    </Button>
                  </>
                )}
                {order.status === 23 && order.financing_info?.status === 'contract_generated' && (
                  <Button
                    type="primary"
                    onClick={() => setDebtSigningOpen(true)}
                  >
                    签署融资合同并支付手续费
                  </Button>
                )}
                {order.status === 23 && order.financing_info?.status === 'buyer_confirmed' && (
                  <Tag color="processing">等待资金方生成融资合同</Tag>
                )}
                {order.status === 16 && (
                  <Button
                    type="default"
                    onClick={() => {
                      setLogisticsModalOpen(true)
                      setSelectedQuoteId(null)
                      setLogisticsLoading(true)
                      orderService
                        .listLogisticsQuotes(Number(id))
                        .then((quotes) => {
                          setLogisticsQuotes(quotes)
                        })
                        .catch((error: unknown) => {
                          message.error(getErrorMessage(error, '获取报价列表失败'))
                        })
                        .finally(() => {
                          setLogisticsLoading(false)
                        })
                    }}
                  >
                    查看物流报价
                  </Button>
                )}
                {order.status === 17 && order.logistics_bidding && (
                  (() => {
                    const bidding = order.logistics_bidding
                    const isResponder = bidding.responder_enterprise_id === order.buyer_id
                    const isInitiator = bidding.initiator_enterprise_id === order.buyer_id
                    if (isResponder && !bidding.responder_confirmed && bidding.selected_quote_id > 0) {
                      return (
                        <Button
                          type="primary"
                          onClick={() => {
                            orderService
                              .respondConfirmLogistics(Number(id))
                              .then(() => {
                                message.success('已确认物流选择，等待物流方接单')
                                void queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                              })
                              .catch((error: unknown) => {
                                message.error(getErrorMessage(error, '确认物流失败'))
                              })
                          }}
                        >
                          确认物流选择
                        </Button>
                      )
                    }
                    if (isInitiator && bidding.selected_quote_id > 0 && !bidding.responder_confirmed) {
                      return <Tag color="processing">已选定物流，等待对方确认</Tag>
                    }
                    if (bidding.responder_confirmed && bidding.selected_quote_id > 0) {
                      return <Tag color="processing">双方已确认，等待物流方接单</Tag>
                    }
                    if (isInitiator && bidding.selected_quote_id === 0) {
                      return (
                        <Button
                          type="primary"
                          onClick={() => {
                            setLogisticsModalOpen(true)
                            setSelectedQuoteId(null)
                            setLogisticsLoading(true)
                            orderService
                              .listLogisticsQuotes(Number(id))
                              .then((quotes) => {
                                setLogisticsQuotes(quotes)
                                if (quotes.length > 0 && quotes[0].id) {
                                  setSelectedQuoteId(quotes[0].id)
                                }
                              })
                              .catch((error: unknown) => {
                                message.error(getErrorMessage(error, '获取报价列表失败'))
                              })
                              .finally(() => {
                                setLogisticsLoading(false)
                              })
                          }}
                        >
                          选择物流报价
                        </Button>
                      )
                    }
                    return null
                  })()
                )}
                {order.status === 27 && order.logistics_contract && order.logistics_contract.status !== 'buyer_signed' && order.logistics_contract.status !== 'completed' && (
                  <Button
                    type="primary"
                    onClick={() => {
                      orderService
                        .initiatorSignLogisticsContract(Number(id))
                        .then(() => {
                          message.success('物流合同签署成功')
                          void queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                        })
                        .catch((error: unknown) => {
                          message.error(getErrorMessage(error, '签署物流合同失败'))
                        })
                    }}
                  >
                    签署物流合同
                  </Button>
                )}
                {order.status === 27 && order.logistics_contract && (order.logistics_contract.status === 'buyer_signed' || order.logistics_contract.status === 'completed') && (
                  <span className="text-green-600">
                    <CheckCircleOutlined className="mr-1" />
                    已签署物流合同
                  </span>
                )}
                {canCancelOrder && (
                  <Button danger loading={cancelling} onClick={handleCancelOrder}>
                    取消订单
                  </Button>
                )}

                {logisticsOrder?.status === 'arrival_confirmed' && isFinancingOrder && (
                  <Tag color="gold">融资订单待资金方确认监管收货</Tag>
                )}
                {logisticsOrder?.status === 'arrival_confirmed' && !isFinancingOrder && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => setInspectionSignOpen(true)}
                  >
                    验货签收
                  </Button>
                )}
                {logisticsOrder?.status === 'receipt_signed' && (
                  <span className="text-green-600">
                    <CheckCircleOutlined className="mr-1" />
                    已验货签收
                  </span>
                )}

                {(order.status === 6 || order.status === 7) && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => setReceiptOpen(true)}
                  >
                    确认收货
                  </Button>
                )}
                {(order.status === 8 || order.status === 21) && (
                  <span className="text-green-600">
                    <CheckCircleOutlined className="mr-1" />
                    订单已完成归档
                  </span>
                )}
              </Space>
            </Card>

            <Modal
              title="上传支付凭证"
              open={open}
              onCancel={() => setOpen(false)}
              onOk={handleUploadVoucher}
              confirmLoading={uploading}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="voucher_file"
                  label="支付凭证文件"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList ?? []}
                  rules={[{ required: true, message: '请上传支付凭证文件' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="transaction_no" label="交易流水号">
                  <Input />
                </Form.Item>
                <Form.Item name="payer_account" label="付款账户">
                  <Input />
                </Form.Item>
                <Form.Item name="payee_account" label="收款账户">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="选择融资产品"
              open={financeOpen}
              onCancel={() => setFinanceOpen(false)}
              onOk={handleCreateFinancingRequest}
              confirmLoading={creatingFinance}
              okButtonProps={{ disabled: !selectedFinanceServiceId }}
              width={760}
            >
              <Spin spinning={financeProductsLoading}>
                {financeProducts.length > 0 ? (
                  <Radio.Group
                    className="w-full"
                    value={selectedFinanceServiceId}
                    onChange={(event) => setSelectedFinanceServiceId(Number(event.target.value))}
                  >
                    <Space direction="vertical" size="middle" className="w-full">
                      {financeProducts.map((item) => (
                        <FinanceProductOption
                          key={item.id}
                          item={item}
                          recommended={item.id === aiFinanceRecommendation?.finance_service_id}
                          amount={order.tax_total_amount || order.total_amount}
                        />
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <Empty description="暂无已审核金融产品" />
                )}
              </Spin>
            </Modal>

            <Modal
              title="重新选择仓储方"
              open={warehouseOpen}
              onCancel={() => setWarehouseOpen(false)}
              onOk={handleReselectWarehouse}
              confirmLoading={savingWarehouse}
            >
              <Form form={warehouseForm} layout="vertical">
                <Alert
                  showIcon
                  type="info"
                  className="mb-4"
                  message="仓储方拒绝承接后，订单会回退到重新选仓。请填写新的已审核仓储资源 ID。"
                />
                <Form.Item
                  name="warehouse_service_id"
                  label="仓储资源 ID"
                  rules={[{ required: true, message: '请输入仓储资源 ID' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="confirm_note" label="备注">
                  <Input />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="选择目的地仓库"
              open={destWarehouseOpen}
              onCancel={() => setDestWarehouseOpen(false)}
              onOk={handleSelectDestWarehouse}
              confirmLoading={savingDestWarehouse}
            >
              <Form form={destWarehouseForm} layout="vertical">
                <Alert
                  showIcon
                  type="info"
                  className="mb-4"
                  message="请选择物流送达的目的地仓库"
                  description={`提货仓库：${order?.delivery_info?.warehouse_name || '未设置'}（${order?.delivery_info?.warehouse_code || '无编码'}）`}
                />
                <Form.Item
                  name="dest_warehouse_service_id"
                  label="目的地仓储"
                  rules={[{ required: true, message: '请选择目的地仓储' }]}
                >
                  <Select
                    placeholder="请选择已登记的仓储"
                    showSearch
                    optionFilterProp="children"
                    loading={!publicWarehousesData}
                  >
                    {publicWarehouses.map((w: WarehouseServiceItem) => (
                      <Select.Option key={w.id} value={w.id}>
                        {w.warehouse_name}（ID: {w.id}）{w.finance_certified ? ' · 资方认证监管仓' : ''}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="dest_confirm_note" label="备注">
                  <Input placeholder="可选备注" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="录入提货信息"
              open={deliveryOpen}
              onCancel={() => setDeliveryOpen(false)}
              onOk={handleSaveDelivery}
              confirmLoading={savingDelivery}
            >
              <Form form={deliveryForm} layout="vertical">
                <Alert
                  showIcon
                  type="info"
                  className="mb-4"
                  message="提货仓库由卖家商品仓库自动带出"
                  description={
                    pickupWarehouseName
                      ? `${pickupWarehouseName}${pickupWarehouseCode ? `（${pickupWarehouseCode}）` : ''}${pickupWarehouseRegion ? `，${pickupWarehouseRegion}` : ''}`
                      : '当前未获取到仓库信息，请联系卖家确认后再继续。'
                  }
                />
                <Form.Item name="driver_name" label="司机姓名" rules={[{ required: true }]}>
                  <Input placeholder="例如：张师傅" />
                </Form.Item>
                <Form.Item name="driver_phone" label="司机电话" rules={[{ required: true }]}>
                  <Input placeholder="例如：13800000000" />
                </Form.Item>
                <Form.Item name="driver_id_card" label="司机身份证">
                  <Input placeholder="例如：110101199001011234" />
                </Form.Item>
                <Form.Item name="plate_number" label="车牌号" rules={[{ required: true }]}>
                  <Input placeholder="例如：冀A12345" />
                </Form.Item>
                <Form.Item label="提货仓库">
                  <Input value={pickupWarehouseName || '未提供提货仓库'} disabled />
                </Form.Item>
                <Form.Item label="仓库编码">
                  <Input value={pickupWarehouseCode || '未提供仓库编码'} disabled />
                </Form.Item>
                <Form.Item name="estimated_time" label="预计提货时间">
                  <Input placeholder="例如：2026-04-23 10:00" />
                </Form.Item>
                <Form.Item name="address" label="送达地址" rules={[{ required: true }]}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="确认收货并上传签收凭证"
              open={receiptOpen}
              onCancel={() => setReceiptOpen(false)}
              onOk={handleConfirmReceipt}
              confirmLoading={confirmingReceipt}
            >
              <Form form={receiptForm} layout="vertical">
                <Form.Item
                  name="receipt_file"
                  label="签收凭证文件"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList ?? []}
                  rules={[{ required: true, message: '请上传签收凭证文件' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="验货签收并上传收货单"
              open={inspectionSignOpen}
              onCancel={() => {
                setInspectionSignOpen(false)
                inspectionSignForm.resetFields()
              }}
              onOk={handleInspectionSign}
              confirmLoading={confirmingInspectionSign}
              okText="上传并签收"
            >
              <Form form={inspectionSignForm} layout="vertical">
                <Paragraph type="secondary">
                  该节点会作为物流履约的验收签收凭证。融资订单由资金方确认，普通订单由买方确认。
                </Paragraph>
                <Form.Item
                  name="receipt_file"
                  label="收货单/签收凭证"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList ?? []}
                  rules={[{ required: true, message: '请上传收货单或签收凭证' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>选择文件</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="remark" label="签收备注">
                  <Input.TextArea rows={3} placeholder="选填" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title={order?.status === 16 ? '查看物流报价' : '确认物流资源'}
              open={logisticsModalOpen}
              onCancel={() => {
                setLogisticsModalOpen(false)
                setLogisticsQuotes([])
                setSelectedQuoteId(null)
              }}
              onOk={
                order?.status === 17
                  ? () => {
                      if (!selectedQuoteId) {
                        message.warning('请先选择一个物流报价')
                        return
                      }
                      setConfirmingLogistics(true)
                      orderService
                        .confirmLogisticsQuote(Number(id), { quote_id: selectedQuoteId })
                        .then(() => {
                          message.success('物流资源确认成功，进入待提货阶段')
                          setLogisticsModalOpen(false)
                          setLogisticsQuotes([])
                          setSelectedQuoteId(null)
                          void queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                        })
                        .catch((error: unknown) => {
                          message.error(getErrorMessage(error, '确认物流失败'))
                        })
                        .finally(() => {
                          setConfirmingLogistics(false)
                        })
                    }
                  : undefined
              }
              okText={order?.status === 17 ? '确认选择' : undefined}
              okButtonProps={
                order?.status === 17
                  ? { loading: confirmingLogistics, disabled: !selectedQuoteId }
                  : { style: { display: 'none' } }
              }
              cancelText={order?.status === 17 ? '取消' : '关闭'}
              width={720}
              destroyOnHidden
            >
              {order && (
                <div>
                  <Alert
                    type="info"
                    showIcon
                    message={
                      order.status === 16
                        ? '物流报价进行中，以下是已有的报价。卖家结束报价后会选择物流，然后需要你确认。'
                        : '请确认卖家选定的物流报价'
                    }
                    style={{ marginBottom: 16 }}
                  />
                  <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="订单号">{order.order_no}</Descriptions.Item>
                    <Descriptions.Item label="卖家企业">{order.seller_name}</Descriptions.Item>
                    <Descriptions.Item label="商品">{item?.product_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="数量">{order.total_quantity} 吨</Descriptions.Item>
                  </Descriptions>
                  <Spin spinning={logisticsLoading}>
                    {logisticsQuotes.length === 0 ? (
                      <div className="text-center py-8">
                        <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                        <div className="text-gray-500">暂无物流报价</div>
                      </div>
                    ) : (
                      <Radio.Group
                        value={selectedQuoteId}
                        onChange={(e) => order.status === 17 && setSelectedQuoteId(e.target.value)}
                      >
                        <Space direction="vertical" className="w-full">
                          {logisticsQuotes.map((quote) => (
                            <Radio
                              key={quote.id}
                              value={quote.id}
                              className="w-full"
                              disabled={order.status === 16}
                            >
                              <Card className="w-full" hoverable={order.status === 17}>
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
                                      <span>
                                        预计送达：{quote.estimated_delivery_at || '未填写'}
                                      </span>
                                    </div>
                                    {quote.remark && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        备注：{quote.remark}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-blue-600">
                                      ¥{quote.amount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      报价时间：{new Date(quote.created_at).toLocaleString()}
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
            <Modal
              title="签署融资合同并支付手续费"
              open={debtSigningOpen}
              onCancel={() => { setDebtSigningOpen(false); setFeeVoucherFileList([]) }}
              onOk={handleSignDebtAndPayFee}
              okText="确认签署并支付"
              okButtonProps={{ loading: signingDebt }}
              cancelText="取消"
              width={520}
              destroyOnHidden
            >
              {order?.financing_info && (
                <div>
                  <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="授信金额">¥{order.financing_info.approved_amount?.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="融资期限">{order.financing_info.term_days} 天</Descriptions.Item>
                    <Descriptions.Item label="年化利率">{order.financing_info.annual_rate}%</Descriptions.Item>
                    <Descriptions.Item label="手续费">¥{order.financing_info.service_fee?.toLocaleString()}</Descriptions.Item>
                    {order.financing_info.debt_contract_no && (
                      <Descriptions.Item label="合同编号">{order.financing_info.debt_contract_no}</Descriptions.Item>
                    )}
                  </Descriptions>
                  <Alert type="info" showIcon message="请先支付手续费，上传支付凭证后完成签署。" style={{ marginBottom: 16 }} />
                  <Upload
                    maxCount={1}
                    fileList={feeVoucherFileList}
                    onChange={({ fileList }) => setFeeVoucherFileList(fileList)}
                    beforeUpload={() => false}
                    accept="image/*,.pdf"
                  >
                    <Button icon={<UploadOutlined />}>上传手续费支付凭证</Button>
                  </Upload>
                </div>
              )}
            </Modal>
          </>
        )}
      </div>
    </div>
  )
}

function FinanceProductOption({
  item,
  recommended,
  amount,
}: {
  item: FinanceServiceItem
  recommended: boolean
  amount: number
}) {
  const amountAllowed =
    (!item.min_amount || amount >= item.min_amount) &&
    (!item.max_amount || amount <= item.max_amount)
  return (
    <Radio className="w-full" value={item.id} disabled={!amountAllowed}>
      <div
        className={`ml-2 rounded border p-4 ${recommended ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-white'}`}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <Text strong>{item.name}</Text>
            <div className="mt-1 text-sm text-gray-500">
              {item.finance_type || '融资产品'} · {formatMoney(item.min_amount)} -{' '}
              {formatMoney(item.max_amount)} · {formatRate(item.annual_rate)} ·{' '}
              {item.term_days || '-'} 天
            </div>
            {item.description && (
              <div className="mt-1 text-sm text-gray-500">{item.description}</div>
            )}
          </div>
          <Space>
            {recommended && <Tag color="blue">AI推荐</Tag>}
            <Tag color={amountAllowed ? 'green' : 'default'}>
              {amountAllowed ? '额度匹配' : '额度不匹配'}
            </Tag>
          </Space>
        </div>
      </div>
    </Radio>
  )
}
