import { Link } from 'react-router-dom'
import { Button, Typography, Row, Col, Card } from 'antd'
import {
  ShopOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  RocketOutlined,
  RobotOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const sellerEntryHref = '/dashboard/enterprise'

const features = [
  {
    icon: <ShopOutlined className="text-4xl text-primary-500" />,
    title: '海量现货',
    description: '覆盖全国主要钢厂，品种齐全，库存充足，满足各类采购需求',
  },
  {
    icon: <SafetyCertificateOutlined className="text-4xl text-primary-500" />,
    title: '品质保障',
    description: '严选优质供应商，全程质量追溯，假一赔十',
  },
  {
    icon: <ThunderboltOutlined className="text-4xl text-primary-500" />,
    title: '极速交易',
    description: '在线下单，快速配货，全国物流直达',
  },
  {
    icon: <TeamOutlined className="text-4xl text-primary-500" />,
    title: '专业服务',
    description: '专属客户经理，7×24小时在线，一站式采购解决方案',
  },
]

const stats = [
  { value: '5000+', label: '入驻商家' },
  { value: '10万+', label: 'SKU商品' },
  { value: '100万+', label: '累计订单' },
  { value: '50亿+', label: '交易金额' },
]

const partners = [
  '宝钢', '鞍钢', '首钢', '马钢', '莱钢', '沙钢',
  '日照', '本钢', '太钢', '邯钢', '安钢', '济钢',
]

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <Row gutter={48} align="middle">
            <Col span={14}>
              <Title className="!text-white !text-5xl !mb-6">
                专业B2B钢材交易平台
              </Title>
              <Paragraph className="!text-white/90 text-xl mb-8">
                现货直购 · 供求信息 · AI采购 · 竞价交易 · 一站式钢铁供应链解决方案
              </Paragraph>
              <div className="flex gap-4">
                <Link to="/mall">
                  <Button type="primary" size="large" icon={<ShopOutlined />} className="h-12 px-8">
                    进入商城
                  </Button>
                </Link>
                <a href={sellerEntryHref}>
                  <Button size="large" icon={<RocketOutlined />} className="h-12 px-8 bg-white text-primary-600 border-white hover:bg-gray-100">
                    企业入驻
                  </Button>
                </a>
              </div>
            </Col>
            <Col span={10} className="text-center">
              <div className="text-9xl">🏭</div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <Row gutter={32}>
            {stats.map((stat, index) => (
              <Col key={index} span={6} className="text-center">
                <Text className="text-4xl font-bold text-primary-600">{stat.value}</Text>
                <p className="text-gray-500 mt-2">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <Title level={2}>为什么选择 SteelLink</Title>
            <Paragraph className="text-gray-500 text-lg">
              专业、高效、安全的钢材交易服务
            </Paragraph>
          </div>
          <Row gutter={32}>
            {features.map((feature, index) => (
              <Col key={index} span={6}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph className="text-gray-500">{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <Title level={2}>平台服务</Title>
          </div>
          <Row gutter={[32, 32]}>
            <Col flex="1 1 200px">
              <Card hoverable className="h-full text-center">
                <div className="text-5xl mb-4">🛒</div>
                <Title level={4}>现货商城</Title>
                <Paragraph className="text-gray-500">
                  海量现货资源，一键下单，极速配送
                </Paragraph>
                <Link to="/mall">立即选购 →</Link>
              </Card>
            </Col>
            <Col flex="1 1 200px">
              <Card hoverable className="h-full text-center">
                <div className="text-5xl mb-4">🤝</div>
                <Title level={4}>供求信息</Title>
                <Paragraph className="text-gray-500">
                  供需线索智能连接，快速发现合适商机
                </Paragraph>
                <Link to="/matching">查看供求 →</Link>
              </Card>
            </Col>
            <Col flex="1 1 200px">
              <Card hoverable className="h-full text-center">
                <RobotOutlined className="text-5xl mb-4 text-primary-500" />
                <Title level={4}>AI采购</Title>
                <Paragraph className="text-gray-500">
                  对话式采购助手，自动解析需求并生成采购流程
                </Paragraph>
                <Link to="/ai-procurement">开始采购 →</Link>
              </Card>
            </Col>
            <Col flex="1 1 200px">
              <Card hoverable className="h-full text-center">
                <div className="text-5xl mb-4">🎯</div>
                <Title level={4}>竞价交易</Title>
                <Paragraph className="text-gray-500">
                  透明竞价，最优价格，大宗采购首选
                </Paragraph>
                <Link to="/bidding">参与竞价 →</Link>
              </Card>
            </Col>
            <Col flex="1 1 200px">
              <Card hoverable className="h-full text-center">
                <div className="text-5xl mb-4">📦</div>
                <Title level={4}>集采大厅</Title>
                <Paragraph className="text-gray-500">
                  多家企业联合采购，共享优惠价格
                </Paragraph>
                <Link to="/procurement">了解详情 →</Link>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <Title level={2}>合作钢厂</Title>
            <Paragraph className="text-gray-500">与国内知名钢厂建立深度合作</Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {partners.map((partner, index) => (
              <Col key={index} span={4}>
                <Card className="text-center hover:shadow-md transition-shadow">
                  <Text className="text-lg font-medium text-gray-700">{partner}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <Title level={2} className="!text-white !mb-4">
            开启您的钢铁采购之旅
          </Title>
          <Paragraph className="!text-white/90 text-xl mb-8">
            加入 SteelLink，享受专业、高效、安全的钢材交易服务
          </Paragraph>
          <div className="flex justify-center gap-4">
            <Link to="/mall">
              <Button type="primary" size="large" icon={<ShopOutlined />} className="h-12 px-8 bg-white text-primary-600 border-white hover:bg-gray-100">
                进入商城
              </Button>
            </Link>
            <a href={sellerEntryHref}>
              <Button size="large" icon={<RocketOutlined />} className="h-12 px-8 bg-transparent text-white border-white hover:bg-white/10">
                企业入驻
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
