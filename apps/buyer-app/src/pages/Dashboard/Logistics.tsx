import { Button, Card, Col, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
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

        <Card className="mt-4 rounded-lg">
          <Title level={5}><EnvironmentOutlined /> 业务逻辑待确认</Title>
          <Text type="secondary">后续需要明确买家下物流委托、平台派单、物流商报价和司机轨迹回传之间的状态流转。</Text>
        </Card>
      </div>
    </ServicePanelGate>
  )
}
