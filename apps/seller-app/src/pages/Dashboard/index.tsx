import { Row, Col, Card, Statistic, Typography, Table, Tag } from 'antd'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const { Title } = Typography

const stats = [
  { title: '今日订单', value: 128, icon: <ShoppingCartOutlined />, color: '#3b82f6' },
  { title: '今日销售额', value: 486000, prefix: '¥', icon: <DollarOutlined />, color: '#10b981' },
  { title: '较昨日增长', value: 12.5, suffix: '%', icon: <RiseOutlined />, color: '#f59e0b' },
  { title: '本月客户', value: 45, icon: <TeamOutlined />, color: '#8b5cf6' },
]

const recentOrders = [
  { id: 1, orderNo: 'SO202404200001', customer: '上海建筑公司', amount: 38500, status: 'pending', time: '10:30' },
  { id: 2, orderNo: 'SO202404200002', customer: '江苏制造厂', amount: 42000, status: 'paid', time: '11:15' },
  { id: 3, orderNo: 'SO202404200003', customer: '浙江钢构公司', amount: 79000, status: 'shipped', time: '14:20' },
  { id: 4, orderNo: 'SO202404200004', customer: '安徽机械厂', amount: 19500, status: 'completed', time: '15:45' },
  { id: 5, orderNo: 'SO202404200005', customer: '山东管业公司', amount: 83000, status: 'paid', time: '16:30' },
]

const statusColors: Record<string, string> = {
  pending: 'orange',
  paid: 'blue',
  shipped: 'cyan',
  completed: 'green',
}

const statusText: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
}

const columns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '客户', dataIndex: 'customer', key: 'customer' },
  { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={statusColors[status]}>{statusText[status]}</Tag>,
  },
  { title: '时间', dataIndex: 'time', key: 'time' },
]

export default function DashboardPage() {
  return (
    <div>
      <Title level={4} className="!mb-6">数据概览</Title>

      <Row gutter={16} className="mb-6">
        {stats.map((stat, index) => (
          <Col key={index} span={6}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
              <div className="mt-2 text-gray-400">{stat.icon}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="近期订单">
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
