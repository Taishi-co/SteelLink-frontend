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
import { inventoryMovements, registeredWarehouses, type InventoryMovement, type RegisteredWarehouse } from '@steellink/shared/serviceFulfillment'
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

const warehouseColumns: ColumnsType<RegisteredWarehouse> = [
  { title: '仓库名称', dataIndex: 'name', key: 'name' },
  { title: '编码', dataIndex: 'code', key: 'code' },
  { title: '运营方', dataIndex: 'operator', key: 'operator' },
  { title: '区域', key: 'region', render: (_, record) => [record.province, record.city, record.district].filter(Boolean).join(' / ') },
  { title: '可用/总库容', key: 'capacity', render: (_, record) => `${record.availableCapacity.toLocaleString()} / ${record.capacity.toLocaleString()} 吨` },
  {
    title: '服务',
    dataIndex: 'serviceTypes',
    key: 'serviceTypes',
    render: (value: string[]) => <Space wrap>{value.map((item) => <Tag key={item}>{item}</Tag>)}</Space>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: RegisteredWarehouse['status']) => <Tag color={value === 'active' ? 'green' : value === 'reviewing' ? 'gold' : 'default'}>{value === 'active' ? '可用' : value === 'reviewing' ? '审核中' : '停用'}</Tag>,
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

const inventoryColumns: ColumnsType<InventoryMovement> = [
  { title: '记录号', dataIndex: 'id', key: 'id' },
  { title: '仓库', dataIndex: 'warehouseCode', key: 'warehouseCode' },
  { title: '商品', dataIndex: 'productName', key: 'productName' },
  { title: '捆包号', dataIndex: 'bundleNo', key: 'bundleNo' },
  {
    title: '类型',
    dataIndex: 'movementType',
    key: 'movementType',
    render: (value: InventoryMovement['movementType']) => <Tag color={value === 'inbound' ? 'green' : 'blue'}>{value === 'inbound' ? '入库' : '出库'}</Tag>,
  },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (value: number) => `${value} 吨` },
  { title: '关联单据', dataIndex: 'orderNo', key: 'orderNo' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: InventoryMovement['status']) => <Tag color={value === 'completed' ? 'green' : value === 'processing' ? 'blue' : 'gold'}>{value === 'completed' ? '已完成' : value === 'processing' ? '作业中' : '待作业'}</Tag>,
  },
]

export default function WarehousePage() {
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
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="可用仓容" value={12800} suffix="吨" prefix={<InboxOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="今日预约" value={17} suffix="单" prefix={<CalendarOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="监管库存" value={6800} suffix="吨" prefix={<SafetyCertificateOutlined />} /></Card></Col>
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
          <Table columns={warehouseColumns} dataSource={registeredWarehouses} rowKey="id" pagination={false} scroll={{ x: 1100 }} />
        </Card>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={15}>
            <Card className="rounded-lg" title="商品与仓库关系">
              <Table
                rowKey="bundleNo"
                pagination={false}
                scroll={{ x: 760 }}
                dataSource={[
                  { productName: '热轧板卷 SPHC', bundleNo: 'HB-2026-0420-0001', warehouse: '唐山仓库A区', stock: 96, lockStatus: '订单锁定中' },
                  { productName: '镀锌卷 DX51D', bundleNo: 'DX-2026-0501-0008', warehouse: '唐山仓库A区', stock: 44, lockStatus: '待出库' },
                  { productName: '螺纹钢 HRB400E', bundleNo: 'HRB-2026-0502-0012', warehouse: '上海宝山监管仓', stock: 180, lockStatus: '监管库存' },
                ]}
                columns={[
                  { title: '商品', dataIndex: 'productName' },
                  { title: '捆包号', dataIndex: 'bundleNo' },
                  { title: '绑定仓库', dataIndex: 'warehouse' },
                  { title: '库存', dataIndex: 'stock', render: (value: number) => `${value} 吨` },
                  { title: '状态', dataIndex: 'lockStatus', render: (value: string) => <Tag color={value.includes('锁定') ? 'gold' : 'blue'}>{value}</Tag> },
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
          <Table columns={inventoryColumns} dataSource={inventoryMovements} rowKey="id" pagination={false} scroll={{ x: 980 }} />
        </Card>
      </div>
    </ServicePanelGate>
  )
}
