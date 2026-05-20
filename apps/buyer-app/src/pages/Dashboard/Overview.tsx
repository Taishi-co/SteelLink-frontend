import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Row, Col, Card, Typography, Tag, Spin, Empty } from 'antd'
import {
  DollarOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import api from '@/services/api'
import { orderService, type OrderInfo } from '@/services/orderService'
import { useUserStore } from '@/stores'
import { getIdentityStatusLabel } from '@/services/certificationService'

const { Title, Text } = Typography

interface DashboardStats {
  inTransitAmount: number
  pendingPaymentCount: number
  monthlyPurchaseAmount: number
  stockQuantity: number
}

interface RecentOrder {
  id: number
  order_no: string
  status: number
  total_amount: number
  created_at: string
  product_name: string
}

interface DashboardRawStats {
  in_transit_amount?: number
  inTransitAmount?: number
  pending_payment_count?: number
  pendingPaymentCount?: number
  monthly_purchase_amount?: number
  monthlyPurchaseAmount?: number
  stock_quantity?: number
  stockQuantity?: number
}

interface RecentOrderRaw {
  id: number
  order_no: string
  status: number
  total_amount: number
  created_at: string
  product_name: string
}

interface DashboardRaw {
  stats?: DashboardRawStats
  recent_orders?: RecentOrderRaw[]
}

interface TodoOrder {
  id: number
  orderNo: string
  status: number
  amount: number
  productName: string
}

interface TodoItem {
  key: string
  title: string
  description: string
  count: number
  amount: number
  icon: ReactNode
  color: string
  actionText: string
  firstOrderId: number
  sampleOrderNo: string
}

const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'default' },
  2: { label: '待签合同', color: 'default' },
  3: { label: '待支付', color: 'warning' },
  4: { label: '已支付', color: 'processing' },
  5: { label: '待提货', color: 'blue' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'cyan' },
  8: { label: '已完成', color: 'success' },
  9: { label: '已取消', color: 'error' },
  10: { label: '已冻结', color: 'red' },
  11: { label: '异常', color: 'red' },
  12: { label: '待选择目的地仓储', color: 'purple' },
  13: { label: '待仓库确认', color: 'purple' },
  14: { label: '待卖方确认', color: 'default' },
  15: { label: '待买方确认', color: 'blue' },
  16: { label: '物流竞价中', color: 'cyan' },
  17: { label: '待确认物流', color: 'default' },
  18: { label: '运输中', color: 'processing' },
  19: { label: '已收货', color: 'success' },
  20: { label: '已对账', color: 'success' },
  21: { label: '已归档', color: 'default' },
  22: { label: '融资审批中', color: 'purple' },
  23: { label: '待签署融资合同', color: 'default' },
  24: { label: '待重新选仓', color: 'warning' },
  25: { label: '待重新发起物流', color: 'warning' },
  26: { label: '待选择仓库', color: 'purple' },
  27: { label: '待签署物流合同', color: 'gold' },
}

function formatAmount(amount: number) {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`
  }
  return `¥${amount.toLocaleString('zh-CN')}`
}

export default function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    inTransitAmount: 0,
    pendingPaymentCount: 0,
    monthlyPurchaseAmount: 0,
    stockQuantity: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [allOrders, setAllOrders] = useState<OrderInfo[]>([])

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const [dashboardRes, orderRes] = await Promise.allSettled([
        api.get<unknown, { code: number; data?: DashboardRaw }>('/users/me/dashboard'),
        orderService.list(),
      ])
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value.code === 0 && dashboardRes.value.data) {
        const raw = dashboardRes.value.data
        setStats({
          inTransitAmount: raw.stats?.in_transit_amount ?? raw.stats?.inTransitAmount ?? 0,
          pendingPaymentCount: raw.stats?.pending_payment_count ?? raw.stats?.pendingPaymentCount ?? 0,
          monthlyPurchaseAmount: raw.stats?.monthly_purchase_amount ?? raw.stats?.monthlyPurchaseAmount ?? 0,
          stockQuantity: raw.stats?.stock_quantity ?? raw.stats?.stockQuantity ?? 0,
        })
        const orders = (raw.recent_orders || []).map((o) => ({
          id: o.id,
          order_no: o.order_no,
          status: o.status,
          total_amount: o.total_amount,
          created_at: o.created_at,
          product_name: o.product_name,
        }))
        setRecentOrders(orders)
      }
      if (orderRes.status === 'fulfilled') {
        setAllOrders(orderRes.value.list || [])
      }
    } catch (error) {
      void error
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      label: '在途金额',
      value: formatAmount(stats.inTransitAmount),
      icon: <DollarOutlined />,
      accent: '#1e4fc2',
      sub: '配送中订单总额',
    },
    {
      label: '待付款',
      value: String(stats.pendingPaymentCount),
      icon: <ClockCircleOutlined />,
      accent: '#d97706',
      sub: '待支付订单数',
    },
    {
      label: '本月采购',
      value: formatAmount(stats.monthlyPurchaseAmount),
      icon: <ShoppingOutlined />,
      accent: '#059669',
      sub: '本月采购总额',
    },
    {
      label: '库存量',
      value: `${stats.stockQuantity} 吨`,
      icon: <InboxOutlined />,
      accent: '#6366f1',
      sub: '平台可购总量',
    },
  ]

  const shortcuts = [
    {
      icon: <ShoppingOutlined className="text-2xl" style={{ color: '#1e4fc2' }} />,
      title: '钢材商城',
      desc: '浏览现货资源',
      path: '/mall',
      color: '#eef3ff',
    },
    {
      icon: <SafetyCertificateOutlined className="text-2xl" style={{ color: '#059669' }} />,
      title: '实名认证',
      desc: getIdentityStatusLabel(user?.identityStatus ?? 0),
      path: '/dashboard/identity',
      color: '#f0fdf4',
    },
    {
      icon: <BankOutlined className="text-2xl" style={{ color: '#7c3aed' }} />,
      title: user?.enterpriseCode ? '企业信息' : '企业入驻',
      desc: user?.enterpriseCode ? '查看企业详情' : '加入或创建企业',
      path: '/dashboard/enterprise',
      color: '#f5f3ff',
    },
    {
      icon: <UnorderedListOutlined className="text-2xl" style={{ color: '#d97706' }} />,
      title: '全部订单',
      desc: '查看订单列表',
      path: '/dashboard/orders',
      color: '#fef3c7',
    },
  ]

  const todoSource: TodoOrder[] = allOrders.length > 0
    ? allOrders.map((order) => ({
        id: order.id,
        orderNo: order.order_no,
        status: order.status,
        amount: order.tax_total_amount || order.total_amount || 0,
        productName: order.items?.[0]?.product_name || '商品',
      }))
    : recentOrders.map((order) => ({
        id: order.id,
        orderNo: order.order_no,
        status: order.status,
        amount: order.total_amount || 0,
        productName: order.product_name || '商品',
      }))

  const todoRules = [
    {
      key: 'warehouse',
      title: '仓储选择待处理',
      description: '选择或重选收货仓，推动仓储确认',
      statuses: [12, 24, 26],
      icon: <InboxOutlined />,
      color: '#7c3aed',
      actionText: '选择仓储',
    },
    {
      key: 'buyer-confirm',
      title: '买方确认待处理',
      description: '核对卖方确认结果后继续合同与支付',
      statuses: [15],
      icon: <CheckCircleOutlined />,
      color: '#2563eb',
      actionText: '确认订单',
    },
    {
      key: 'contract',
      title: '合同签署待处理',
      description: '完成采购合同或物流合同签署',
      statuses: [2, 27],
      icon: <SafetyCertificateOutlined />,
      color: '#d97706',
      actionText: '去签署',
    },
    {
      key: 'payment',
      title: '支付/融资待处理',
      description: '上传支付凭证，或从订单申请融资',
      statuses: [3, 23],
      icon: <BankOutlined />,
      color: '#059669',
      actionText: '处理资金',
    },
    {
      key: 'logistics',
      title: '物流确认待处理',
      description: '确认物流报价、跟进运输并完成签收',
      statuses: [17, 18, 6, 7],
      icon: <ClockCircleOutlined />,
      color: '#0891b2',
      actionText: '跟进物流',
    },
  ]

  const todoItems: TodoItem[] = todoRules.flatMap((rule) => {
    const matched = todoSource.filter((order) => rule.statuses.includes(order.status))
    if (matched.length === 0) return []
    return [{
      ...rule,
      count: matched.length,
      amount: matched.reduce((sum, order) => sum + order.amount, 0),
      firstOrderId: matched[0].id,
      sampleOrderNo: matched[0].orderNo,
    }]
  })

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">工作台</Title>
        <Text className="text-gray-400">
          {user?.realName || user?.username || '用户'}，欢迎回来！
        </Text>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {kpiCards.map((card) => (
            <Col key={card.label} xs={24} sm={12} lg={6}>
              <Card
                className="rounded-xl hover:shadow-md transition-shadow"
                bodyStyle={{ padding: '20px' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <Text className="text-gray-500 text-sm">{card.label}</Text>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: card.accent + '1a', color: card.accent }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                  {card.value}
                </div>
                <Text className="text-xs text-gray-400 mt-1 block">{card.sub}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      <Card
        title={
          <div className="flex items-center justify-between">
            <span>待办聚合</span>
            <a className="text-sm flex items-center gap-1" onClick={() => navigate('/dashboard/orders')}>
              订单中心 <RightOutlined className="text-[10px]" />
            </a>
          </div>
        }
        className="rounded-xl"
      >
        {todoItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {todoItems.map((todo) => (
              <button
                key={todo.key}
                type="button"
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                onClick={() => navigate(`/dashboard/orders/${todo.firstOrderId}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-2xl" style={{ color: todo.color }}>{todo.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <Text className="font-medium text-gray-900">{todo.title}</Text>
                      <Text className="text-2xl font-semibold text-gray-900">{todo.count}</Text>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{todo.description}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <Text className="text-xs text-gray-400">样例 {todo.sampleOrderNo}</Text>
                      <Text className="text-xs font-medium text-gray-500">{formatAmount(todo.amount)}</Text>
                    </div>
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
            message="当前没有买方待办"
            description="可继续浏览资源、发起采购，或进入订单中心查看历史交易。"
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>近期订单</span>
                <a className="text-sm flex items-center gap-1" onClick={() => navigate('/dashboard/orders')}>
                  查看全部 <RightOutlined className="text-[10px]" />
                </a>
              </div>
            }
            className="rounded-xl"
          >
            {recentOrders.length === 0 ? (
              <Empty description="暂无订单" className="py-6" />
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: '未知', color: 'default' }
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text className="font-mono text-sm font-medium">{order.order_no}</Text>
                          <Tag color={statusInfo.color} className="text-[11px]">{statusInfo.label}</Tag>
                        </div>
                        <Text className="text-xs text-gray-400">{order.product_name || '商品'}</Text>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-mono font-semibold text-gray-900">
                          ¥{order.total_amount?.toLocaleString('zh-CN') || '0'}
                        </div>
                        <Text className="text-[11px] text-gray-400">{order.created_at?.slice(0, 10)}</Text>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快捷入口" className="rounded-xl h-full">
            <div className="space-y-3">
              {shortcuts.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                  style={{ background: item.color }}
                  onClick={() => navigate(item.path)}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <Text className="font-medium block">{item.title}</Text>
                    <Text className="text-xs text-gray-400">{item.desc}</Text>
                  </div>
                  <ArrowRightOutlined className="text-gray-300 text-xs" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
