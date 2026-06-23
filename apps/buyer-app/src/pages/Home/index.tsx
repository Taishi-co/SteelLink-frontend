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
    title: '多源供需与行情统一聚合',
    description: '集中呈现现货、求购、竞价和区域行情信息，帮助采购团队缩短比价与寻源时间。',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '仓储物流履约全程留痕',
    description: '平台仓、物流节点、到货入库和签收回单统一在线记录，便于交易双方和合作机构核验履约状态。',
  },
  {
    icon: <BankOutlined />,
    title: '供应链金融能力可衔接',
    description: '围绕托盘垫资、仓单质押、货权监管和释放，打通订单、仓储和资金服务的协同流程。',
  },
  {
    icon: <CloudServerOutlined />,
    title: '产业角色协同边界清晰',
    description: '采购方、供应方、仓储方、物流方和资金方按角色进入对应工作台，在同一业务链路下协同推进。',
  },
]

const services = [
  {
    icon: <ShopOutlined />,
    title: '现货采购商城',
    subtitle: '集中展示已审核商品、库存、价格与交付信息，支持快速选货下单',
    href: '/mall',
    action: '开始选货',
  },
  {
    icon: <CompassOutlined />,
    title: '供求信息',
    subtitle: '发布采购、销售或服务线索，面向上下游企业扩大撮合机会',
    href: '/matching',
    action: '发布线索',
  },
  {
    icon: <ExperimentOutlined />,
    title: 'AI智能采购',
    subtitle: '用自然语言录入采购要求，快速生成匹配方案与后续操作建议',
    href: '/ai-procurement',
    action: '智能发起',
  },
  {
    icon: <FundProjectionScreenOutlined />,
    title: '竞价交易',
    subtitle: '适用于大宗采购透明比价场景，沉淀完整报价与定标记录',
    href: '/bidding',
    action: '查看竞价',
  },
  {
    icon: <ApiOutlined />,
    title: '仓储物流服务',
    subtitle: '整合平台服务商资源，支撑订单交付、监管仓管理和运输协同',
    href: '/service-market',
    action: '配置履约',
  },
]

const timeline = [
  '企业认证',
  '选货/发布需求',
  '集采/询报价协同',
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
    { value: statsLoaded ? formatCount(stats.merchant_count) : '--', label: '平台合作企业', hint: '采购方 / 供应方 / 服务机构' },
    { value: statsLoaded ? formatCount(stats.sku_count) : '--', label: '可采现货 SKU', hint: '覆盖主要钢材品类与规格' },
    { value: statsLoaded ? formatCount(stats.order_count) : '--', label: '在线履约订单', hint: '合同、仓储、物流全程留痕' },
    { value: statsLoaded ? formatAmount(stats.transaction_amount) : '--', label: '累计交易规模', hint: '平台成交与履约协同金额' },
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
                    大宗商品交易 · 履约协同 · 供应链金融
                  </Tag>
                  <Tag className="border-white/15 bg-white/10 px-4 py-1 text-white/80">
                    面向产业集群的企业协同平台
                  </Tag>
                </Space>
                <Title className="!mb-6 max-w-4xl !text-[52px] !font-black !leading-[1.04] !text-white md:!text-[68px]">
                  把寻源、交易、履约和融资，收敛到同一套采购工作台。
                </Title>
                <Paragraph className="!mb-8 max-w-2xl !text-lg !leading-8 !text-white/76">
                  RecoLink 面向产业集群中的采购企业、供应企业和服务机构，提供现货交易、联合集采、履约协同与供应链金融衔接能力，帮助用户以更低沟通成本完成大宗商品采购闭环。
                </Paragraph>
                <Space size={14} wrap>
                  <Link to="/mall">
                    <Button type="primary" size="large" icon={<ShopOutlined />} className="h-12 rounded-full bg-[#d08a3c] px-7 font-semibold shadow-[0_14px_32px_rgba(208,138,60,.35)] hover:!bg-[#e19b4b]">
                      进入采购商城
                    </Button>
                  </Link>
                  <a href={sellerEntryHref}>
                    <Button size="large" icon={<RocketOutlined />} className="h-12 rounded-full border-white/30 bg-white/10 px-7 font-semibold text-white backdrop-blur hover:!border-white hover:!bg-white/18 hover:!text-white">
                      申请企业入驻
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
                        <Title level={4} className="!mb-0 !mt-1">履约协同看板</Title>
                      </div>
                      <FireOutlined className="rounded-2xl bg-[#1d2a21] p-3 text-xl text-[#efb56f]" />
                    </div>
                    <div className="grid gap-3">
                      {['采购合同确认', '监管仓验收入库', '物流签收回传', '资金方货权释放'].map((item, index) => (
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
                  <Text className="block text-white/60">本周履约准时率</Text>
                  <Text className="text-2xl font-black text-white">98.6%</Text>
                </div>
                <div className="absolute -bottom-6 right-4 hidden rounded-3xl bg-[#d08a3c] p-4 text-[#1a130c] shadow-2xl md:block">
                  <Text className="block text-[#3b2410]">供应链金融</Text>
                  <Text className="text-xl font-black text-[#1a130c]">协同可视化</Text>
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
            <Title level={2} className="!mb-3 !mt-3 !text-4xl !font-black">不是单一卖货页面，而是面向产业协同的交易底座。</Title>
            <Paragraph className="!mb-0 max-w-2xl !text-base !leading-7 !text-slate-600">
              平台围绕真实货物、真实订单和真实履约节点组织协同流程，让采购、供应、仓储、物流和金融各方能够基于同一批业务数据推进决策。
            </Paragraph>
          </div>
          <Link to="/service-market" className="font-semibold text-[#9f5f23]">
            查看履约服务资源 <ArrowRightOutlined />
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
            <Title level={2} className="!mb-3 !mt-3 !text-4xl !font-black !text-white">一套平台，覆盖采购到融资的关键入口。</Title>
            <Paragraph className="!mx-auto !mb-0 max-w-2xl !text-white/62">
              不同角色拥有不同工作台与权限边界，但底层围绕同一套订单、仓储、物流和资金数据流转，便于跨组织协同。
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
            <Title level={2} className="!mb-4 !mt-3 !text-4xl !font-black">从企业认证到收货归档，关键节点均可追踪。</Title>
            <Paragraph className="!text-slate-600">
              平台流程不仅覆盖下单与支付，还覆盖集采协同、提货指令、物流到货、监管仓验收、买方确认和资金方货权管理等关键节点。
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
              <Paragraph className="!mb-0 !text-slate-600">持续接入钢厂、贸易商、仓储物流和金融合作资源，服务产业集群在线协同采购。</Paragraph>
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
              <Title level={2} className="!mb-4 !mt-3 !text-4xl !font-black !text-white">准备启动线上采购协同？</Title>
              <Paragraph className="!mb-0 max-w-2xl !text-white/68">
                建议先完成企业认证，再根据采购、供应、仓储、物流或金融协同角色开通能力。平台会按权限自动开放对应工作台入口。
              </Paragraph>
            </Col>
            <Col xs={24} lg={9}>
              <Space size={14} wrap className="justify-start lg:justify-end">
                <Link to="/dashboard">
                  <Button type="primary" size="large" className="h-12 rounded-full bg-[#d08a3c] px-7 font-semibold hover:!bg-[#e19b4b]">
                    进入企业工作台
                  </Button>
                </Link>
                <a href={sellerEntryHref}>
                  <Button size="large" className="h-12 rounded-full border-white/30 bg-white/10 px-7 font-semibold text-white hover:!border-white hover:!bg-white/18 hover:!text-white">
                    提交入驻申请
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
