import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { sellerOrderService, type SellerOrderInfo } from '@/services/orderService'

const { Title, Text } = Typography

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
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<SellerOrderInfo[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const list = await sellerOrderService.list()
      setOrders(list || [])
    } catch {
      void 0
    } finally {
      setLoading(false)
    }
  }

  const stats = (() => {
    const pendingPayment = orders.filter(o => o.status === 3).length
    const pendingDelivery = orders.filter(o => o.status === 5).length
    const inTransit = orders.filter(o => o.status === 6).length
    const completed = orders.filter(o => o.status === 8).length
    const totalAmount = orders
      .filter(o => o.status !== 0 && o.status !== 9)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return { pendingPayment, pendingDelivery, inTransit, completed, totalAmount }
  })()

  const recentOrders = orders.slice(0, 5)

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
        const meta = statusMeta[status]
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
      <Title level={4} className="!mb-6">数据概览</Title>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="待付款订单"
              value={stats.pendingPayment}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待提货"
              value={stats.pendingDelivery}
              prefix={<ShoppingCartOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="配送中"
              value={stats.inTransit}
              prefix={<ShopOutlined style={{ color: '#06b6d4' }} />}
              valueStyle={{ color: '#06b6d4' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计成交额"
              value={stats.totalAmount}
              prefix="¥"
              suffix={<DollarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#22c55e' }} />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="近期订单">
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
