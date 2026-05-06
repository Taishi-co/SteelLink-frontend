import { Button, Card, Col, Divider, Row, Space, Statistic, Steps, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  BankOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

interface ServiceProduct {
  key: string
  provider: string
  type: string
  region: string
  capability: string
  price: string
  leadTime: string
  tags: string[]
}

const serviceProducts: ServiceProduct[] = [
  {
    key: '1',
    provider: '华东智慧仓',
    type: '仓储监管',
    region: '上海宝山 / 太仓',
    capability: '板卷、型材、仓单监管',
    price: '6.8 元/吨/天起',
    leadTime: '2 小时确认',
    tags: ['监管仓', '可质押'],
  },
  {
    key: '2',
    provider: '苏沪钢运',
    type: '整车运输',
    region: '长三角短驳',
    capability: '13 米平板、卷钢专车',
    price: '按线路报价',
    leadTime: '4 小时派车',
    tags: ['在途轨迹', '回单结算'],
  },
  {
    key: '3',
    provider: '港口联储',
    type: '港口仓配',
    region: '宁波北仑 / 上海外高桥',
    capability: '入港、短驳、装卸',
    price: '组合计费',
    leadTime: '当日排期',
    tags: ['港口', '装卸'],
  },
]

const columns: ColumnsType<ServiceProduct> = [
  { title: '服务商', dataIndex: 'provider', key: 'provider' },
  {
    title: '服务类型',
    dataIndex: 'type',
    key: 'type',
    render: (value: string) => <Tag color={value.includes('仓') ? 'green' : 'blue'}>{value}</Tag>,
  },
  { title: '覆盖区域', dataIndex: 'region', key: 'region' },
  { title: '能力', dataIndex: 'capability', key: 'capability' },
  { title: '价格', dataIndex: 'price', key: 'price' },
  { title: '响应', dataIndex: 'leadTime', key: 'leadTime' },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: string[]) => (
      <Space wrap>
        {tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
      </Space>
    ),
  },
]

const serviceCards = [
  {
    title: '仓储服务',
    icon: <CloudServerOutlined className="text-2xl text-emerald-600" />,
    description: '查找仓库、监管仓、装卸、库内加工和仓单资料服务。',
    actions: ['预约入库', '库存监管', '仓单质押资料'],
  },
  {
    title: '物流运输',
    icon: <CarOutlined className="text-2xl text-blue-600" />,
    description: '按线路、车型、时效和回单要求匹配承运能力。',
    actions: ['整车运输', '短驳配送', '在途追踪'],
  },
  {
    title: '仓配协同',
    icon: <SwapOutlined className="text-2xl text-indigo-600" />,
    description: '把仓储、运输、货权过户和签收节点串成一个履约计划。',
    actions: ['到仓提货', '过户确认', '签收回单'],
  },
]

export default function ServiceMarketPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} lg={14}>
              <Space size="small" className="mb-4">
                <Tag color="blue">物流</Tag>
                <Tag color="green">仓储</Tag>
                <Tag color="purple">监管</Tag>
              </Space>
              <Title className="!mb-3">物流仓储服务市场</Title>
              <Paragraph className="!mb-6 !max-w-3xl !text-base !text-slate-500">
                买家在交易后可以统一选择仓库、承运线路、监管仓和仓配组合服务；服务商在独立后台承接订单、反馈节点并完成结算。
              </Paragraph>
              <Space wrap>
                <Button type="primary" size="large" icon={<FileSearchOutlined />}>发布服务需求</Button>
                <Button size="large" icon={<EnvironmentOutlined />}>按交付地找服务</Button>
              </Space>
            </Col>
            <Col xs={24} lg={10}>
              <Card className="rounded-lg border-slate-200">
                <Row gutter={[16, 16]}>
                  <Col span={12}><Statistic title="合作仓库" value={128} suffix="个" prefix={<BankOutlined />} /></Col>
                  <Col span={12}><Statistic title="承运线路" value={560} suffix="条" prefix={<CarOutlined />} /></Col>
                  <Col span={12}><Statistic title="平均响应" value={3.2} suffix="小时" prefix={<ThunderboltOutlined />} /></Col>
                  <Col span={12}><Statistic title="监管库存" value={42.6} suffix="万吨" prefix={<SafetyCertificateOutlined />} /></Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Row gutter={[16, 16]}>
          {serviceCards.map((item) => (
            <Col xs={24} md={8} key={item.title}>
              <Card className="h-full rounded-lg border-slate-200">
                <Space align="start" size="middle">
                  {item.icon}
                  <div>
                    <Title level={4} className="!mb-2">{item.title}</Title>
                    <Paragraph className="!text-slate-500">{item.description}</Paragraph>
                    <Space wrap>
                      {item.actions.map((action) => <Tag key={action}>{action}</Tag>)}
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="mt-6 rounded-lg border-slate-200" title="推荐服务商" extra={<Button type="link">查看全部</Button>}>
          <Table columns={columns} dataSource={serviceProducts} pagination={false} scroll={{ x: 900 }} />
        </Card>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} lg={14}>
            <Card className="h-full rounded-lg border-slate-200" title="买家履约流程">
              <Steps
                current={1}
                items={[
                  { title: '选择服务', description: '按交付地、仓容、线路和监管要求筛选' },
                  { title: '提交需求', description: '填写货物、数量、时间窗口和票据要求' },
                  { title: '服务商确认', description: '仓储方或物流方报价并承诺节点' },
                  { title: '履约回传', description: '入库、装车、签收、回单同步到订单' },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card className="h-full rounded-lg border-slate-200" title="为什么物流和仓储一起展示">
              <Paragraph className="!text-slate-500">
                买家关注的是订单能否按时、按质、可追溯地完成交付，不会先按组织后台拆分需求。因此买家侧先合并为履约服务市场；服务方侧再拆成物流后台和仓储后台，分别管理自己的资源、任务和结算。
              </Paragraph>
              <Divider />
              <Space>
                <CheckCircleOutlined className="text-emerald-600" />
                <Text>后续可接入交易订单、仓单质押和资金服务风控。</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  )
}
