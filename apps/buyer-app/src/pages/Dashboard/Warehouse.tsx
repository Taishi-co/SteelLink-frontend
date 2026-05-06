import { Button, Card, Col, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { serviceOfferService, type WarehouseServiceItem } from '@/services/serviceOfferService'
import { serviceFulfillmentService, type WarehouseMovementInfo, type WarehouseProductInfo } from '@/services/serviceFulfillmentService'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

interface Appointment {
  key: string
  no: string
  company: string
  cargo: string
  action: string
  slot: string
  status: string
}

const appointments: Appointment[] = [
  { key: '1', no: 'CK20260506001', company: '华东金属贸易', cargo: '热轧板卷 96 吨', action: '入库预约', slot: '10:00-12:00', status: '待确认' },
  { key: '2', no: 'CK20260506002', company: '昆山制造集团', cargo: '镀锌卷 44 吨', action: '出库提货', slot: '14:00-16:00', status: '已排库位' },
  { key: '3', no: 'CK20260506003', company: '宁波终端厂', cargo: '螺纹钢 180 吨', action: '监管盘点', slot: '明日 09:00', status: '待作业' },
]

const columns: ColumnsType<Appointment> = [
  { title: '预约单', dataIndex: 'no', key: 'no' },
  { title: '企业', dataIndex: 'company', key: 'company' },
  { title: '货物', dataIndex: 'cargo', key: 'cargo' },
  { title: '作业类型', dataIndex: 'action', key: 'action' },
  { title: '作业窗口', dataIndex: 'slot', key: 'slot' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === '待确认' ? 'orange' : value === '待作业' ? 'blue' : 'green'}>{value}</Tag>,
  },
]

const warehouseColumns: ColumnsType<WarehouseServiceItem> = [
  { title: '仓库名称', dataIndex: 'warehouse_name', key: 'warehouse_name' },
  { title: '编码', key: 'code', render: (_, record) => `WH-${String(record.id).padStart(6, '0')}` },
  { title: '运营企业', dataIndex: 'enterprise_id', key: 'enterprise_id', render: (value: number) => `企业 ${value}` },
  { title: '区域', key: 'region', render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(' / ') },
  { title: '可用/总库容', key: 'capacity', render: (_, record) => `${Number(record.available_capacity || 0).toLocaleString()} / ${Number(record.capacity || 0).toLocaleString()} 吨` },
  {
    title: '服务',
    dataIndex: 'service_types',
    key: 'service_types',
    render: (value?: string[]) => <Space wrap>{(value || []).map((item) => <Tag key={item}>{item}</Tag>)}</Space>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: number) => <Tag color={value === 2 ? 'green' : value === 1 ? 'gold' : 'default'}>{value === 2 ? '可用' : value === 1 ? '审核中' : '停用'}</Tag>,
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space>
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />}>停用</Button>
      </Space>
    ),
  },
]

const inventoryColumns: ColumnsType<WarehouseMovementInfo> = [
  { title: '记录号', dataIndex: 'movement_no', key: 'movement_no' },
  { title: '仓库ID', dataIndex: 'warehouse_service_id', key: 'warehouse_service_id' },
  { title: '商品', dataIndex: 'product_name', key: 'product_name' },
  { title: '捆包号', dataIndex: 'bundle_no', key: 'bundle_no' },
  {
    title: '类型',
    dataIndex: 'movement_type',
    key: 'movement_type',
    render: (value: string) => <Tag color={value === 'inbound' ? 'green' : 'blue'}>{value === 'inbound' ? '入库' : '出库'}</Tag>,
  },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (value: number) => `${value} 吨` },
  { title: '关联单据', dataIndex: 'order_no', key: 'order_no' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === 'completed' ? 'green' : value === 'processing' ? 'blue' : 'gold'}>{value === 'completed' ? '已完成' : value === 'processing' ? '作业中' : '待作业'}</Tag>,
  },
]

export default function WarehousePage() {
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['dashboard-warehouse-services'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 100 }),
  })
  const warehouses = warehouseData?.data.list ?? []
  const activeWarehouse = warehouses[0]
  const { data: movementData, isLoading: movementLoading } = useQuery({
    queryKey: ['dashboard-warehouse-movements'],
    queryFn: () => serviceFulfillmentService.listWarehouseMovements({ page_size: 100 }),
  })
  const movements = movementData?.data.list ?? []
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['dashboard-warehouse-products', activeWarehouse?.id],
    queryFn: () => serviceFulfillmentService.listWarehouseProducts(activeWarehouse.id),
    enabled: Boolean(activeWarehouse?.id),
  })
  const warehouseProducts = productData?.data.list ?? []
  const availableCapacity = warehouses.reduce((sum, item) => sum + Number(item.available_capacity || 0), 0)
  const managedStock = warehouseProducts.reduce((sum, item) => sum + Number(item.available_qty || 0), 0)
  const todayMovements = movements.length

  return (
    <ServicePanelGate serviceKey="warehouse">
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <Title level={4} className="!mb-1">仓储平台</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            在买家工作台内管理仓容、入出库预约、库存监管、仓单资料和费用结算，为物流与资金服务提供履约依据。
          </Paragraph>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="可用仓容" value={availableCapacity} suffix="吨" prefix={<InboxOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="出入库记录" value={todayMovements} suffix="单" prefix={<CalendarOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="监管库存" value={managedStock} suffix="吨" prefix={<SafetyCertificateOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="作业准时率" value={98.1} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={16}>
            <Card className="rounded-lg" title="入出库预约" extra={<Button type="primary" icon={<BarcodeOutlined />}>分配库位</Button>}>
              <Table columns={columns} dataSource={appointments} pagination={false} scroll={{ x: 720 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="rounded-lg" title="库区容量">
              <Space direction="vertical" className="w-full">
                <Text>A 区板卷</Text>
                <Progress percent={82} />
                <Text>B 区型材</Text>
                <Progress percent={64} />
                <Text>监管仓</Text>
                <Progress percent={91} status="active" />
                <Text>临时周转</Text>
                <Progress percent={38} />
              </Space>
            </Card>
            <Card className="mt-4 rounded-lg" title="库存监管待办">
              <List
                dataSource={[
                  { title: '仓单资料待补齐', description: '2 笔质押库存缺少最新质检报告', icon: <AuditOutlined /> },
                  { title: '货权变更确认', description: '1 笔订单完成付款后等待过户', icon: <DatabaseOutlined /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Card
          className="mt-4 rounded-lg"
          title="仓库管理"
          extra={<Button type="primary" icon={<DatabaseOutlined />}>新增仓库</Button>}
        >
          <Table loading={warehouseLoading} columns={warehouseColumns} dataSource={warehouses} rowKey="id" pagination={false} scroll={{ x: 1100 }} />
        </Card>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={15}>
            <Card className="rounded-lg" title="商品与仓库关系">
              <Table
                rowKey="bundleNo"
                pagination={false}
                scroll={{ x: 760 }}
                loading={productLoading}
                dataSource={warehouseProducts}
                columns={[
                  { title: '商品', dataIndex: 'name' },
                  { title: '捆包号', dataIndex: 'bundle_no' },
                  { title: '绑定仓库', render: (_: unknown, record: WarehouseProductInfo) => record.warehouse_info?.warehouse_name || activeWarehouse?.warehouse_name || '-' },
                  { title: '库存', dataIndex: 'available_qty', render: (value: number) => `${value} 吨` },
                  { title: '状态', render: (_: unknown, record: WarehouseProductInfo) => <Tag color={record.locked_qty > 0 ? 'gold' : 'blue'}>{record.locked_qty > 0 ? '订单锁定中' : '监管库存'}</Tag> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="rounded-lg" title="仓储履约规则">
              <Space direction="vertical" className="w-full">
                <Text><BankOutlined /> 商品绑定仓库后，买家下单自动生成提货仓库和出库待办。</Text>
                <Text><SafetyCertificateOutlined /> 出库记录、签收回单和仓单资料进入订单履约归档。</Text>
                <Text><DatabaseOutlined /> 未绑定仓库的商品，需要买家通过物流平台补充提货点。</Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card className="mt-4 rounded-lg" title="出库 / 入库记录">
          <Table loading={movementLoading} columns={inventoryColumns} dataSource={movements} rowKey="id" pagination={false} scroll={{ x: 980 }} />
        </Card>
      </div>
    </ServicePanelGate>
  )
}
