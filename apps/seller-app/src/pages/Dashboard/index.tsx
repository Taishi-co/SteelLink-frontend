import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Button, Space, Progress } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  WarningOutlined,
  FileProtectOutlined,
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
}

interface TodoItem {
  key: string
  text: string
  count: number
  color: string
  icon: React.ReactNode
  link: string
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
    const pendingPayment = orders.filter(o => o.status === 3).length
    const pendingDelivery = orders.filter(o => o.status === 5).length
    const inTransit = orders.filter(o => o.status === 6).length
    const completed = orders.filter(o => o.status === 8).length
    const totalAmount = orders
      .filter(o => o.status !== 0 && o.status !== 9)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return { pendingConfirm, pendingPayment, pendingDelivery, inTransit, completed, totalAmount }
  })()

  const todos: TodoItem[] = [
    ...(orderStats.pendingConfirm > 0 ? [{
      key: 'confirm',
      text: '待确认订单',
      count: orderStats.pendingConfirm,
      color: '#f59e0b',
      icon: <ExclamationCircleOutlined />,
      link: '/orders',
    }] : []),
    ...(orderStats.pendingDelivery > 0 ? [{
      key: 'delivery',
      text: '待提货订单',
      count: orderStats.pendingDelivery,
      color: '#3b82f6',
      icon: <ShoppingCartOutlined />,
      link: '/orders',
    }] : []),
    ...(productPending > 0 ? [{
      key: 'product-review',
      text: '商品审核中',
      count: productPending,
      color: '#06b6d4',
      icon: <FileProtectOutlined />,
      link: '/products',
    }] : []),
    ...(productRejected > 0 ? [{
      key: 'product-rejected',
      text: '商品被驳回',
      count: productRejected,
      color: '#ef4444',
      icon: <WarningOutlined />,
      link: '/products',
    }] : []),
  ]

  const recentOrders = orders.slice(0, 5)

  const orderStatusDistribution = (() => {
    if (orders.length === 0) return []
    const statusCounts: Record<number, number> = {}
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status: Number(status),
        count,
        percent: Math.round((count / orders.length) * 100),
        meta: orderStatusMeta[Number(status)],
      }))
      .sort((a, b) => b.count - a.count)
  })()

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
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 border-0 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-1 !text-white">
              欢迎回来{user?.phone ? `，${user.phone}` : ''}
            </Title>
            <Paragraph className="!mb-0 !text-blue-100">
              SteelLink 卖家工作台 — 管理商品、处理订单、追踪发货
            </Paragraph>
          </div>
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              发布商品
            </Button>
            <Button
              type="default"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/orders')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              查看订单
            </Button>
          </Space>
        </div>
      </Card>

      {todos.length > 0 && (
        <Card className="mb-6 rounded-2xl border-0" title={
          <Space>
            <ExclamationCircleOutlined className="text-orange-500" />
            <span>待处理事项</span>
          </Space>
        }>
          <Row gutter={16}>
            {todos.map(todo => (
              <Col key={todo.key} span={6}>
                <Card
                  hoverable
                  className="rounded-xl border"
                  onClick={() => navigate(todo.link)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl" style={{ color: todo.color }}>{todo.icon}</div>
                    <div>
                      <div className="text-2xl font-bold">{todo.count}</div>
                      <Text type="secondary" className="text-sm">{todo.text}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card className="rounded-xl">
            <Statistic
              title="待确认订单"
              value={orderStats.pendingConfirm}
              prefix={<ExclamationCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl">
            <Statistic
              title="待提货"
              value={orderStats.pendingDelivery}
              prefix={<ShoppingCartOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl">
            <Statistic
              title="累计成交额"
              value={orderStats.totalAmount}
              prefix="¥"
              suffix={<DollarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="rounded-xl">
            <Statistic
              title="已完成订单"
              value={orderStats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#22c55e' }} />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card title="商品概览" className="rounded-2xl border-0 h-full">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="全部商品" value={productCount} prefix={<ShopOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="已上架" value={productApproved} valueStyle={{ color: '#22c55e' }} />
              </Col>
              <Col span={8}>
                <Statistic title="审核中" value={productPending} valueStyle={{ color: '#06b6d4' }} />
              </Col>
            </Row>
            {productCount > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <Text type="secondary" className="text-xs">上架率</Text>
                  <Text type="secondary" className="text-xs">{Math.round((productApproved / productCount) * 100)}%</Text>
                </div>
                <Progress
                  percent={Math.round((productApproved / productCount) * 100)}
                  showInfo={false}
                  strokeColor="#22c55e"
                  trailColor="#f3f4f6"
                  size="small"
                />
              </div>
            )}
            {productRejected > 0 && (
              <div className="mt-3">
                <Tag color="error">{productRejected} 个商品被驳回，需修改后重新提交</Tag>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="订单状态分布" className="rounded-2xl border-0 h-full">
            {orderStatusDistribution.length > 0 ? (
              <div className="space-y-2">
                {orderStatusDistribution.slice(0, 5).map(item => (
                  <div key={item.status} className="flex items-center gap-3">
                    <Tag color={item.meta?.color} className="!w-20 text-center">{item.meta?.text || `状态${item.status}`}</Tag>
                    <Progress
                      percent={item.percent}
                      size="small"
                      showInfo={false}
                      className="flex-1"
                    />
                    <Text type="secondary" className="text-sm !w-12 text-right">{item.count} 单</Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">暂无订单数据</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="近期订单" className="rounded-2xl border-0">
        {recentOrders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <div className="text-center py-8 text-gray-400">
            暂无订单数据
          </div>
        )}
      </Card>
    </div>
  )
}
