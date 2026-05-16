import { Alert, Button, Card, Col, Empty, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CloudServerOutlined, DatabaseOutlined, InboxOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type WarehouseMovementInfo } from '@/services/serviceFulfillmentService'

const { Paragraph, Title } = Typography

const movementStatusText: Record<string, string> = {
  pending: '待作业',
  processing: '作业中',
  completed: '已完成',
  cancelled: '已取消',
}

const warehouseColumns: ColumnsType<WarehouseServiceItem> = [
  { title: '仓库名称', dataIndex: 'warehouse_name', key: 'warehouse_name' },
  { title: '区域', key: 'region', render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(' / ') || '-' },
  { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
  {
    title: '可用/总库容',
    key: 'capacity',
    render: (_, record) => `${Number(record.available_capacity || 0).toLocaleString()} / ${Number(record.capacity || 0).toLocaleString()} 吨`,
  },
  {
    title: '标签',
    key: 'tags',
    render: (_, record) => (
      <Space wrap>
        {record.pledge_supervision ? <Tag color="green">支持质押监管</Tag> : null}
        <Tag color={record.finance_certified ? 'purple' : 'default'}>
          {record.finance_certified ? '资方认证监管仓' : '普通仓'}
        </Tag>
      </Space>
    ),
  },
  { title: '价格规则', dataIndex: 'price_rule', key: 'price_rule', render: (value?: string) => value || '-' },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space>
        <Link to={`/warehouses/${record.id}`}>
          <Button size="small">查看</Button>
        </Link>
        <Link to="/service-market">
          <Button size="small" type="primary">申请使用</Button>
        </Link>
      </Space>
    ),
  },
]

const movementColumns: ColumnsType<WarehouseMovementInfo> = [
  { title: '作业单', dataIndex: 'movement_no', key: 'movement_no' },
  { title: '关联订单', dataIndex: 'order_no', key: 'order_no', render: (value: string) => value || '-' },
  { title: '商品', dataIndex: 'product_name', key: 'product_name', render: (value?: string) => value || '-' },
  { title: '捆包号', dataIndex: 'bundle_no', key: 'bundle_no', render: (value?: string) => value || '-' },
  {
    title: '作业类型',
    dataIndex: 'movement_type',
    key: 'movement_type',
    render: (value: string) => <Tag color={value === 'inbound' ? 'green' : 'blue'}>{value === 'inbound' ? '入库' : '出库'}</Tag>,
  },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (value: number) => `${Number(value || 0).toLocaleString()} 吨` },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag>{movementStatusText[value] || value}</Tag>,
  },
]

export default function WarehousePage() {
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['buyer-visible-warehouse-services'],
    queryFn: () => serviceOfferService.listWarehouses({ page: 1, page_size: 100, status: 2 }),
  })
  const { data: movementData, isLoading: movementLoading } = useQuery({
    queryKey: ['buyer-owned-warehouse-movements'],
    queryFn: () => serviceFulfillmentService.listWarehouseMovements({ page_size: 100 }),
  })

  const warehouses = warehouseData?.data.list ?? []
  const movements = movementData?.data.list ?? []
  const pendingMovements = movements.filter((item) => item.status === 'pending')
  const managedQuantity = movements.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const certifiedWarehouses = warehouses.filter((item) => item.finance_certified)

  return (
    <div className="min-w-0 space-y-4">
      <Card className="rounded-lg">
        <Space align="start">
          <CloudServerOutlined className="mt-1 text-xl text-emerald-600" />
          <div>
            <Title level={4} className="!mb-1">仓库服务/货物管理</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              买卖方可查看平台已审核仓库、申请仓储服务，并跟踪自己所属货权的入出库作业。仓库上架与库容维护仅由仓储方工作台处理。
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Alert
        showIcon
        type="info"
        message="平台仓库与自填仓库的差异"
        description="选择平台已审核仓库后，订单可进入仓储确认、入出库作业和监管仓协同；自填地址或非平台仓库只能作为线下履约地址，平台暂无法管理库容、单据和货权监控。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="可用平台仓库" value={warehouses.length} prefix={<InboxOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="资方认证监管仓" value={certifiedWarehouses.length} prefix={<SafetyCertificateOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-lg"><Statistic title="我的出入库记录" value={movements.length} suffix={`单 / ${managedQuantity.toLocaleString()} 吨`} prefix={<DatabaseOutlined />} /></Card>
        </Col>
      </Row>

      <Card
        className="rounded-lg"
        title="可用仓库"
        extra={<Link to="/service-market"><Button type="primary">申请仓储服务</Button></Link>}
      >
        <Table
          rowKey="id"
          loading={warehouseLoading}
          columns={warehouseColumns}
          dataSource={warehouses}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 980 }}
          locale={{ emptyText: <Empty description="暂无已审核仓库" /> }}
        />
      </Card>

      <Card className="rounded-lg" title={`我的货物出入库 (${pendingMovements.length} 单待处理)`}>
        <Table
          rowKey="id"
          loading={movementLoading}
          columns={movementColumns}
          dataSource={movements}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          locale={{ emptyText: <Empty description="暂无货物出入库记录" /> }}
        />
      </Card>
    </div>
  )
}
