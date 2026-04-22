import { ArrowRightOutlined } from '@ant-design/icons'
import { Carousel, Row, Col, Card, Typography, Divider } from 'antd'
import { Link } from 'react-router-dom'
import { featuredProducts, mallCategories } from '@/data/products'

const { Title, Paragraph } = Typography

const bannerItems = [
  {
    key: '1',
    title: 'SteelLink B2B钢材交易平台',
    description: '现货直采 · 询价竞价 · 一站式采购',
    bgColor: 'bg-primary-600',
  },
  {
    key: '2',
    title: '海量钢材资源',
    description: '覆盖全国主要钢厂，品种齐全、报价透明',
    bgColor: 'bg-blue-700',
  },
  {
    key: '3',
    title: '透明定价',
    description: '实时行情同步，成交路径更清晰',
    bgColor: 'bg-indigo-600',
  },
]

export default function MallPage() {
  return (
    <div className="bg-gray-50">
      <Carousel autoplay className="bg-white">
        {bannerItems.map((item) => (
          <div key={item.key}>
            <div className={`${item.bgColor} flex h-80 items-center justify-center text-white`}>
              <div className="text-center">
                <Title level={2} className="!mb-2 !text-white">
                  {item.title}
                </Title>
                <Paragraph className="text-lg !text-white/80">{item.description}</Paragraph>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Card className="mb-6">
          <Title level={4} className="!mb-4">
            品类导航
          </Title>
          <Row gutter={[16, 16]}>
            {mallCategories.map((category) => (
              <Col key={category.id} span={4}>
                <Link
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="block rounded-lg p-4 text-center transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 text-3xl">{category.icon}</div>
                  <div className="text-gray-700">{category.name}</div>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>

        <Divider />

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Title level={4} className="!mb-0">
              热门商品
            </Title>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              更多
              <ArrowRightOutlined />
            </Link>
          </div>

          <Row gutter={[16, 16]}>
            {featuredProducts.map((product) => (
              <Col key={product.id} span={6}>
                <Link to={`/products/${product.id}`}>
                  <Card hoverable className="h-full">
                    <div className="mb-3 flex h-32 items-center justify-center rounded bg-gray-100">
                      <span className="text-4xl">🧱</span>
                    </div>
                    <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                      {product.name}
                    </Title>
                    <Paragraph className="!mb-1 text-xs text-gray-500">{product.specs}</Paragraph>
                    <div className="font-bold text-red-500">
                      ¥{product.price.toLocaleString()}
                      <span className="ml-1 text-xs text-gray-400">{product.unit}</span>
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
