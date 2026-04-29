import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Descriptions, Input, Modal, Select, Space, Spin, Table, Tag, Timeline, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined } from '@ant-design/icons'
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
  4: { color: 'blue', text: '待确认收款' },
  5: { color: 'cyan', text: '待提货' },
  6: { color: 'processing', text: '配送中' },
  7: { color: 'green', text: '已送达' },
  8: { color: 'success', text: '已完成' },
  9: { color: 'red', text: '已取消' },
  10: { color: 'volcano', text: '已冻结' },
  11: { color: 'magenta', text: '异常' },
}

const statusOptions = [
  { label: '全部状态', value: 'all' },
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

function getPrimaryProduct(order: SellerOrderInfo) {
  return order.items[0]
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

  async function loadOrders() {
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
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const primary = getPrimaryProduct(order)
      const matchesSearch =
        !searchText ||
        order.order_no.includes(searchText) ||
        order.buyer_name.includes(searchText) ||
        primary?.product_name?.includes(searchText)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchText, statusFilter])

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
      message.success('订单已确认，等待双方签署合同')
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
      if (detail.contract_info?.buyer_signed && detail.contract_info?.seller_signed) {
        message.success('双方已签署合同，订单进入待支付阶段')
      } else {
        message.success('合同已签署，等待对方签署')
      }
      setSelectedOrder(detail)
      setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
      setIsModalOpen(true)
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
    if (confirmInput !== lastFour) {
      message.error(`请输入订单号后 4 位「${lastFour}」以确认操作`)
      return
    }
    setActionLoading(true)
    try {
      if (type === 'payment') {
        const detail = await sellerOrderService.confirmPayment(order.id)
        message.success('已确认收款，订单进入待提货')
        setSelectedOrder(detail)
        setOrders((prev) => prev.map((item) => (item.id === detail.id ? detail : item)))
        setIsModalOpen(true)
      } else {
        const detail = await sellerOrderService.confirmOutbound(order.id)
        message.success('已确认出库，订单进入配送中')
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
      width: 220,
    },
    {
      title: '买家企业',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      width: 180,
    },
    {
      title: '商品',
      key: 'product',
      render: (_, record) => {
        const product = getPrimaryProduct(record)
        if (!product) {
          return '-'
        }
        return (
          <div>
            <div>{product.product_name}</div>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>
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
      width: 120,
      render: (value: number) => `${value} 吨`,
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 180,
      render: (value: string) => formatDate(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => void openOrderDetail(record)}>
            详情
          </Button>
          {record.status === 1 && (
            <Button type="link" size="small" onClick={() => void handleConfirmOrder(record)}>
              确认订单
            </Button>
          )}
          {record.status === 2 && !record.contract_info?.seller_signed && (
            <Button type="link" size="small" onClick={() => void handleSignContract(record)}>
              签署合同
            </Button>
          )}
          {record.status === 4 && record.payment_info?.voucher_url && (
            <Button type="link" size="small" onClick={() => void handleConfirmPayment(record)}>
              确认收款
            </Button>
          )}
          {record.status === 5 && record.delivery_info?.pickup_code && (
            <Button type="link" size="small" onClick={() => void handleConfirmOutbound(record)}>
              确认出库
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const selectedPrimaryProduct = selectedOrder ? getPrimaryProduct(selectedOrder) : null
  const selectedStatus = selectedOrder ? formatStatus(selectedOrder.status) : null

  return (
    <div>
      <Card title="订单管理">
        <Space className="mb-4" wrap>
          <Search
            placeholder="搜索订单号 / 买家企业 / 商品名"
            allowClear
            style={{ width: 280 }}
            onSearch={setSearchText}
            onChange={(event) => setSearchText(event.target.value)}
            value={searchText}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={statusOptions}
          />
        </Space>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
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
                type={selectedOrder.status === 1 ? 'warning' : selectedOrder.status === 2 ? 'info' : selectedOrder.payment_info?.voucher_url ? 'info' : 'warning'}
                showIcon
                message={
                  selectedOrder.status === 1
                    ? '新订单待确认，请核实商品和价格后确认订单。'
                    : selectedOrder.status === 2
                      ? selectedOrder.contract_info?.buyer_signed
                        ? '买家已签署合同，等待您签署后订单进入支付阶段。'
                        : '订单已确认，等待买卖双方签署合同。'
                      : selectedOrder.payment_info?.voucher_url
                        ? '买家已上传支付凭证，可确认收款。'
                        : '买家尚未上传支付凭证。'
                }
              />
            </div>

            <Descriptions bordered column={2} size="middle" style={{ marginTop: 16 }}>
              <Descriptions.Item label="交易流水号">{selectedOrder.payment_info?.transaction_no || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付时间">{formatDate(selectedOrder.payment_info?.payment_time)}</Descriptions.Item>
              <Descriptions.Item label="付款账户">{selectedOrder.payment_info?.payer_account || '-'}</Descriptions.Item>
              <Descriptions.Item label="收款账户">{selectedOrder.payment_info?.payee_account || '-'}</Descriptions.Item>
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
                请输入订单号后 4 位以确认操作：<strong>{confirmAction.order.order_no.slice(-4)}</strong>
              </div>
              <Input
                placeholder="输入订单号后 4 位"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                maxLength={4}
                style={{ width: 200 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
