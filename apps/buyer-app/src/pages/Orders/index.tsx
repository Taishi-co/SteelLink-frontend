import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Empty, List, Row, Spin, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, InboxOutlined, TruckOutlined } from '@ant-design/icons'
import { orderService } from '@/services/orderService'

const { Title, Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '待确认', color: 'orange' },
  2: { label: '待签合同', color: 'gold' },
  3: { label: '待支付', color: 'orange' },
  4: { label: '已支付', color: 'blue' },
  5: { label: '待提货', color: 'cyan' },
  6: { label: '配送中', color: 'blue' },
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
  27: { label: '待签署物流合同', color: 'gold' },
}

function getStatusAction(order: { status: number; payment_info?: { voucher_url?: string }; delivery_info?: { pickup_code?: string } }) {
  if (order.status === 12) return '请选择目的地仓储'
  if (order.status === 13) return '等待仓储方确认仓库条件'
  if (order.status === 14) return '等待卖方确认条款'
  if (order.status === 3) return '待买家上传支付凭证或申请融资'
  if (order.status === 21) return '已归档'
  if (order.status === 22) return '资金方风控审批中'
  if (order.status === 23) return '请签署融资合同'
  if (order.status === 4) return '支付完成，等待物流'
  if (order.status === 15) return '待买方确认订单'
  if (order.status === 16) return '物流竞价中，等待卖家选择'
  if (order.status === 5) return '待提货/运输'
  if (order.status === 17) return '卖家已选择物流，等待买家确认'
  if (order.status === 24) return '请重新选择仓储方'
  if (order.status === 25) return '等待卖方重新发起物流'
  if (order.status === 26) return '请选择仓储方'
  if (order.status === 27) return '买家已确认，请签署物流合同'
  if (order.status === 7 || order.status === 6) return '待买家确认收货'
  if (order.status === 18) return '运输中，等待签收'
  if (order.status === 19) return '已收货，等待对账'
  if (order.status === 20) return '已对账，待归档'
  if (order.status === 8) return '已完成'
  if (order.status === 9) return '已取消'
  return `状态${order.status}`
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => orderService.list(),
  })

  const orders = data?.list || []
  const stats = {
    all: orders.length,
    pendingPayment: orders.filter((order) => order.status === 3).length,
    pendingDelivery: orders.filter((order) => order.status === 5).length,
    delivering: orders.filter((order) => [6, 18].includes(order.status)).length,
    completed: orders.filter((order) => [8, 19, 20, 21].includes(order.status)).length,
  }

  return (
    <div className="reco-shell py-8">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} className="rounded-full border-[#d0b991] bg-white">
          返回商品列表
        </Button>

        <div className="mt-6 rounded-[30px] border border-[#eadcc7] bg-[#fffaf1] p-7 shadow-sm">
          <Text className="text-sm font-bold uppercase tracking-[0.28em] text-[#a4662c]">Orders</Text>
          <Title level={3} className="!mb-2 !mt-2 !font-black !text-[#17221b]">我的订单</Title>
          <Text className="text-[#5f6b61]">跟进合同、支付、物流履约、签收和归档状态。</Text>
        </div>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={12} md={6}>
            <Card className="reco-card rounded-[24px]">
              <Text type="secondary">全部订单</Text>
              <Title level={3} className="!mb-0">{stats.all}</Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="reco-card rounded-[24px]">
              <Text type="secondary"><ClockCircleOutlined className="mr-1" /> 待支付</Text>
              <Title level={3} className="!mb-0 text-orange-500">{stats.pendingPayment}</Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="reco-card rounded-[24px]">
              <Text type="secondary"><InboxOutlined className="mr-1" /> 待提货</Text>
              <Title level={3} className="!mb-0 text-cyan-600">{stats.pendingDelivery}</Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="reco-card rounded-[24px]">
              <Text type="secondary"><TruckOutlined className="mr-1" /> 配送中 / 完成</Text>
              <Title level={3} className="!mb-0 text-blue-600">{stats.delivering + stats.completed}</Title>
            </Card>
          </Col>
        </Row>

        <Card className="reco-card mt-6 rounded-[30px]" title="订单列表">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" />
            </div>
          ) : orders.length === 0 ? (
            <Empty description="暂无订单" />
          ) : (
            <List
              dataSource={orders}
              renderItem={(order) => {
                const item = order.items[0]
                const status = statusMap[order.status] || { label: `状态${order.status}`, color: 'default' }
                return (
                  <List.Item
                    className="rounded-[22px] px-4 hover:bg-[#f8f0e4]"
                  >
                    <div className="w-full flex justify-between items-start gap-4">
                      <div className="cursor-pointer flex-1" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Title level={5} className="!mb-1 !text-[#17221b]">{order.order_no}</Title>
                        <Text className="block">{item?.product_name || '-'}</Text>
                        <Text type="secondary">
                          {item?.quantity || 0} 吨 · {order.seller_name}
                        </Text>
                        <div className="mt-2">
                          <Text type="secondary">当前动作：{getStatusAction(order)}</Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Tag color={status.color}>{status.label}</Tag>
                        <div className="mt-2 font-bold text-[#b45324]">¥{order.tax_total_amount.toLocaleString()}</div>
                        {order.status === 8 && (
                          <div className="mt-2 text-green-600 text-sm">
                            <CheckCircleOutlined className="mr-1" />
                            已完成
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )
              }}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
