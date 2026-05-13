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
  if (order.status === 12) return '等待仓储方确认仓库条件'
  if (order.status === 13) return '等待卖方确认条款'
  if (order.status === 14) return '等待买方确认订单'
  if (order.status === 3) return '待买家上传支付凭证或申请融资'
  if (order.status === 21) return '资金方风控审批中'
  if (order.status === 22) return '请签署融资合同'
  if (order.status === 4) return '支付完成，等待物流'
  if (order.status === 15) return '待买方确认订单'
  if (order.status === 16) return '物流竞价中，等待卖家选择'
  if (order.status === 5) return '待提货/运输'
  if (order.status === 17) return '卖家已选择物流，等待买家确认'
  if (order.status === 27) return '买家已确认，请签署物流合同'
  if (order.status === 7 || order.status === 6) return '待买家确认收货'
  if (order.status === 18) return '已收货，等待对账'
  if (order.status === 8 || order.status === 19 || order.status === 20) return '已完成'
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
    delivering: orders.filter((order) => order.status === 6).length,
    completed: orders.filter((order) => order.status === 8).length,
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
          返回商品列表
        </Button>

        <Row gutter={16} className="mt-6">
          <Col span={6}>
            <Card>
              <Text type="secondary">全部订单</Text>
              <Title level={3} className="!mb-0">{stats.all}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Text type="secondary"><ClockCircleOutlined className="mr-1" /> 待支付</Text>
              <Title level={3} className="!mb-0 text-orange-500">{stats.pendingPayment}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Text type="secondary"><InboxOutlined className="mr-1" /> 待提货</Text>
              <Title level={3} className="!mb-0 text-cyan-600">{stats.pendingDelivery}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Text type="secondary"><TruckOutlined className="mr-1" /> 配送中 / 完成</Text>
              <Title level={3} className="!mb-0 text-blue-600">{stats.delivering + stats.completed}</Title>
            </Card>
          </Col>
        </Row>

        <Card className="mt-6" title="我的订单">
          {isLoading ? (
            <div className="py-16 flex justify-center">
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
                    className="hover:bg-gray-50 px-4 rounded"
                  >
                    <div className="w-full flex justify-between items-start gap-4">
                      <div className="cursor-pointer flex-1" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Title level={5} className="!mb-1">{order.order_no}</Title>
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
                        <div className="mt-2 font-bold text-red-600">¥{order.tax_total_amount.toLocaleString()}</div>
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
