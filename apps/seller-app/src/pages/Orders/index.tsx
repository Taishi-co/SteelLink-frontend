import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Descriptions, Input, Modal, Select, Space, Spin, Table, Tag, Timeline, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import { getErrorMessage, getErrorStatus, timelineColor } from '@steellink/shared/utils'
import { sellerOrderService, type SellerOrderInfo } from '@/services/orderService'
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
  12: { color: 'purple', text: '待仓库确认' },
  13: { color: 'orange', text: '待卖方确认' },
  14: { color: 'blue', text: '待买方确认' },
  15: { color: 'cyan', text: '物流竞价中' },
  16: { color: 'gold', text: '待确认物流' },
  17: { color: 'processing', text: '运输中' },
  18: { color: 'green', text: '已收货' },
  19: { color: 'success', text: '已对账' },
  20: { color: 'default', text: '已归档' },
  21: { color: 'purple', text: '融资审批中' },
  22: { color: 'gold', text: '待签署融资合同' },
  23: { color: 'volcano', text: '待重新选仓' },
  24: { color: 'volcano', text: '待重新发起物流' },
}

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '待确认', value: 1 },
  { label: '待签合同', value: 2 },
  { label: '待支付', value: 3 },
  { label: '待确认收款', value: 4 },
  { label: '待提货', value: 5 },
  { label: '配送中', value: 6 },
  { label: '已送达', value: 7 },
  { label: '已完成', value: 8 },
  { label: '已取消', value: 9 },
]

const activeOrderStatuses = [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 21, 22]

const summaryStatusItems = [
  { key: 'active', label: '进行中', statuses: activeOrderStatuses },
  { key: 1, label: '待确认', statuses: [1] },
  { key: 4, label: '待确认收款', statuses: [4] },
  { key: 5, label: '待提货', statuses: [5] },
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
  if (!order) return { type: 'info' as const, title: '当前状态：订单详情', next: '请查看订单信息。' }
  if (order.status === 13) return { type: 'warning' as const, title: '当前状态：待卖方确认', next: '核对条款后确认订单，随后等待买方确认。' }
  if (order.status === 2) {
    if (order.contract_info?.buyer_signed && order.contract_info?.seller_signed) {
      return { type: 'success' as const, title: '当前状态：双方签署已完成', next: '签署状态：买家已签，卖家已签。已进入支付节点。' }
    }
    if (order.contract_info?.seller_signed) {
      return { type: 'info' as const, title: '当前状态：卖方签署已完成', next: '签署状态：卖家已签，买家未签。等待买方签署后进入支付节点。' }
    }
    if (order.contract_info?.buyer_signed) {
      return { type: 'warning' as const, title: '当前状态：买方签署已完成', next: '签署状态：买家已签，卖家未签。请先查看详情并完成签署。' }
    }
    return { type: 'warning' as const, title: '当前状态：待签合同', next: '签署状态：买家未签，卖家未签。请签署合同；双方签署后进入支付节点。' }
  }
  if (order.status === 4) return { type: 'warning' as const, title: '当前状态：买方支付已完成', next: '请确认收款；之后发起物流竞价。' }
  if (order.status === 15) return { type: 'info' as const, title: '当前状态：物流竞价已发起', next: '等待物流方报价，也可在无运力时反馈平台。' }
  if (order.status === 16) return { type: 'warning' as const, title: '当前状态：物流报价已完成', next: '如合同约定卖方承担运费，请确认物流报价。' }
  if (order.status === 24) return { type: 'warning' as const, title: '当前状态：待重新发起物流', next: '平台已收到无运力反馈，请重新发起物流竞价。' }
  if (order.status === 18) return { type: 'success' as const, title: '当前状态：买方收货已完成', next: '请完成对账确认。' }
  if (order.status === 19) return { type: 'success' as const, title: '当前状态：对账已完成', next: '等待归档或回工作台查看订单。' }
  return { type: 'info' as const, title: `当前状态：${formatStatus(order.status).text}`, next: '请按订单详情中的可用操作继续处理。' }
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
  const [confirmAction, setConfirmAction] = useState<{ type: 'payment' | 'outbound'; order: SellerOrderInfo } | null>(null)
  const [confirmInput, setConfirmInput] = useState('')

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
        const detail = await sellerOrderService.confirmOutbound(order.id, { pickup_code: confirmInput.trim() })
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
      render: (_, record) => (record.payment_info?.voucher_url ? <Tag color="blue">已上传</Tag> : <Tag>未上传</Tag>),
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
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => void openOrderDetail(record)}>
            详情
          </Button>
          {record.status === 1 && (
            <Button type="link" size="small" onClick={() => void handleConfirmOrder(record)}>
              确认订单
            </Button>
          )}
          {record.status === 13 && (
            <Button type="link" size="small" onClick={async () => {
              setActionLoading(true)
              try {
                const detail = await sellerOrderService.sellerConfirm(record.id)
                showCompleted('卖方条款确认已完成', '等待买方确认订单最终版本。', detail)
                setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
              } catch (error: unknown) { message.error(getErrorMessage(error, '确认失败')) }
              finally { setActionLoading(false) }
            }}>确认条款</Button>
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
          {(record.status === 4 || record.status === 24) && (
            <Button type="link" size="small" onClick={async () => {
              setActionLoading(true)
              try {
                const detail = await sellerOrderService.createLogisticsBidding(record.id, { freight_payer: 'buyer' })
                showCompleted('物流竞价发起已完成', '等待物流方报价；订单详情和管理端会记录本次发起事件。', detail)
                setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
              } catch (error: unknown) { message.error(getErrorMessage(error, '发起竞价失败')) }
              finally { setActionLoading(false) }
            }}>发起物流竞价</Button>
          )}
          {(record.status === 15 || record.status === 16) && (
            <Button type="link" size="small" danger onClick={async () => {
              setActionLoading(true)
              try {
                const detail = await sellerOrderService.reportLogisticsNoCapacity(record.id, { no_capacity_reason: '暂无合规运力承接' })
                showCompleted('无运力反馈已完成', '平台管理端已收到反馈，订单回退为待重新发起物流。', detail)
                setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
              } catch (error: unknown) { message.error(getErrorMessage(error, '反馈失败')) }
              finally { setActionLoading(false) }
            }}>无运力反馈</Button>
          )}
          {record.status === 5 && record.delivery_info?.pickup_code && (
            <Button type="link" size="small" onClick={() => void handleConfirmOutbound(record)}>
              确认出库
            </Button>
          )}
          {record.status === 18 && (
            <Button type="link" size="small" onClick={async () => {
              setActionLoading(true)
              try {
                const detail = await sellerOrderService.reconcile(record.id)
                showCompleted('对账确认已完成', '等待归档，交易闭环即将完成。', detail)
                setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
              } catch (error: unknown) { message.error(getErrorMessage(error, '对账失败')) }
              finally { setActionLoading(false) }
            }}>对账确认</Button>
          )}
        </Space>
      ),
    },
  ]

  const selectedPrimaryProduct = selectedOrder ? getPrimaryProduct(selectedOrder) : null
  const selectedStatus = selectedOrder ? formatStatus(selectedOrder.status) : null
  const selectedGuidance = getSellerGuidance(selectedOrder)

  return (
    <div className="min-w-0">
      <Card
        title="订单管理"
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
              statusFilter === 'all' ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
            }`}
          >
            <div className="text-xs text-gray-500">全部订单</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{orderSummary.total}</div>
          </button>
          {summaryStatusItems.map((item) => {
            const count = item.statuses.reduce((sum, status) => sum + (orderSummary.statusCounts[status] || 0), 0)
            const active = statusFilter === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSummaryFilter(item)}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  active ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
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

      <Modal
        title="订单详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            关闭
          </Button>,
          selectedOrder?.status === 1 ? (
            <Button key="confirm-order" type="primary" loading={actionLoading} onClick={() => selectedOrder && void handleConfirmOrder(selectedOrder)}>
              确认订单
            </Button>
          ) : null,
          selectedOrder?.status === 2 && !selectedOrder.contract_info?.seller_signed ? (
            <Button key="sign-contract" type="primary" loading={actionLoading} onClick={() => selectedOrder && void handleSignContract(selectedOrder)}>
              签署合同
            </Button>
          ) : null,
          selectedOrder?.status === 4 && selectedOrder.payment_info?.voucher_url ? (
            <Button key="confirm" type="primary" loading={actionLoading} onClick={() => void handleConfirmPayment(selectedOrder)}>
              确认收款
            </Button>
          ) : null,
          selectedOrder?.status === 5 && selectedOrder.delivery_info?.pickup_code ? (
            <Button key="outbound" type="primary" onClick={() => handleConfirmOutbound(selectedOrder)}>
              确认出库
            </Button>
          ) : null,
        ]}
        width={860}
      >
        {selectedOrder ? (
          <Spin spinning={actionLoading}>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="订单号" span={2}>{selectedOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="买家企业">{selectedOrder.buyer_name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedStatus ? <Tag color={selectedStatus.color}>{selectedStatus.text}</Tag> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="商品名称">{selectedPrimaryProduct?.product_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="钢厂 / 捆包号">
                {selectedPrimaryProduct ? `${selectedPrimaryProduct.steel_mill || '未填钢厂'} / ${selectedPrimaryProduct.bundle_no || '未填捆包号'}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="数量">{selectedOrder.total_quantity} 吨</Descriptions.Item>
              <Descriptions.Item label="订单金额">{formatCurrency(selectedOrder.total_amount)}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{formatDate(selectedOrder.created_at)}</Descriptions.Item>
              <Descriptions.Item label="过期时间">{formatDate(selectedOrder.expires_at)}</Descriptions.Item>
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
              <Descriptions.Item label="合同编号">{selectedOrder.contract_info?.contract_no || '-'}</Descriptions.Item>
              <Descriptions.Item label="合同状态">{formatContractStatus(selectedOrder.contract_info)}</Descriptions.Item>
              <Descriptions.Item label="买家签署">{selectedOrder.contract_info?.buyer_signed ? '已签署' : '未签署'}</Descriptions.Item>
              <Descriptions.Item label="卖家签署">{selectedOrder.contract_info?.seller_signed ? '已签署' : '未签署'}</Descriptions.Item>
              <Descriptions.Item label="合同文件" span={2}>
                {selectedOrder.contract_info?.contract_url ? (
                  <a href={selectedOrder.contract_info.contract_url} target="_blank" rel="noreferrer">
                    查看合同
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={2} size="middle" style={{ marginTop: 16 }}>
              <Descriptions.Item label="交易流水号">{selectedOrder.payment_info?.transaction_no || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{formatDate(selectedOrder.payment_info?.payment_time)}</Descriptions.Item>
              <Descriptions.Item label="付款账户">{selectedOrder.payment_info?.payer_account || '-'}</Descriptions.Item>
              <Descriptions.Item label="收款账户">{selectedOrder.payment_info?.payee_account || '-'}</Descriptions.Item>
              <Descriptions.Item label="上传时间">{formatDate(selectedOrder.payment_info?.uploaded_at)}</Descriptions.Item>
              <Descriptions.Item label="水印时间">{selectedOrder.payment_info?.captured_at || '-'}</Descriptions.Item>
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
              <Descriptions.Item label="提货司机">{selectedOrder.delivery_info?.driver_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.delivery_info?.driver_phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="车牌号">{selectedOrder.delivery_info?.plate_number || '-'}</Descriptions.Item>
              <Descriptions.Item label="提货码">{selectedOrder.delivery_info?.pickup_code || '-'}</Descriptions.Item>
              <Descriptions.Item label="仓库名称">{selectedOrder.delivery_info?.warehouse_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="预计时间">{selectedOrder.delivery_info?.estimated_time || '-'}</Descriptions.Item>
              <Descriptions.Item label="提货地址" span={2}>{selectedOrder.delivery_info?.address || '-'}</Descriptions.Item>
            </Descriptions>

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
        onCancel={() => { setConfirmAction(null); setConfirmInput('') }}
        onOk={() => void executeConfirmAction()}
        okText="确认执行"
        okButtonProps={{ danger: true, loading: actionLoading, disabled: !confirmInput }}
        destroyOnHidden
      >
        {confirmAction && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{confirmAction.order.order_no}</Descriptions.Item>
              <Descriptions.Item label="买家企业">{confirmAction.order.buyer_name}</Descriptions.Item>
              <Descriptions.Item label="订单金额">{formatCurrency(confirmAction.order.total_amount)}</Descriptions.Item>
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
                    请输入订单号后 4 位以确认操作：<strong>{confirmAction.order.order_no.slice(-4)}</strong>
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
    </div>
  )
}
