import { Alert, Button, Card, Col, Layout, List, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  HomeOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Content, Header, Sider } = Layout
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

const zones = [
  { name: 'A 区板卷', percent: 82, status: undefined },
  { name: 'B 区型材', percent: 64, status: undefined },
  { name: '监管仓', percent: 91, status: 'active' as const },
  { name: '临时周转', percent: 38, status: undefined },
]

function App() {
  return (
    <Layout className="service-shell">
      <Sider width={232} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #edf0f5' }}>
          <Space>
            <BankOutlined style={{ color: '#16a34a' }} />
            <Text strong>SteelLink 仓储</Text>
          </Space>
        </div>
        <div style={{ padding: 16 }}>
          <List
            size="small"
            dataSource={['仓库看板', '入出库预约', '库存监管', '库位容量', '费用结算']}
            renderItem={(item, index) => (
              <List.Item style={{ border: 0, padding: '10px 12px', borderRadius: 8, background: index === 0 ? '#eaf8ee' : 'transparent' }}>
                <Text type={index === 0 ? undefined : 'secondary'}>{item}</Text>
              </List.Item>
            )}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>仓储方工作后台</Text>
          <Button icon={<HomeOutlined />} href="/">买家首页</Button>
        </Header>
        <Content className="service-content">
          <Alert
            type="success"
            showIcon
            message="前端业务原型"
            description="当前页面用于确认仓储商工作流：仓容发布、入出库预约、库位管理、库存监管、仓单资料。暂不接后端。"
            style={{ marginBottom: 16 }}
          />
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}><Card className="service-card"><Statistic title="可用仓容" value={12800} suffix="吨" prefix={<InboxOutlined />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card className="service-card"><Statistic title="今日预约" value={17} suffix="单" prefix={<CalendarOutlined />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card className="service-card"><Statistic title="监管库存" value={6800} suffix="吨" prefix={<SafetyCertificateOutlined />} /></Card></Col>
            <Col xs={24} sm={12} lg={6}><Card className="service-card"><Statistic title="作业准时率" value={98.1} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} xl={16}>
              <Card className="service-card" title="入出库预约" extra={<Button type="primary" icon={<BarcodeOutlined />}>分配库位</Button>}>
                <Table columns={columns} dataSource={appointments} pagination={false} scroll={{ x: 720 }} />
              </Card>
            </Col>
            <Col xs={24} xl={8}>
              <Card className="service-card" title="库区容量">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {zones.map((zone) => (
                    <div key={zone.name}>
                      <Text>{zone.name}</Text>
                      <Progress percent={zone.percent} status={zone.status} />
                    </div>
                  ))}
                </Space>
              </Card>
              <Card className="service-card" title="库存监管待办" style={{ marginTop: 16 }}>
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

          <Card className="service-card" style={{ marginTop: 16 }}>
            <Title level={5}>业务逻辑待确认</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              后续需要确定仓储服务是买家直接下单、卖家交付绑定，还是融资风控要求绑定监管仓；库存过户、质检、仓单和费用结算应明确状态边界。
            </Paragraph>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
