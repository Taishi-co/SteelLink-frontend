import { Button, Card, Col, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertOutlined,
  AuditOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { logisticsCarriers, registeredWarehouses, type LogisticsCarrier } from '@steellink/shared/serviceFulfillment'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

interface Shipment {
  key: string
  orderNo: string
  route: string
  cargo: string
  weight: string
  status: string
  eta: string
  risk: string
}

const shipments: Shipment[] = [
  { key: '1', orderNo: 'WL20260506001', route: '上海宝山 -> 苏州昆山', cargo: '热轧板卷', weight: '128 吨', status: '待派车', eta: '今日 16:00', risk: '低' },
  { key: '2', orderNo: 'WL20260506002', route: '无锡惠山 -> 宁波北仑', cargo: '冷轧卷', weight: '86 吨', status: '在途', eta: '明日 10:30', risk: '中' },
  { key: '3', orderNo: 'WL20260506003', route: '唐山丰润 -> 天津港', cargo: '螺纹钢', weight: '210 吨', status: '待签收', eta: '今日 19:20', risk: '低' },
]

const columns: ColumnsType<Shipment> = [
  { title: '委托单', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '线路', dataIndex: 'route', key: 'route' },
  { title: '货物', dataIndex: 'cargo', key: 'cargo' },
  { title: '重量', dataIndex: 'weight', key: 'weight' },
  { title: '预计到达', dataIndex: 'eta', key: 'eta' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === '在途' ? 'blue' : value === '待签收' ? 'green' : 'orange'}>{value}</Tag>,
  },
  {
    title: '风险',
    dataIndex: 'risk',
    key: 'risk',
    render: (value: string) => <Tag color={value === '中' ? 'gold' : 'success'}>{value}</Tag>,
  },
]

const carrierColumns: ColumnsType<LogisticsCarrier> = [
  { title: '物流商', dataIndex: 'name', key: 'name' },
  { title: '起始地', dataIndex: 'routeStart', key: 'routeStart' },
  { title: '目的地', dataIndex: 'routeEnd', key: 'routeEnd' },
  { title: '车型', dataIndex: 'vehicleType', key: 'vehicleType' },
  { title: '载重', dataIndex: 'loadCapacity', key: 'loadCapacity', render: (value: number) => `${value} 吨` },
  { title: '估价', dataIndex: 'pricePerTon', key: 'pricePerTon', render: (value: number) => `¥${value}/吨` },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: LogisticsCarrier['status']) => <Tag color={value === 'available' ? 'green' : value === 'assigned' ? 'blue' : 'gold'}>{value === 'available' ? '可接单' : value === 'assigned' ? '已承运' : '审核中'}</Tag>,
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space>
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />}>下线</Button>
      </Space>
    ),
  },
]

export default function LogisticsPage() {
  return (
    <ServicePanelGate serviceKey="logistics">
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <Title level={4} className="!mb-1">物流平台</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            在买家工作台内承接物流服务：运输委托、派车、在途跟踪、异常处理、签收回单和费用结算。
          </Paragraph>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="今日承运委托" value={26} suffix="单" prefix={<NodeIndexOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="在途车辆" value={18} suffix="辆" prefix={<CarOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="准点率" value={96.4} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="待结算金额" value={42.8} suffix="万" prefix={<ClockCircleOutlined />} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={15}>
            <Card
              className="rounded-lg"
              title="物流商管理"
              extra={<Button type="primary" icon={<CarOutlined />}>新增物流商</Button>}
            >
              <Table columns={carrierColumns} dataSource={logisticsCarriers} rowKey="id" pagination={false} scroll={{ x: 1080 }} />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card className="rounded-lg" title="订单价格估算">
              <Space direction="vertical" className="w-full">
                {[
                  { route: '唐山仓库A区 -> 苏州昆山', weight: 100, carrier: logisticsCarriers[0] },
                  { route: '上海宝山监管仓 -> 宁波北仑', weight: 86, carrier: logisticsCarriers[1] },
                  { route: '未绑定仓库商品 -> 买家指定提货点', weight: 60, carrier: logisticsCarriers[2] },
                ].map((estimate) => (
                  <div key={estimate.route} className="rounded-lg border border-gray-100 p-3">
                    <div className="font-medium text-gray-900">{estimate.route}</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {estimate.weight} 吨 · {estimate.carrier.name} · ¥{(estimate.weight * estimate.carrier.pricePerTon).toLocaleString()}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={16}>
            <Card className="rounded-lg" title="运输委托池" extra={<Button type="primary" icon={<CarOutlined />}>智能派车</Button>}>
              <Table columns={columns} dataSource={shipments} pagination={false} scroll={{ x: 760 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="rounded-lg" title="待办优先级">
              <List
                dataSource={[
                  { title: '待派车委托', description: '3 单需要确认承运车辆与司机资质', icon: <CarOutlined /> },
                  { title: '在途异常', description: '1 单偏离计划到达时间，需要联系司机', icon: <AlertOutlined /> },
                  { title: '回单确认', description: '5 单已上传磅单，等待客服核对', icon: <FileDoneOutlined /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta avatar={item.icon} title={item.title} description={item.description} />
                  </List.Item>
                )}
              />
            </Card>
            <Card className="mt-4 rounded-lg" title="线路履约健康度">
              <Space direction="vertical" className="w-full">
                <Text>华东短驳</Text>
                <Progress percent={94} />
                <Text>港口干线</Text>
                <Progress percent={88} status="active" />
                <Text>跨省长途</Text>
                <Progress percent={76} status="exception" />
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={14}>
            <Card className="rounded-lg" title="客户发单 / 物流接单">
              <Table
                rowKey="orderNo"
                pagination={false}
                scroll={{ x: 860 }}
                dataSource={[
                  { orderNo: 'FW20260506001', customer: '华东金属贸易', pickup: registeredWarehouses[0].name, destination: '苏州昆山项目地', carrier: '待物流商接单', status: '发单中' },
                  { orderNo: 'FW20260506002', customer: '昆山制造集团', pickup: registeredWarehouses[1].name, destination: '宁波北仑工厂', carrier: '河北货运集团', status: '已接单' },
                  { orderNo: 'FW20260506003', customer: '宁波终端厂', pickup: '买家指定提货点', destination: '天津港', carrier: '全国钢铁配送', status: '履约中' },
                ]}
                columns={[
                  { title: '服务单', dataIndex: 'orderNo' },
                  { title: '客户', dataIndex: 'customer' },
                  { title: '提货点', dataIndex: 'pickup' },
                  { title: '目的地', dataIndex: 'destination' },
                  { title: '承运方', dataIndex: 'carrier' },
                  { title: '状态', dataIndex: 'status', render: (value: string) => <Tag color={value === '发单中' ? 'gold' : value === '已接单' ? 'blue' : 'green'}>{value}</Tag> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card className="rounded-lg" title="履约保障">
              <List
                dataSource={[
                  { title: '保证金覆盖', description: '已接入物流商需保留履约保证金和承运险证明', icon: <SafetyCertificateOutlined /> },
                  { title: '轨迹回传', description: '发车、到仓、离仓、到货、签收节点均需回传', icon: <EnvironmentOutlined /> },
                  { title: '异常仲裁', description: '货损、延期、拒收进入平台保障工单并关联订单', icon: <AuditOutlined /> },
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
      </div>
    </ServicePanelGate>
  )
}
