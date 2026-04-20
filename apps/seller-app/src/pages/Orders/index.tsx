import { useState } from 'react'
import { Card, Table, Tag, Space, Button, Input, Select, Modal, Descriptions, message } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'

const { Search } = Input

interface Order {
  id: number
  orderNo: string
  customer: string
  products: string
  amount: number
  weight: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
  address?: string
}

const mockOrders: Order[] = [
  { id: 1, orderNo: 'SO202404200001', customer: '上海建筑公司', products: 'Q235B 热轧板卷', amount: 38500, weight: 10, status: 'pending', createdAt: '2024-04-20 10:30', address: '上海市浦东新区张江路100号' },
  { id: 2, orderNo: 'SO202404200002', customer: '江苏制造厂', products: 'SPCC 冷轧板卷', amount: 42000, weight: 10, status: 'paid', createdAt: '2024-04-20 11:15', address: '江苏省南京市江宁区科技园' },
  { id: 3, orderNo: 'SO202404200003', customer: '浙江钢构公司', products: 'Q345B 中厚板', amount: 79000, weight: 20, status: 'shipped', createdAt: '2024-04-20 14:20', address: '浙江省杭州市余杭区工业园' },
  { id: 4, orderNo: 'SO202404200004', customer: '安徽机械厂', products: 'Q235B 工字钢', amount: 19500, weight: 5, status: 'completed', createdAt: '2024-04-20 15:45', address: '安徽省合肥市高新区' },
  { id: 5, orderNo: 'SO202404200005', customer: '山东管业公司', products: 'Q195 焊管', amount: 83000, weight: 20, status: 'paid', createdAt: '2024-04-20 16:30', address: '山东省济南市历下区' },
]

const statusColors: Record<string, string> = {
  pending: 'orange',
  paid: 'blue',
  shipped: 'cyan',
  completed: 'green',
  cancelled: 'red',
}

const statusText: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending' },
  { label: '已付款', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export default function OrdersPage() {
  const [orders] = useState(mockOrders)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNo.includes(searchText) || o.customer.includes(searchText)
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleShip = (_orderId: number) => {
    message.success('已确认发货')
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    { title: '商品', dataIndex: 'products', key: 'products' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '重量', dataIndex: 'weight', key: 'weight', render: (v: number) => `${v} 吨` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{statusText[status]}</Tag>,
    },
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record)
              setIsModalOpen(true)
            }}
          >
            详情
          </Button>
          {record.status === 'paid' && (
            <Button type="link" size="small" onClick={() => handleShip(record.id)}>
              发货
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title="订单管理">
        <Space className="mb-4">
          <Search
            placeholder="搜索订单号/客户"
            allowClear
            style={{ width: 250 }}
            onSearch={setSearchText}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={statusOptions}
          />
        </Space>

        <Table
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
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单号" span={2}>{selectedOrder.orderNo}</Descriptions.Item>
            <Descriptions.Item label="客户">{selectedOrder.customer}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColors[selectedOrder.status]}>{statusText[selectedOrder.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="商品">{selectedOrder.products}</Descriptions.Item>
            <Descriptions.Item label="重量">{selectedOrder.weight} 吨</Descriptions.Item>
            <Descriptions.Item label="金额">¥{selectedOrder.amount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="下单时间">{selectedOrder.createdAt}</Descriptions.Item>
            <Descriptions.Item label="收货地址" span={2}>{selectedOrder.address}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
