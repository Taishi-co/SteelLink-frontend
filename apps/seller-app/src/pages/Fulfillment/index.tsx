import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { getErrorMessage, getErrorStatus } from '@steellink/shared/utils'
import { sellerOrderService, type SellerOrderInfo } from '@/services/orderService'
import { sellerAuthService, updateSellerUser } from '@/services/auth'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Text } = Typography

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`
}

function formatDate(value?: string) {
  if (!value) {
    return '-'
  }
  return value.replace('T', ' ').slice(0, 19)
}

function primaryProduct(order: SellerOrderInfo) {
  return order.items[0]
}

export default function FulfillmentPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<{ pickup_code: string }>()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [orders, setOrders] = useState<SellerOrderInfo[]>([])
  const [selectedOrder, setSelectedOrder] = useState<SellerOrderInfo | null>(null)
  const [searchText, setSearchText] = useState('')

  async function loadOrders() {
    setLoading(true)
    try {
      const list = await sellerOrderService.list()
      const pendingPickup = list.filter((order) => order.status === 5 && Boolean(order.delivery_info?.pickup_code))
      setOrders(pendingPickup)
      setSelectedOrder((current) => {
        if (!current) return pendingPickup[0] ?? null
        return pendingPickup.find((order) => order.id === current.id) ?? pendingPickup[0] ?? null
      })
    } catch (error: unknown) {
      if (getErrorStatus(error) === 403) {
        try {
          const res = await sellerAuthService.me()
          if (res.code === 0 && res.data) {
            updateSellerUser(res.data)
          }
        } catch {
          // Ignore refresh failure; navigation below is the actionable fallback.
        }
        message.warning('企业仍在审核中或登录状态未刷新，请先完成企业审核后再访问履约核销')
        navigate('/enterprise', { replace: true })
        return
      }
      message.error(getErrorMessage(error, '履约订单加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    const keyword = searchText.trim()
    if (!keyword) return orders
    return orders.filter((order) => {
      const product = primaryProduct(order)
      return (
        order.order_no.includes(keyword) ||
        order.buyer_name.includes(keyword) ||
        order.delivery_info?.pickup_code.includes(keyword) ||
        product?.product_name?.includes(keyword)
      )
    })
  }, [orders, searchText])

  const fulfillmentSummary = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const vehicleCount = new Set(orders.map((order) => order.delivery_info?.plate_number).filter(Boolean)).size

    return {
      total: orders.length,
      filtered: filteredOrders.length,
      totalAmount,
      vehicleCount,
    }
  }, [filteredOrders.length, orders])

  async function handleVerify() {
    if (!selectedOrder) return
    try {
      const values = await form.validateFields()
      setVerifying(true)
      const detail = await sellerOrderService.confirmOutbound(selectedOrder.id, {
        pickup_code: values.pickup_code.trim(),
      })
      message.success('提货码核销成功，订单已确认出库')
      setOrders((prev) => prev.filter((order) => order.id !== detail.id))
      setSelectedOrder((prev) => {
        const rest = orders.filter((order) => order.id !== detail.id)
        if (prev?.id === detail.id) return rest[0] ?? null
        return prev
      })
      form.resetFields()
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '提货码核销失败'))
    } finally {
      setVerifying(false)
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
        const product = primaryProduct(record)
        return product ? (
          <div>
            <div className="line-clamp-2 font-medium text-gray-900">{product.product_name}</div>
            <Text type="secondary" className="text-xs">
              {product.steel_mill || '未填钢厂'} / {product.bundle_no || '未填捆包号'}
            </Text>
          </div>
        ) : '-'
      },
    },
    {
      title: '车牌号',
      key: 'plate_number',
      width: 120,
      render: (_, record) => record.delivery_info?.plate_number || '-',
    },
    {
      title: '提货码',
      key: 'pickup_code',
      width: 140,
      render: (_, record) => <Text copyable>{record.delivery_info?.pickup_code || '-'}</Text>,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: () => <Tag color="cyan">待提货</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => { setSelectedOrder(record); form.resetFields() }}>
          核销
        </Button>
      ),
    },
  ]

  const product = selectedOrder ? primaryProduct(selectedOrder) : null

  return (
    <div className="min-w-0">
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3">
          <div className="text-xs text-gray-500">待核销订单</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{fulfillmentSummary.total}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="text-xs text-gray-500">当前筛选</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{fulfillmentSummary.filtered}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="text-xs text-gray-500">待出库金额</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(fulfillmentSummary.totalAmount)}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="text-xs text-gray-500">关联车辆</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{fulfillmentSummary.vehicleCount}</div>
        </div>
      </div>

      <Alert
        className="mb-4"
        type="warning"
        showIcon
        message="核销前请核对司机、车牌、提货码和仓库信息"
        description="确认核销后订单会进入配送中状态，当前操作会直接调用后端出库确认接口。"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card
          title="履约核销"
          extra={
            <Button icon={<ReloadOutlined />} onClick={() => void loadOrders()}>
              刷新
            </Button>
          }
        >
          <Search
            className="mb-4 w-full xl:max-w-md"
            allowClear
            placeholder="搜索订单号 / 买家 / 商品 / 提货码"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={setSearchText}
          />
          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            size="middle"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedOrder(record)
                form.resetFields()
              },
            })}
          />
        </Card>

        <Card title="提货核销" className="h-fit">
          <Spin spinning={loading}>
            {selectedOrder ? (
              <Space direction="vertical" className="w-full" size="middle">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="订单号">{selectedOrder.order_no}</Descriptions.Item>
                  <Descriptions.Item label="买家企业">{selectedOrder.buyer_name}</Descriptions.Item>
                  <Descriptions.Item label="商品">{product?.product_name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="数量">{selectedOrder.total_quantity} 吨</Descriptions.Item>
                  <Descriptions.Item label="金额">{formatCurrency(selectedOrder.total_amount)}</Descriptions.Item>
                  <Descriptions.Item label="司机">{selectedOrder.delivery_info?.driver_name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{selectedOrder.delivery_info?.driver_phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="车牌号">{selectedOrder.delivery_info?.plate_number || '-'}</Descriptions.Item>
                  <Descriptions.Item label="提货仓库">{selectedOrder.delivery_info?.warehouse_name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="预计时间">{selectedOrder.delivery_info?.estimated_time || '-'}</Descriptions.Item>
                  <Descriptions.Item label="下单时间">{formatDate(selectedOrder.created_at)}</Descriptions.Item>
                </Descriptions>

                <Alert type="warning" showIcon message="核销后订单将进入配送中" />

                <Form form={form} layout="vertical">
                  <Form.Item
                    name="pickup_code"
                    label="提货码"
                    rules={[{ required: true, message: '请输入提货码' }]}
                  >
                    <Input placeholder="输入买家提供的提货码" autoComplete="off" />
                  </Form.Item>
                  <Button
                    type="primary"
                    block
                    icon={<CheckCircleOutlined />}
                    loading={verifying}
                    onClick={() => void handleVerify()}
                  >
                    确认核销并出库
                  </Button>
                </Form>
              </Space>
            ) : (
              <Empty description="暂无待核销订单" />
            )}
          </Spin>
        </Card>
      </div>
    </div>
  )
}
