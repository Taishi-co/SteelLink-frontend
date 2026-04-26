import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Tag, Spin, Empty } from 'antd'
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
} from '@ant-design/icons'
import api from '@/services/api'
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

const ORDER_STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '待确认', color: 'default' },
  2: { label: '待签合同', color: 'default' },
  3: { label: '待支付', color: 'warning' },
  4: { label: '待收款确认', color: 'processing' },
  5: { label: '待提货', color: 'blue' },
  6: { label: '配送中', color: 'processing' },
  7: { label: '已送达', color: 'cyan' },
  8: { label: '已完成', color: 'success' },
  9: { label: '已取消', color: 'error' },
  10: { label: '冻结', color: 'red' },
  11: { label: '异常', color: 'red' },
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

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.get<any, { code: number; data: any }>('/users/me/dashboard')
      if (res.code === 0 && res.data) {
        const raw = res.data
        setStats({
          inTransitAmount: raw.stats?.in_transit_amount || raw.stats?.inTransitAmount || 0,
          pendingPaymentCount: raw.stats?.pending_payment_count || raw.stats?.pendingPaymentCount || 0,
          monthlyPurchaseAmount: raw.stats?.monthly_purchase_amount || raw.stats?.monthlyPurchaseAmount || 0,
          stockQuantity: raw.stats?.stock_quantity || raw.stats?.stockQuantity || 0,
        })
        const orders = (raw.recent_orders || []).map((o: any) => ({
          id: o.id,
          order_no: o.order_no,
          status: o.status,
          total_amount: o.total_amount,
          created_at: o.created_at,
          product_name: o.product_name,
        }))
        setRecentOrders(orders)
      }
    } catch {
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
