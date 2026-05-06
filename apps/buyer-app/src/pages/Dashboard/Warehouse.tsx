import { Button, Card, Col, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
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

        <Card className="mt-4 rounded-lg">
          <Title level={5}><BankOutlined /> 业务逻辑待确认</Title>
          <Text type="secondary">后续需要明确仓储服务和订单提货、仓单质押、库存过户、质检资料之间的状态边界。</Text>
        </Card>
      </div>
    </ServicePanelGate>
  )
}
