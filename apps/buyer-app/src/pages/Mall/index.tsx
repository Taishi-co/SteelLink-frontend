import { Carousel, Row, Col, Card, Typography, Divider } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const bannerItems = [
  {
    key: '1',
    title: 'SteelLink B2B钢材交易平台',
    description: '现货直购 · 询价竞价 · 一站式采购',
    bgColor: 'bg-primary-600',
  },
  {
    key: '2',
    title: '海量钢材资源',
    description: '覆盖全国主要钢厂，品种齐全',
    bgColor: 'bg-blue-700',
  },
  {
    key: '3',
    title: '透明定价',
    description: '实时行情，价格透明',
    bgColor: 'bg-indigo-600',
  },
]

const categories = [
  { id: 1, name: '热轧板卷', icon: '🔥' },
  { id: 2, name: '冷轧板卷', icon: '❄️' },
  { id: 3, name: '中厚板', icon: '📦' },
  { id: 4, name: '型材', icon: '📐' },
  { id: 5, name: '管材', icon: '🔧' },
  { id: 6, name: '建材', icon: '🏗️' },
]

const featuredProducts = [
  { id: 1, name: 'Q235B 热轧板卷 3.0*1500*C', price: 3850, unit: '元/吨', specs: '宝钢' },
  { id: 2, name: 'SPCC 冷轧板卷 1.0*1250*C', price: 4200, unit: '元/吨', specs: '鞍钢' },
  { id: 3, name: 'Q345B 中厚板 20*2000*8000', price: 3950, unit: '元/吨', specs: '首钢' },
  { id: 4, name: 'Q235B 工字钢 25#', price: 4100, unit: '元/吨', specs: '马钢' },
]

export default function MallPage() {
  return (
    <div className="bg-gray-50">
      {/* Banner Carousel */}
      <Carousel autoplay className="bg-white">
        {bannerItems.map((item) => (
          <div key={item.key}>
            <div className={`${item.bgColor} h-80 flex items-center justify-center text-white`}>
              <div className="text-center">
                <Title level={2} className="!text-white !mb-2">{item.title}</Title>
                <Paragraph className="!text-white/80 text-lg">{item.description}</Paragraph>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Navigation */}
        <Card className="mb-6">
          <Title level={4} className="!mb-4">品类导航</Title>
          <Row gutter={[16, 16]}>
            {categories.map((cat) => (
              <Col key={cat.id} span={4}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="block text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-gray-700">{cat.name}</div>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>

        <Divider />

        {/* Featured Products */}
        <div className="mt-6">
          <Title level={4} className="!mb-4">热门商品</Title>
          <Row gutter={[16, 16]}>
            {featuredProducts.map((product) => (
              <Col key={product.id} span={6}>
                <Link to={`/products/${product.id}`}>
                  <Card
                    hoverable
                    className="h-full"
                  >
                    <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <span className="text-4xl">🔩</span>
                    </div>
                    <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                      {product.name}
                    </Title>
                    <Paragraph className="!mb-1 text-gray-500 text-xs">{product.specs}</Paragraph>
                    <div className="text-red-500 font-bold">
                      ¥{product.price.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-1">{product.unit}</span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}
