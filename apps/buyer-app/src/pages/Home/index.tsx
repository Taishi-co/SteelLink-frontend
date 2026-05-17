import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Typography, Row, Col, Card, Space, Tag } from 'antd'
import {
  ApiOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CloudServerOutlined,
  CompassOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  FireOutlined,
  FundProjectionScreenOutlined,
  RadarChartOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { platformService, type PlatformStats } from '@/services/platformService'

const { Title, Paragraph, Text } = Typography
const sellerEntryHref = '/dashboard/enterprise'

const emptyStats: PlatformStats = {
  merchant_count: 0,
  sku_count: 0,
  order_count: 0,
  transaction_amount: 0,
}

const formatCount = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

const formatAmount = (value: number) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2).replace(/\.?0+$/, '')}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2).replace(/\.?0+$/, '')}万`
  }
  return `${formatCount(value)}元`
}

const capabilities = [
  {
    icon: <RadarChartOutlined />,
    title: '行情和供需实时聚合',
    description: '把现货、求购、竞价和钢材行情放在同一个交易视图里，减少多平台反复询价。',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '仓储物流履约可追踪',
    description: '平台仓、物流单据、到货入库和签收节点统一留痕，交易双方都能看到关键凭证。',
  },
  {
    icon: <BankOutlined />,
    title: '供应链金融可接入',
    description: '托盘垫资、仓单质押、货权监控和释放流程与订单、仓储履约联动。',
  },
  {
    icon: <CloudServerOutlined />,
    title: '企业能力分工明确',
    description: '采购商、供应商、仓储方、物流方、资金方按权限进入对应工作台。',
  },
]

const services = [
  {
    icon: <ShopOutlined />,
    title: '现货商城',
    subtitle: '已审核商品、库存和价格集中展示',
    href: '/mall',
    action: '进入商城',
  },
  {
    icon: <CompassOutlined />,
    title: '供求信息',
    subtitle: '发布采购或销售线索，让系统连接上下游',
    href: '/matching',
    action: '查看供求',
  },
  {
    icon: <ExperimentOutlined />,
    title: 'AI采购',
    subtitle: '用自然语言拆解采购需求并匹配供应方案',
    href: '/ai-procurement',
    action: '开始采购',
  },
  {
    icon: <FundProjectionScreenOutlined />,
    title: '竞价交易',
    subtitle: '大宗采购透明比价，沉淀完整竞价记录',
    href: '/bidding',
    action: '参与竞价',
  },
  {
    icon: <ApiOutlined />,
    title: '仓储物流',
    subtitle: '平台服务商上架资源，买卖方可申请使用',
    href: '/service-market',
    action: '找服务商',
  },
]

const timeline = [
  '企业认证',
  '选货/发布需求',
  '合同订单',
  '仓储物流履约',
  '融资/质押服务',
  '收货归档',
]

const partners = ['宝钢', '鞍钢', '首钢', '马钢', '沙钢', '日照', '本钢', '太钢', '邯钢', '安钢', '莱钢', '济钢']

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStats>(emptyStats)
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    platformService.getStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setStatsLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatsLoaded(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const homeStats = [
    { value: statsLoaded ? formatCount(stats.merchant_count) : '--', label: '入驻企业', hint: '采购 / 供应 / 服务商' },
    { value: statsLoaded ? formatCount(stats.sku_count) : '--', label: '现货 SKU', hint: '钢材品类和规格' },
    { value: statsLoaded ? formatCount(stats.order_count) : '--', label: '履约订单', hint: '合同和履约留痕' },
    { value: statsLoaded ? formatAmount(stats.transaction_amount) : '--', label: '交易规模', hint: '平台累计交易金额' },
  ]

  return (
    <div className="reco-home bg-[#f4efe6] text-slate-900">
      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#111813] px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(203,132,66,0.34),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(87,116,84,0.35),transparent_30%),linear-gradient(135deg,#111813_0%,#1e2820_48%,#2f2418_100%)]" />
        <div className="absolute left-0 top-0 h-full w-full opacity-[0.16] [background-image:linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full border border-[#d49b5f]/30" />
        <div className="absolute -bottom-10 right-28 h-44 w-44 rounded-full border border-white/15" />

        <div className="relative mx-auto flex min-h-[580px] max-w-7xl items-center">
          <Row gutter={[48, 48]} align="middle" className="w-full">
            <Col xs={24} lg={13}>
              <div className="home-reveal">
                <Space wrap className="mb-6">
                  <Tag className="border-[#d7a35f]/40 bg-[#d7a35f]/15 px-4 py-1 text-[#f5d5a6]">
                    钢铁交易 · 仓储物流 · 供应链金融
                  </Tag>
                  <Tag className="border-white/15 bg-white/10 px-4 py-1 text-white/80">
                    B2B 产业协同平台
                  </Tag>
                </Space>
                <Title className="!mb-6 max-w-4xl !text-[52px] !font-black !leading-[1.04] !text-white md:!text-[68px]">
                  把钢材交易链路，压缩到一个可信工作台。
                </Title>
                <Paragraph className="!mb-8 max-w-2xl !text-lg !leading-8 !text-white/76">
                  从找货、竞价、合同、仓储、物流到融资质押，RecoLink 将供应链角色、履约凭证和资金服务串成可追踪的业务闭环。
                </Paragraph>
                <Space size={14} wrap>
                  <Link to="/mall">
                    <Button type="primary" size="large" icon={<ShopOutlined />} className="h-12 rounded-full bg-[#d08a3c] px-7 font-semibold shadow-[0_14px_32px_rgba(208,138,60,.35)] hover:!bg-[#e19b4b]">
                      进入现货商城
                    </Button>
                  </Link>
                  <a href={sellerEntryHref}>
                    <Button size="large" icon={<RocketOutlined />} className="h-12 rounded-full border-white/30 bg-white/10 px-7 font-semibold text-white backdrop-blur hover:!border-white hover:!bg-white/18 hover:!text-white">
                      企业入驻
                    </Button>
                  </a>
                </Space>
              </div>
            </Col>

            <Col xs={24} lg={11}>
              <div className="home-reveal home-reveal-delay relative mx-auto max-w-[520px]">
                <div className="rounded-[36px] border border-white/14 bg-white/[0.08] p-5 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-xl">
                  <div className="rounded-[28px] bg-[#f2eadc] p-5 text-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <Text className="text-xs uppercase tracking-[0.28em] text-[#8f6235]">Supply Console</Text>
                        <Title level={4} className="!mb-0 !mt-1">履约驾驶舱</Title>
                      </div>
                      <FireOutlined className="rounded-2xl bg-[#1d2a21] p-3 text-xl text-[#efb56f]" />
                    </div>
                    <div className="grid gap-3">
                      {['订单合同签署', '监管仓入库', '物流到货确认', '资金方货权释放'].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17221b] text-sm font-bold text-[#efb56f]">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <Text strong>{item}</Text>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e7dac7]">
                              <div className="h-full rounded-full bg-[#c47b34]" style={{ width: `${46 + index * 14}%` }} />
                            </div>
                          </div>
                          <ThunderboltOutlined className="text-[#c47b34]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -left-6 top-10 hidden rounded-3xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur md:block">
                  <Text className="block text-white/60">本周履约</Text>
                  <Text className="text-2xl font-black text-white">98.6%</Text>
                </div>
                <div className="absolute -bottom-6 right-4 hidden rounded-3xl bg-[#d08a3c] p-4 text-[#1a130c] shadow-2xl md:block">
                  <Text className="block text-[#3b2410]">质押监管</Text>
                  <Text className="text-xl font-black text-[#1a130c]">可视化</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="grid overflow-hidden rounded-[32px] border border-[#e1d4be] bg-[#fffaf1] shadow-[0_24px_70px_rgba(60,43,24,.16)] md:grid-cols-4">
          {homeStats.map((stat) => (
            <div key={stat.label} className="border-b border-[#eadfce] p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <Text className="text-4xl font-black text-[#17221b]">{stat.value}</Text>
              <div className="mt-2 text-base font-semibold text-[#6b4a2b]">{stat.label}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.hint}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Text className="text-sm font-bold uppercase tracking-[0.32em] text-[#b87432]">Why RecoLink</Text>
            <Title level={2} className="!mb-3 !mt-3 !text-4xl !font-black">不是展示型商城，是交易履约系统。</Title>
            <Paragraph className="!mb-0 max-w-2xl !text-base !leading-7 !text-slate-600">
              当前系统按供应链角色拆分权限，核心目标是让订单、仓库、物流和资金方能够围绕同一批货物协同推进。
            </Paragraph>
          </div>
          <Link to="/service-market" className="font-semibold text-[#9f5f23]">
            查看平台服务 <ArrowRightOutlined />
          </Link>
        </div>

        <Row gutter={[20, 20]}>
          {capabilities.map((item) => (
            <Col key={item.title} xs={24} md={12} xl={6}>
              <Card className="home-capability-card h-full rounded-[28px] border-[#dfd0ba] bg-[#fffaf1] shadow-sm">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17221b] text-2xl text-[#efb56f]">
                  {item.icon}
                </div>
                <Title level={4} className="!mb-3">{item.title}</Title>
                <Paragraph className="!mb-0 !text-slate-600">{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="bg-[#17221b] px-6 py-24 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <Text className="text-sm font-bold uppercase tracking-[0.32em] text-[#efb56f]">Service Matrix</Text>
            <Title level={2} className="!mb-3 !mt-3 !text-4xl !font-black !text-white">一条链路，五类入口。</Title>
            <Paragraph className="!mx-auto !mb-0 max-w-2xl !text-white/62">
              不同角色看到不同工作台，但底层围绕同一套订单、仓储、物流、资金数据流转。
            </Paragraph>
          </div>

          <Row gutter={[20, 20]}>
            {services.map((service, index) => (
              <Col key={service.title} xs={24} md={12} xl={index === 0 ? 8 : 4}>
                <Link to={service.href} className="block h-full no-underline">
                  <Card className="home-service-card h-full rounded-[30px] border-white/10 bg-white/[0.06] text-white backdrop-blur" bodyStyle={{ minHeight: 220 }}>
                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efb56f] text-xl text-[#17221b]">
                      {service.icon}
                    </div>
                    <Title level={4} className="!mb-3 !text-white">{service.title}</Title>
                    <Paragraph className="!text-white/62">{service.subtitle}</Paragraph>
                    <Text className="font-semibold text-[#efb56f]">{service.action} <ArrowRightOutlined /></Text>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-12">
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} lg={9}>
            <Text className="text-sm font-bold uppercase tracking-[0.32em] text-[#b87432]">Workflow</Text>
            <Title level={2} className="!mb-4 !mt-3 !text-4xl !font-black">从企业认证到履约归档，每一步都有责任方。</Title>
            <Paragraph className="!text-slate-600">
              平台流程不只停留在下单付款，还覆盖卖方提货指令、物流到货、收货仓验货入库、买方/资金方确认收货和货权释放。
            </Paragraph>
          </Col>
          <Col xs={24} lg={15}>
            <div className="grid gap-4 md:grid-cols-3">
              {timeline.map((item, index) => (
                <div key={item} className="rounded-[26px] border border-[#dfd0ba] bg-[#fffaf1] p-5 shadow-sm">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17221b] font-bold text-[#efb56f]">{index + 1}</span>
                    <FieldTimeOutlined className="text-xl text-[#b87432]" />
                  </div>
                  <Text className="text-lg font-bold text-[#17221b]">{item}</Text>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </section>

      <section className="border-y border-[#dfd0ba] bg-[#fffaf1] px-6 py-18 md:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Title level={2} className="!mb-2 !text-3xl !font-black">合作钢厂与产业伙伴</Title>
              <Paragraph className="!mb-0 !text-slate-600">聚合主流钢厂资源，服务上下游企业在线协同。</Paragraph>
            </div>
            <Text className="text-sm font-semibold text-[#9f5f23]">持续接入更多区域资源</Text>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {partners.map((partner) => (
              <div key={partner} className="rounded-2xl border border-[#dfd0ba] bg-white/70 px-5 py-4 text-center font-bold text-[#17221b] shadow-sm">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4efe6] px-6 py-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-[#111813] p-10 text-white shadow-[0_24px_80px_rgba(17,24,19,.26)] md:p-14">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={15}>
              <Text className="text-sm font-bold uppercase tracking-[0.32em] text-[#efb56f]">Get Started</Text>
              <Title level={2} className="!mb-4 !mt-3 !text-4xl !font-black !text-white">准备把采购、销售和履约搬到线上？</Title>
              <Paragraph className="!mb-0 max-w-2xl !text-white/68">
                先完成企业认证，再按供应链角色开通服务权限。平台会自动开放对应工作台入口。
              </Paragraph>
            </Col>
            <Col xs={24} lg={9}>
              <Space size={14} wrap className="justify-start lg:justify-end">
                <Link to="/dashboard">
                  <Button type="primary" size="large" className="h-12 rounded-full bg-[#d08a3c] px-7 font-semibold hover:!bg-[#e19b4b]">
                    进入工作台
                  </Button>
                </Link>
                <a href={sellerEntryHref}>
                  <Button size="large" className="h-12 rounded-full border-white/30 bg-white/10 px-7 font-semibold text-white hover:!border-white hover:!bg-white/18 hover:!text-white">
                    申请企业能力
                  </Button>
                </a>
              </Space>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}
