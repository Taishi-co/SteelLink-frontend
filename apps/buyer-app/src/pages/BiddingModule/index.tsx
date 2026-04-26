import { Link, useParams } from 'react-router-dom'
import { Button, Card, Col, Empty, Row, Space, Steps, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, AuditOutlined, CheckCircleOutlined, FileProtectOutlined, FormOutlined, TeamOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const moduleConfig = {
  buyer: {
    title: '买家竞价',
    role: '采购方工作台',
    description: '面向采购企业的竞价发起与定标工作台，用于管理采购需求、邀请范围、报价轮次和成交确认。',
    actions: ['新建竞价单', '邀请供应商', '设置限价', '定标确认'],
  },
  seller: {
    title: '卖家竞价',
    role: '供应方工作台',
    description: '面向供应企业的竞价参与工作台，用于查看可报名标的、提交报价、补充资质和跟踪中标结果。',
    actions: ['查看可报名', '提交报价', '上传资质', '签约确认'],
  },
} as const

const workflowSteps = [
  { title: '提交信息', icon: <FormOutlined /> },
  { title: '资质校验', icon: <AuditOutlined /> },
  { title: '企业参与', icon: <TeamOutlined /> },
  { title: '成交确认', icon: <CheckCircleOutlined /> },
  { title: '合同归档', icon: <FileProtectOutlined /> },
]

export default function BiddingModulePage() {
  const params = useParams()
  const moduleKey = params.module === 'seller' ? 'seller' : params.module === 'buyer' ? 'buyer' : null
  const currentModule = moduleKey ? moduleConfig[moduleKey] : null

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-8 py-12">
          <Card>
            <Empty description="竞价模块不存在" />
            <div className="mt-6 text-center">
              <Link to="/bidding">
                <Button type="primary">返回竞价大厅</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-8 py-10">
        <Link to="/bidding" className="mb-6 inline-flex items-center gap-2 text-primary-600">
          <ArrowLeftOutlined />
          返回竞价大厅
        </Link>

        <section className="rounded bg-white p-8">
          <Tag color={moduleKey === 'buyer' ? 'blue' : 'green'}>{currentModule.role}</Tag>
          <Title level={1} className="!mb-3 !mt-4">
            {currentModule.title}
          </Title>
          <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">{currentModule.description}</Paragraph>
        </section>

        <Row gutter={[20, 20]} className="mt-8">
          <Col xs={24} lg={16}>
            <Card title="模块流程">
              <Steps
                current={1}
                items={workflowSteps.map((step) => ({
                  title: step.title,
                  icon: step.icon,
                }))}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="可执行操作">
              <Space direction="vertical" size="middle" className="w-full">
                {currentModule.actions.map((action) => (
                  <Button key={action} block>
                    {action}
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="待办事项" className="mt-8">
          <Row gutter={[16, 16]}>
            {['待处理竞价', '待补充资料', '待确认结果'].map((item, index) => (
              <Col key={item} xs={24} md={8}>
                <div className="rounded border border-gray-100 p-4">
                  <Text type="secondary">{item}</Text>
                  <div className="mt-2 text-2xl font-semibold">{[6, 3, 2][index]}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </main>
    </div>
  )
}
