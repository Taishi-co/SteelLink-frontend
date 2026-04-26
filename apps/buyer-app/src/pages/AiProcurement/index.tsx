import { Button, Card, Col, Input, Progress, Row, Space, Steps, Tag, Timeline, Typography } from 'antd'
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  MessageOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const procurementPrompt = '帮我采购100套工业轴承，用于设备维修，需要申请订单融资'

const workflowSteps = [
  {
    title: '指令解析',
    description: '识别采购品类、数量、用途、融资诉求和交付约束',
    icon: <MessageOutlined />,
  },
  {
    title: '商品匹配',
    description: '匹配现货商品、可替代型号、供应商能力和价格区间',
    icon: <FileSearchOutlined />,
  },
  {
    title: '订单生成',
    description: '生成采购清单、交付计划、合同要素和付款节点',
    icon: <ShoppingCartOutlined />,
  },
  {
    title: '融资匹配',
    description: '按订单金额、企业资质和账期匹配订单融资方案',
    icon: <BankOutlined />,
  },
  {
    title: '审核提交',
    description: '汇总采购订单、融资申请和风控材料提交审核',
    icon: <AuditOutlined />,
  },
]

const parsedFields = [
  { label: '采购物品', value: '工业轴承' },
  { label: '采购数量', value: '100 套' },
  { label: '业务用途', value: '设备维修' },
  { label: '金融需求', value: '订单融资' },
]

const matchedProducts = [
  { name: 'SKF 深沟球轴承 6208-2RS', supplier: '华东工业备件供应商', price: '¥128 / 套', match: 96 },
  { name: 'NSK 工业轴承 6208DDU', supplier: '上海机械配件中心', price: '¥136 / 套', match: 91 },
  { name: '国产高精度轴承 6208', supplier: '江苏轴承直供仓', price: '¥86 / 套', match: 84 },
]

const orderSummary = [
  { label: '推荐订单金额', value: '¥12,800' },
  { label: '预计交付', value: '3-5 个工作日' },
  { label: '供应商', value: '华东工业备件供应商' },
  { label: '账期建议', value: '30 天' },
]

const financePlans = [
  { title: '订单融资快审', amount: '最高 ¥10,000', rate: '年化 6.8%', status: '推荐' },
  { title: '采购账期融资', amount: '最高 ¥12,000', rate: '年化 7.2%', status: '备选' },
  { title: '企业信用额度', amount: '最高 ¥30,000', rate: '按授信评估', status: '需补资料' },
]

const auditItems = [
  '采购需求解析结果已生成',
  '商品匹配与报价已锁定',
  '订单草稿与融资方案已关联',
  '企业资质与付款资料待提交',
]

export default function AiProcurementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Title level={1} className="!mb-3">AI采购</Title>
              <Paragraph className="text-gray-500 text-lg !mb-0">
                用自然语言描述采购目标，系统自动完成需求解析、商品匹配、订单生成、融资匹配与审核提交。
              </Paragraph>
            </div>
            <Button type="primary" icon={<RobotOutlined />}>发起 AI 采购</Button>
          </div>

          <Card className="mt-8">
            <Text strong>采购对话</Text>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <TextArea value={procurementPrompt} autoSize={{ minRows: 3, maxRows: 4 }} />
              <Button type="primary" size="large" icon={<MessageOutlined />} className="h-full min-h-[96px]">
                解析采购指令
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <section>
          <Title level={2} className="!mb-5">采购流程可视化</Title>
          <Card>
            <Steps
              current={4}
              items={workflowSteps.map((item) => ({
                title: item.title,
                description: item.description,
                icon: item.icon,
              }))}
            />
          </Card>
        </section>

        <section className="mt-10">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={8}>
              <Card title="1. 指令解析" className="h-full">
                <Space direction="vertical" size="middle" className="w-full">
                  {parsedFields.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded border border-gray-100 p-3">
                      <Text type="secondary">{item.label}</Text>
                      <Text strong>{item.value}</Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card title="2. 商品匹配" className="h-full">
                <Space direction="vertical" size="middle" className="w-full">
                  {matchedProducts.map((item) => (
                    <div key={item.name} className="grid gap-4 rounded border border-gray-100 p-4 md:grid-cols-[1fr_140px_96px] md:items-center">
                      <div>
                        <Text strong>{item.name}</Text>
                        <div className="mt-1 text-sm text-gray-500">{item.supplier}</div>
                      </div>
                      <Text strong>{item.price}</Text>
                      <Progress percent={item.match} size="small" />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="mt-10">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="3. 订单生成" className="h-full">
                <Row gutter={[16, 16]}>
                  {orderSummary.map((item) => (
                    <Col xs={24} sm={12} key={item.label}>
                      <div className="rounded bg-gray-50 p-4">
                        <Text type="secondary">{item.label}</Text>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{item.value}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
                <Button type="primary" block className="mt-5">生成订单草稿</Button>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="4. 融资匹配" className="h-full">
                <Space direction="vertical" size="middle" className="w-full">
                  {financePlans.map((item) => (
                    <div key={item.title} className="flex items-center justify-between gap-4 rounded border border-gray-100 p-4">
                      <div>
                        <Text strong>{item.title}</Text>
                        <div className="mt-1 text-sm text-gray-500">{item.amount} · {item.rate}</div>
                      </div>
                      <Tag color={item.status === '推荐' ? 'blue' : 'default'}>{item.status}</Tag>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="mt-10">
          <Card title="5. 审核提交">
            <Timeline
              items={auditItems.map((item) => ({
                color: 'green',
                dot: <CheckCircleOutlined />,
                children: item,
              }))}
            />
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Text type="secondary">提交前会合并订单、融资与企业资料，由业务和风控共同审核。</Text>
              <Button type="primary" icon={<AuditOutlined />}>提交审核</Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
