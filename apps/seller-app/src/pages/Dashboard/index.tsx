import { useEffect, useState } from 'react'
import { Alert, Card, Typography, Table, Tag, Spin, Button, Space } from 'antd'
import {
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  WarningOutlined,
  FileProtectOutlined,
  RiseOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { sellerOrderService, type SellerOrderInfo } from '@/services/orderService'
import { sellerProductService } from '@/services/productService'
import { getSellerUser } from '@/services/auth'

const { Title, Text, Paragraph } = Typography

const orderStatusMeta: Record<number, { color: string; text: string }> = {
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
  12: { color: 'geekblue', text: '待买方选择目的仓' },
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
  26: { color: 'geekblue', text: '待选择仓库' },
  27: { color: 'gold', text: '待签署物流合同' },
}

interface TodoItem {
  key: string
  text: string
  description: string
  count: number
  color: string
  icon: React.ReactNode
  link: string
  actionText: string
}

function getSellerNextAction(order: SellerOrderInfo) {
  if (order.status === 14) return { text: '确认仓储条款', link: '/orders' }
  if (order.status === 2) return { text: '签署销售合同', link: '/orders' }
  if (order.status === 4) return { text: '确认收款', link: '/orders' }
  if (order.status === 5) return { text: '提货/出库', link: '/fulfillment' }
  if (order.status === 16) return { text: '查看物流报价', link: '/orders' }
  if (order.status === 25) return { text: '重新发起物流', link: '/orders' }
  if (order.status === 27) return { text: '签署物流合同', link: '/orders' }
  if (order.status === 18) return { text: '跟踪运输', link: '/orders' }
  if (order.status === 1) return { text: '确认订单', link: '/orders' }
  return { text: '查看订单', link: '/orders' }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<SellerOrderInfo[]>([])
  const [productCount, setProductCount] = useState(0)
  const [productApproved, setProductApproved] = useState(0)
  const [productPending, setProductPending] = useState(0)
  const [productRejected, setProductRejected] = useState(0)
  const navigate = useNavigate()
  const user = getSellerUser()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [orderList, productRes] = await Promise.allSettled([
        sellerOrderService.list(),
        sellerProductService.list(),
      ])

      if (orderList.status === 'fulfilled') {
        setOrders(orderList.value || [])
      }
      if (productRes.status === 'fulfilled') {
        const res = productRes.value
        const list = res?.data?.list || []
        setProductCount(list.length)
        setProductApproved(list.filter((p: { status: string }) => p.status === 'approved').length)
        setProductPending(list.filter((p: { status: string }) => p.status === 'pending_review').length)
        setProductRejected(list.filter((p: { status: string }) => p.status === 'rejected').length)
      }
    } catch {
      void 0
    } finally {
      setLoading(false)
    }
  }

  const orderStats = (() => {
    const pendingConfirm = orders.filter(o => o.status === 1).length
    const pendingContract = orders.filter(o => o.status === 2).length
    const pendingPayment = orders.filter(o => o.status === 3).length
    const pendingPaymentReview = orders.filter(o => o.status === 4).length
    const pendingDelivery = orders.filter(o => o.status === 5).length
    const pendingSellerConfirm = orders.filter(o => o.status === 14).length
    const logisticsBidding = orders.filter(o => o.status === 16).length
    const pendingLogisticsRestart = orders.filter(o => o.status === 25).length
    const pendingLogisticsContract = orders.filter(o => o.status === 27).length
    const inTransit = orders.filter(o => [6, 18].includes(o.status)).length
    const completed = orders.filter(o => [8, 19, 20, 21].includes(o.status)).length
    const totalAmount = orders
      .filter(o => o.status !== 0 && o.status !== 9)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return {
      pendingConfirm,
      pendingContract,
      pendingPayment,
      pendingPaymentReview,
      pendingDelivery,
      pendingSellerConfirm,
      logisticsBidding,
      pendingLogisticsRestart,
      pendingLogisticsContract,
      inTransit,
      completed,
      totalAmount,
    }
  })()

  const todos: TodoItem[] = [
    ...(orderStats.pendingConfirm > 0 ? [{
      key: 'confirm',
      text: '待确认订单',
      description: '核对商品、数量、价格后确认订单',
      count: orderStats.pendingConfirm,
      color: '#f59e0b',
      icon: <ExclamationCircleOutlined />,
      link: '/orders',
      actionText: '处理订单',
    }] : []),
    ...(orderStats.pendingContract > 0 ? [{
      key: 'contract',
      text: '待签署合同',
      description: '完成卖家侧合同签署，推进订单支付',
      count: orderStats.pendingContract,
      color: '#6366f1',
      icon: <FileProtectOutlined />,
      link: '/orders',
      actionText: '去签署',
    }] : []),
    ...(orderStats.pendingPaymentReview > 0 ? [{
      key: 'payment-review',
      text: '待确认收款',
      description: '买家已上传凭证，确认后进入提货',
      count: orderStats.pendingPaymentReview,
      color: '#2563eb',
      icon: <ShoppingCartOutlined />,
      link: '/orders',
      actionText: '核对凭证',
    }] : []),
    ...(orderStats.pendingSellerConfirm > 0 ? [{
      key: 'seller-confirm',
      text: '待确认仓储条款',
      description: '仓储方已确认，卖方需确认交付条款',
      count: orderStats.pendingSellerConfirm,
      color: '#f97316',
      icon: <ExclamationCircleOutlined />,
      link: '/orders',
      actionText: '确认条款',
    }] : []),
    ...(orderStats.pendingDelivery > 0 ? [{
      key: 'delivery',
      text: '待提货订单',
      description: '司机到仓后核销提货码并确认出库',
      count: orderStats.pendingDelivery,
      color: '#3b82f6',
      icon: <TruckOutlined />,
      link: '/fulfillment',
      actionText: '去核销',
    }] : []),
    ...(orderStats.logisticsBidding > 0 ? [{
      key: 'logistics-bidding',
      text: '物流竞价中',
      description: '查看报价进展，必要时结束竞价并选择物流',
      count: orderStats.logisticsBidding,
      color: '#0891b2',
      icon: <RiseOutlined />,
      link: '/orders',
      actionText: '查看报价',
    }] : []),
    ...(orderStats.pendingLogisticsRestart > 0 ? [{
      key: 'logistics-restart',
      text: '待重新发起物流',
      description: '无运力反馈后重新发起物流竞价',
      count: orderStats.pendingLogisticsRestart,
      color: '#ef4444',
      icon: <TruckOutlined />,
      link: '/orders',
      actionText: '重新发起',
    }] : []),
    ...(orderStats.pendingLogisticsContract > 0 ? [{
      key: 'logistics-contract',
      text: '待签署物流合同',
      description: '确认物流合同后开放后续提货资料',
      count: orderStats.pendingLogisticsContract,
      color: '#d97706',
      icon: <FileProtectOutlined />,
      link: '/orders',
      actionText: '去签署',
    }] : []),
    ...(productPending > 0 ? [{
      key: 'product-review',
      text: '商品审核中',
      description: '关注平台审核结果，审核通过后进入买家端',
      count: productPending,
      color: '#06b6d4',
      icon: <FileProtectOutlined />,
      link: '/products',
      actionText: '查看商品',
    }] : []),
    ...(productRejected > 0 ? [{
      key: 'product-rejected',
      text: '商品被驳回',
      description: '按审核备注补充资料后重新提交',
      count: productRejected,
      color: '#ef4444',
      icon: <WarningOutlined />,
      link: '/products',
      actionText: '修改商品',
    }] : []),
  ]

  const recentOrders = orders
    .filter((order) => ![0, 8, 9].includes(order.status))
    .slice(0, 5)

  const healthItems = [
    {
      label: '商品可售',
      value: productApproved,
      hint: productCount ? `共 ${productCount} 个商品` : '暂无商品',
      status: productApproved > 0 ? '正常' : '待补充',
      color: productApproved > 0 ? 'green' : 'orange',
    },
    {
      label: '商品驳回',
      value: productRejected,
      hint: productRejected > 0 ? '需要重新提交' : '暂无驳回',
      status: productRejected > 0 ? '需处理' : '正常',
      color: productRejected > 0 ? 'red' : 'green',
    },
    {
      label: '履约中',
      value: orderStats.inTransit,
      hint: '配送中订单',
      status: orderStats.inTransit > 0 ? '跟进中' : '无',
      color: orderStats.inTransit > 0 ? 'blue' : 'default',
    },
  ]

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (v: string) => <Text className="text-sm">{v || '-'}</Text>,
    },
    {
      title: '商品',
      key: 'product',
      render: (_: unknown, record: SellerOrderInfo) => {
        const firstItem = record.items?.[0]
        return <Text className="text-sm">{firstItem?.product_name || '-'}</Text>
      },
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v: number) => v != null ? `¥${v.toLocaleString()}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const meta = orderStatusMeta[status]
        return meta ? <Tag color={meta.color}>{meta.text}</Tag> : <Tag>{status}</Tag>
      },
    },
    {
      title: '下一步',
      key: 'next',
      render: (_: unknown, record: SellerOrderInfo) => {
        const action = getSellerNextAction(record)
        return (
          <Button type="link" size="small" onClick={() => navigate(action.link)}>
            {action.text}
          </Button>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <Card className="mb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Title level={4} className="!mb-1">
              今日工作台{user?.phone ? `，${user.phone}` : ''}
            </Title>
            <Paragraph className="!mb-0 !text-gray-500">
              按待处理优先级进入商品、订单和履约页面，减少重复看数。
            </Paragraph>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products')}
            >
              发布商品
            </Button>
            <Button
              type="default"
              icon={<RiseOutlined />}
              onClick={() => navigate('/bidding')}
            >
              参与竞价
            </Button>
            <Button
              type="default"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/orders')}
            >
              处理订单
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="mb-6" title={
          <Space>
            <ExclamationCircleOutlined className="text-orange-500" />
            <span>待处理队列</span>
          </Space>
        }>
        {todos.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {todos.map((todo) => (
              <button
                key={todo.key}
                type="button"
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => navigate(todo.link)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-2xl" style={{ color: todo.color }}>{todo.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Text className="font-medium text-gray-900">{todo.text}</Text>
                      <Text className="text-2xl font-semibold text-gray-900">{todo.count}</Text>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{todo.description}</div>
                    <div className="mt-3 text-sm font-medium text-blue-600">{todo.actionText}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Alert
            type="success"
            showIcon
            message="当前没有紧急待办"
            description="可继续维护商品资料，或进入订单管理查看全部交易记录。"
          />
        )}
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card title="近期需跟进订单">
          {recentOrders.length > 0 ? (
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="middle"
              scroll={{ x: 760 }}
            />
          ) : (
            <div className="py-8 text-center text-gray-400">
              暂无需要跟进的订单
            </div>
          )}
        </Card>

        <Card title="经营状态">
          <div className="space-y-3">
            {healthItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Text className="font-medium text-gray-900">{item.label}</Text>
                    <div className="mt-1 text-sm text-gray-500">{item.hint}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                    <Tag color={item.color}>{item.status}</Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">
            <div className="text-sm font-medium text-blue-900">有效订单金额</div>
            <div className="mt-1 text-2xl font-semibold text-blue-900">¥{orderStats.totalAmount.toLocaleString()}</div>
            <div className="mt-1 text-sm text-blue-700">已完成 {orderStats.completed} 单，待支付 {orderStats.pendingPayment} 单</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
