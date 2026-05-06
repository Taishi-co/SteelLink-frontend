import { Button, Card, Col, List, Row, Statistic, Steps, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  FileSearchOutlined,
  FundProjectionScreenOutlined,
  InsuranceOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import ServicePanelGate from './ServicePanelGate'

const { Title, Paragraph, Text } = Typography

interface FinanceCase {
  key: string
  no: string
  company: string
  product: string
  amount: string
  collateral: string
  status: string
  risk: string
}

const financeCases: FinanceCase[] = [
  { key: '1', no: 'JR20260506001', company: '昆山制造集团', product: '订单融资', amount: '320 万', collateral: '待收货订单', status: '风控初审', risk: '低' },
  { key: '2', no: 'JR20260506002', company: '华东金属贸易', product: '仓单质押', amount: '580 万', collateral: '监管仓库存', status: '待放款', risk: '中' },
  { key: '3', no: 'JR20260506003', company: '宁波终端厂', product: '账期额度', amount: '200 万', collateral: '历史交易', status: '贷后跟踪', risk: '低' },
]

const columns: ColumnsType<FinanceCase> = [
  { title: '申请编号', dataIndex: 'no', key: 'no' },
  { title: '企业', dataIndex: 'company', key: 'company' },
  { title: '产品', dataIndex: 'product', key: 'product' },
  { title: '申请金额', dataIndex: 'amount', key: 'amount' },
  { title: '融资依据', dataIndex: 'collateral', key: 'collateral' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => <Tag color={value === '待放款' ? 'green' : value === '风控初审' ? 'blue' : 'purple'}>{value}</Tag>,
  },
  {
    title: '风险',
    dataIndex: 'risk',
    key: 'risk',
    render: (value: string) => <Tag color={value === '中' ? 'gold' : 'success'}>{value}</Tag>,
  },
]

export default function FinancePage() {
  return (
    <ServicePanelGate serviceKey="finance">
      <div className="min-w-0">
        <Card className="mb-6 rounded-lg">
          <Title level={4} className="!mb-1">资金服务平台</Title>
          <Paragraph className="!mb-0 !text-gray-500">
            将融资申请、授信、风控、放款和贷后预警放在买家工作台内，后续可接订单、仓单、物流签收和企业认证数据。
          </Paragraph>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="待审申请" value={12} suffix="笔" prefix={<FileSearchOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="授信余额" value={2860} suffix="万" prefix={<BankOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="今日放款" value={760} suffix="万" prefix={<CheckCircleOutlined />} /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="rounded-lg"><Statistic title="预警案件" value={3} suffix="笔" prefix={<SafetyCertificateOutlined />} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} xl={16}>
            <Card className="rounded-lg" title="融资申请池" extra={<Button type="primary" icon={<AuditOutlined />}>进入风控</Button>}>
              <Table columns={columns} dataSource={financeCases} pagination={false} scroll={{ x: 820 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card className="rounded-lg" title="标准审核流">
              <Steps
                direction="vertical"
                current={1}
                items={[
                  { title: '资料校验', description: '企业认证、合同、订单、仓单' },
                  { title: '风控评估', description: '交易真实性、库存监管、授信占用' },
                  { title: '放款确认', description: '合同签署、资金划拨、费用确认' },
                  { title: '贷后监控', description: '回款、库存、履约状态预警' },
                ]}
              />
            </Card>
            <Card className="mt-4 rounded-lg" title="产品线">
              <List
                dataSource={[
                  { title: '订单融资', description: '基于采购订单与付款节点', icon: <FundProjectionScreenOutlined /> },
                  { title: '仓单质押', description: '基于监管仓库存和货权控制', icon: <InsuranceOutlined /> },
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
          <Title level={5}><DollarCircleOutlined /> 业务逻辑待确认</Title>
          <Text type="secondary">资金服务可先作为买家工作台服务能力，后续如果资金方也要独立运营账号，再扩展资金方后台角色与菜单。</Text>
        </Card>
      </div>
    </ServicePanelGate>
  )
}
