import { Link } from 'react-router-dom'
import { Button, Card, Col, Divider, Row, Space, Tag, Typography } from 'antd'
import {
  BankOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const sellerEntryHref = '/dashboard/enterprise'

const platformMetrics = [
  { value: '5000+', label: '入驻商家' },
  { value: '10万+', label: '现货SKU' },
  { value: '50亿+', label: '累计交易额' },
  { value: '30+', label: '重点服务城市' },
]

const serviceHighlights = [
  {
    icon: <ShopOutlined className="text-3xl text-primary-500" />,
    title: '交易平台',
    description: '覆盖现货商城、供求信息、竞价交易和集采大厅，帮助买卖双方快速完成钢材交易。',
  },
  {
    icon: <ThunderboltOutlined className="text-3xl text-primary-500" />,
    title: 'AI采购',
    description: '通过自然语言采购助手完成需求解析、商品匹配、订单生成、融资匹配和审核提交。',
  },
  {
    icon: <BankOutlined className="text-3xl text-primary-500" />,
    title: '金融服务',
    description: '围绕订单融资、仓单质押和履约信用，连接平台交易与供应链金融能力。',
  },
  {
    icon: <SafetyCertificateOutlined className="text-3xl text-primary-500" />,
    title: '履约保障',
    description: '结合企业认证、商品审核、物流仓储服务商接入，提升交易透明度和履约确定性。',
  },
]

const newsItems = [
  {
    date: '2026-04-26',
    tag: '产品更新',
    title: 'RecoLink 上线 AI采购工作流',
    summary: '买家可通过对话描述采购需求，平台自动完成指令解析、商品匹配、订单草稿和融资方案推荐。',
  },
  {
    date: '2026-04-25',
    tag: '平台能力',
    title: '供求信息模块升级为供需撮合入口',
    summary: '平台整合供应、求购、仓储、物流信息，帮助企业发布线索并获得更直接的撮合推荐。',
  },
  {
    date: '2026-04-24',
    tag: '服务生态',
    title: '仓储与物流服务商接入规范完成首版',
    summary: '围绕仓单、提货、配送和签收节点，平台持续补齐交易后履约服务能力。',
  },
]

const contactItems = [
  { icon: <PhoneOutlined />, label: '客服热线', value: '400-888-8888' },
  { icon: <MailOutlined />, label: '商务合作', value: 'contact@recolink.com' },
  { icon: <CustomerServiceOutlined />, label: '服务时间', value: '工作日 9:00-18:00' },
  { icon: <EnvironmentOutlined />, label: '服务范围', value: '全国主要钢铁产业集群' },
]

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-[1.1fr_0.9fr] gap-12 px-8 py-16">
          <div className="flex flex-col justify-center">
            <Tag color="blue" className="mb-5 w-fit px-3 py-1 text-sm">
              平台介绍
            </Tag>
            <Title className="!mb-5 !text-5xl !leading-tight">RecoLink 钢铁供应链数字交易平台</Title>
            <Paragraph className="!mb-8 text-lg !leading-8 text-gray-600">
              RecoLink 面向钢材采购、销售、仓储、物流和金融协同场景，提供现货交易、供求信息、AI采购、
              竞价交易、集采大厅和供应链金融服务，帮助企业把采购线索、交易订单与履约服务连接成完整闭环。
            </Paragraph>
            <Space size="middle">
              <Link to="/mall">
                <Button type="primary" size="large">
                  进入现货商城
                </Button>
              </Link>
              <Link to="/ai-procurement">
                <Button size="large">体验AI采购</Button>
              </Link>
            </Space>
          </div>
          <div className="overflow-hidden rounded-lg bg-slate-900 shadow-xl">
            <div className="relative h-full min-h-[360px] p-8 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.35),transparent_32%),linear-gradient(135deg,#0f172a_0%,#1e3a8a_45%,#111827_100%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <Text className="text-white/70">RecoLink Operating Network</Text>
                  <Title level={2} className="!mt-3 !text-white">
                    交易、金融、履约一体化
                  </Title>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {platformMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-white/15 bg-white/10 p-5">
                      <div className="text-3xl font-bold">{metric.value}</div>
                      <div className="mt-1 text-sm text-white/70">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-10">
          <Title level={2}>平台简介</Title>
          <Paragraph className="max-w-4xl text-base !leading-8 text-gray-600">
            平台以企业认证和商品审核为基础，以现货商城和供求信息为流量入口，以竞价、集采和AI采购提升采购效率，
            并通过仓储物流服务商和金融服务能力完善交易履约。RecoLink 的目标不是只做信息展示，而是让买家能更快找到货、
            卖家能更稳定获客、平台能围绕真实订单沉淀信用与风控数据。
          </Paragraph>
        </div>
        <Row gutter={[24, 24]}>
          {serviceHighlights.map((item) => (
            <Col key={item.title} span={6}>
              <Card className="h-full" bordered={false}>
                <div className="mb-4">{item.icon}</div>
                <Title level={4}>{item.title}</Title>
                <Paragraph className="!mb-0 text-gray-500">{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <Title level={2}>最新新闻</Title>
              <Paragraph className="!mb-0 text-gray-500">关注平台能力、服务生态和交易流程的最新进展。</Paragraph>
            </div>
            <Link to="/matching" className="text-primary-600">
              查看供求信息
            </Link>
          </div>
          <Row gutter={[24, 24]}>
            {newsItems.map((item) => (
              <Col key={item.title} span={8}>
                <Card className="h-full" hoverable>
                  <Space className="mb-4" size="small">
                    <Tag color="geekblue">{item.tag}</Tag>
                    <Text type="secondary">{item.date}</Text>
                  </Space>
                  <Title level={4}>{item.title}</Title>
                  <Paragraph className="!mb-0 text-gray-500">{item.summary}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-8 py-16">
        <Row gutter={32}>
          <Col span={10}>
            <Title level={2}>联系我们</Title>
            <Paragraph className="text-base !leading-8 text-gray-600">
              如果你需要采购协助、企业入驻、服务商合作或供应链金融对接，可以通过以下方式联系平台团队。
            </Paragraph>
            <Space size="middle">
              <Link to="/login">
                <Button type="primary">登录咨询</Button>
              </Link>
              <a href={sellerEntryHref}>
                <Button>企业入驻</Button>
              </a>
            </Space>
          </Col>
          <Col span={14}>
            <Card bordered={false}>
              <Row gutter={[24, 24]}>
                {contactItems.map((item) => (
                  <Col key={item.label} span={12}>
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-50 text-lg text-primary-600">
                        {item.icon}
                      </div>
                      <div>
                        <Text type="secondary">{item.label}</Text>
                        <div className="mt-1 text-base font-medium text-gray-800">{item.value}</div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              <Divider />
              <Paragraph className="!mb-0 text-gray-500">
                平台会优先处理企业认证、订单履约、融资申请和服务商合作相关问题。紧急交易问题请优先拨打客服热线。
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  )
}
