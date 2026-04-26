import { Link } from 'react-router-dom'
import { Button, Card, Col, Progress, Row, Segmented, Space, Statistic, Tag, Typography } from 'antd'
import {
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const overviewStats = [
  { label: '进行中竞价', value: 28, suffix: '场', icon: <ClockCircleOutlined />, color: 'text-blue-600' },
  { label: '竞价成功', value: 168, suffix: '场', icon: <CheckCircleOutlined />, color: 'text-green-600' },
  { label: '总成交金额', value: 12.8, suffix: '亿', icon: <BankOutlined />, color: 'text-red-600' },
  { label: '参与企业', value: 426, suffix: '家', icon: <TeamOutlined />, color: 'text-purple-600' },
]

const moduleCards = [
  {
    title: '买家竞价',
    role: '采购方工作台',
    description: '发布采购标的、设置最高限价、邀请供应商报价，并跟踪报价排名与成交进度。',
    href: '/bidding/buyer',
    icon: <ShopOutlined />,
    color: 'blue',
    metrics: ['待发布 6', '报价中 12', '待定标 4'],
  },
  {
    title: '卖家竞价',
    role: '供应方工作台',
    description: '查看可参与标的、提交报价、管理保证金与资质文件，并跟进中标结果。',
    href: '/bidding/seller',
    icon: <UserSwitchOutlined />,
    color: 'green',
    metrics: ['可报名 18', '已报价 9', '待签约 3'],
  },
]

const hotBiddings = [
  {
    id: 'BD20260426001',
    title: '华东区域热轧卷板竞价采购',
    category: '热轧板卷',
    quantity: '3,200 吨',
    currentPrice: '¥3,860/吨',
    change: '-2.4%',
    participants: 36,
    remaining: '01:28:45',
    progress: 72,
    status: '竞价中',
  },
  {
    id: 'BD20260426002',
    title: '华南制造园区镀锌板联合竞价',
    category: '镀锌板',
    quantity: '1,850 吨',
    currentPrice: '¥4,120/吨',
    change: '-1.8%',
    participants: 24,
    remaining: '02:16:12',
    progress: 58,
    status: '竞价中',
  },
  {
    id: 'BD20260425009',
    title: '西南工程项目螺纹钢采购专场',
    category: '建材',
    quantity: '5,000 吨',
    currentPrice: '¥3,540/吨',
    change: '-3.1%',
    participants: 42,
    remaining: '00:46:30',
    progress: 88,
    status: '冲刺中',
  },
]

const successBiddings = [
  {
    id: 'BD20260424017',
    title: '江苏冷轧板卷月度补库竞价',
    buyer: '苏南装备制造集团',
    supplier: '江苏华冶金属材料有限公司',
    amount: '¥2,486万',
    saving: '节省 4.6%',
    closedAt: '今日 10:32',
  },
  {
    id: 'BD20260423011',
    title: '山东管材项目公开竞价',
    buyer: '齐鲁能源装备有限公司',
    supplier: '青岛海工钢铁供应链',
    amount: '¥1,920万',
    saving: '节省 3.8%',
    closedAt: '昨日 16:20',
  },
  {
    id: 'BD20260422008',
    title: '华北中厚板现货竞价专场',
    buyer: '京津冀基建采购联盟',
    supplier: '唐山联采钢铁贸易有限公司',
    amount: '¥3,148万',
    saving: '节省 5.2%',
    closedAt: '04-22 15:05',
  },
]

export default function BiddingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Tag color="blue" className="mb-4">
                实时竞价大厅
              </Tag>
              <Title level={1} className="!mb-3">
                竞价交易
              </Title>
              <Paragraph className="max-w-3xl text-lg text-gray-500 !mb-0">
                聚合钢材现货和项目采购竞价活动，支持买家发起竞价、卖家参与报价，并沉淀成交记录与价格走势。
              </Paragraph>
            </div>
            <Space>
              <Button type="primary" icon={<RiseOutlined />}>
                发起竞价
              </Button>
              <Button icon={<SafetyCertificateOutlined />}>资质审核</Button>
            </Space>
          </div>

          <Row gutter={[16, 16]} className="mt-8">
            {overviewStats.map((item) => (
              <Col key={item.label} xs={24} sm={12} lg={6}>
                <Card>
                  <Space align="start" className="w-full justify-between">
                    <Statistic title={item.label} value={item.value} suffix={item.suffix} precision={item.label === '总成交金额' ? 1 : 0} />
                    <span className={`text-3xl ${item.color}`}>{item.icon}</span>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-8 py-10">
        <section>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Title level={2} className="!mb-2">
                竞价工作台
              </Title>
              <Text type="secondary">按企业角色进入对应模块，处理发起、报名、报价、定标和签约任务。</Text>
            </div>
            <Segmented options={['全部模块', '买家侧', '卖家侧']} defaultValue="全部模块" />
          </div>
          <Row gutter={[20, 20]}>
            {moduleCards.map((module) => (
              <Col key={module.title} xs={24} lg={12}>
                <Card hoverable className="h-full">
                  <div className="flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <Space align="start" size="middle">
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-2xl text-primary-600">
                          {module.icon}
                        </div>
                        <div>
                          <Tag color={module.color}>{module.role}</Tag>
                          <Title level={3} className="!mb-2 !mt-2">
                            {module.title}
                          </Title>
                          <Paragraph className="text-gray-500 !mb-0">{module.description}</Paragraph>
                        </div>
                      </Space>
                    </div>
                    <Space wrap>
                      {module.metrics.map((metric) => (
                        <Tag key={metric}>{metric}</Tag>
                      ))}
                    </Space>
                    <Link to={module.href} className="mt-auto">
                      <Button type="primary" icon={<ArrowRightOutlined />}>
                        进入模块
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2">
                热门竞价
              </Title>
              <Text type="secondary">实时展示参与度高、价格变化活跃的竞价活动。</Text>
            </div>
            <Tag color="red" icon={<CrownOutlined />}>
              热度榜
            </Tag>
          </div>
          <Row gutter={[16, 16]}>
            {hotBiddings.map((item) => (
              <Col key={item.id} xs={24} lg={8}>
                <Card hoverable className="h-full">
                  <Space direction="vertical" size="middle" className="w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Text type="secondary">{item.id}</Text>
                        <Title level={4} className="!mb-1 !mt-2">
                          {item.title}
                        </Title>
                      </div>
                      <Tag color={item.status === '冲刺中' ? 'red' : 'blue'}>{item.status}</Tag>
                    </div>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Text type="secondary">品类</Text>
                        <div className="mt-1 font-semibold">{item.category}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">数量</Text>
                        <div className="mt-1 font-semibold">{item.quantity}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">当前价</Text>
                        <div className="mt-1 font-semibold text-red-500">{item.currentPrice}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">降幅</Text>
                        <div className="mt-1 font-semibold text-green-600">{item.change}</div>
                      </Col>
                    </Row>
                    <Progress percent={item.progress} showInfo={false} />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.participants} 家参与</span>
                      <span>剩余 {item.remaining}</span>
                    </div>
                    <Button block>查看竞价</Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <Title level={2} className="!mb-2">
              竞价成功
            </Title>
            <Text type="secondary">展示近期完成定标和成交确认的竞价记录。</Text>
          </div>
          <Row gutter={[16, 16]}>
            {successBiddings.map((item) => (
              <Col key={item.id} xs={24} lg={8}>
                <Card className="h-full">
                  <Space direction="vertical" size="middle" className="w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Text type="secondary">{item.id}</Text>
                        <Title level={4} className="!mb-0 !mt-2">
                          {item.title}
                        </Title>
                      </div>
                      <Tag color="green" icon={<TrophyOutlined />}>
                        成交
                      </Tag>
                    </div>
                    <div className="rounded border border-gray-100 p-4">
                      <div className="mb-2 flex justify-between gap-4">
                        <Text type="secondary">采购方</Text>
                        <Text strong>{item.buyer}</Text>
                      </div>
                      <div className="flex justify-between gap-4">
                        <Text type="secondary">中标方</Text>
                        <Text strong>{item.supplier}</Text>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <Text type="secondary">成交金额</Text>
                        <div className="mt-1 text-xl font-semibold text-red-500">{item.amount}</div>
                      </div>
                      <div className="text-right">
                        <Tag color="green">{item.saving}</Tag>
                        <div className="mt-2 text-sm text-gray-500">{item.closedAt}</div>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </main>
    </div>
  )
}
