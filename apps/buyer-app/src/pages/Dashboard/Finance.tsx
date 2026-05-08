import { Alert, Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BankOutlined, FileSearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FinanceServiceItem, serviceOfferService } from '@/services/serviceOfferService'

const { Paragraph, Text, Title } = Typography

const columns: ColumnsType<FinanceServiceItem> = [
  { title: '资金产品', dataIndex: 'name', key: 'name', width: 180 },
  { title: '类型', dataIndex: 'finance_type', key: 'finance_type', width: 120, render: (v?: string) => v || '-' },
  {
    title: '额度范围',
    key: 'amount',
    width: 170,
    render: (_, row) => `${(row.min_amount || 0).toLocaleString()} - ${(row.max_amount || 0).toLocaleString()} 元`,
  },
  {
    title: '账期/费率',
    key: 'term_rate',
    width: 140,
    render: (_, row) => `${row.term_days || 0} 天 / ${row.annual_rate || 0}%`,
  },
  { title: '手续费规则', dataIndex: 'fee_rule', key: 'fee_rule', width: 180, render: (v?: string) => v || '-' },
  {
    title: '适用场景',
    dataIndex: 'supported_scenarios',
    key: 'supported_scenarios',
    width: 180,
    render: (items?: string[]) => items?.length ? <Space wrap>{items.map((item) => <Tag key={item}>{item}</Tag>)}</Space> : '-',
  },
]

export default function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['approved-finance-services'],
    queryFn: () => serviceOfferService.listFinance({ status: 2, page_size: 100 }),
  })
  const rows = data?.data?.list ?? []

  return (
    <div className="min-w-0 space-y-4">
      <Card className="rounded-lg">
        <Space align="start">
          <BankOutlined className="text-xl text-violet-600 mt-1" />
          <div>
            <Title level={4} className="!mb-1">可申请资金服务</Title>
            <Paragraph className="!mb-0 !text-gray-500">
              这里面向买方/卖方展示平台已审核的资金产品。真正的融资申请在订单支付节点发起，资金方会在独立工作台处理审批、合同、分佣放款和货权质押。
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="rounded-lg" title="使用口径">
            <Space direction="vertical">
              <Text><FileSearchOutlined /> 买卖方只查看和申请资金服务。</Text>
              <Text><SafetyCertificateOutlined /> 资金方工作台只给已开通金融服务商能力的企业使用。</Text>
              <Text type="secondary">订单进入待支付后，可选择资金产品发起托盘垫资。</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="资金方入口"
            description="如果你的企业是资金方，请先在个人工作台申请并通过“金融服务商能力”，审核通过后侧边栏会出现“进入资金方工作台”。"
          />
          <Card className="rounded-lg" title="平台资金产品池" extra={<Link to="/dashboard/orders"><Button type="primary">从订单申请</Button></Link>}>
            <Table
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={rows}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 920 }}
              locale={{ emptyText: '暂无已审核资金产品' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
