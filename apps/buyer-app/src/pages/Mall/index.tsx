import { useEffect, useMemo, useState } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { Carousel, Row, Col, Card, Typography, Divider, Empty, Spin, message } from 'antd'
import { Link } from 'react-router-dom'
import { categoryService, fallbackProductCategories, type ProductCategory } from '@/services/categoryService'
import { productService } from '@/services/productService'
import type { Product } from '@/types'

const { Title, Paragraph } = Typography

interface MallCategory {
  id: string
  name: string
  displayName: string
  icon: string
  imageUrl: string
}

const bannerItems = [
  {
    key: '1',
    title: 'SteelLink B2B钢材交易平台',
    description: '现货直采 · 在线询价 · 一站式采购',
    bgColor: 'bg-primary-600',
  },
  {
    key: '2',
    title: '服务端真实商品数据',
    description: '商城首页、商品列表、商品详情统一读取同一套后端商品数据',
    bgColor: 'bg-blue-700',
  },
  {
    key: '3',
    title: '本地联调更清晰',
    description: '不再混用本地 mock，页面展示和接口返回保持一致',
    bgColor: 'bg-indigo-600',
  },
]

const categoryIcons: Record<string, string> = {
  热轧板卷: '钢',
  冷轧板卷: '卷',
  中厚板: '板',
  型材: '型',
  管材: '管',
  建材: '建',
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || '钢'
}

export default function MallPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>(fallbackProductCategories)

  useEffect(() => {
    const loadMallData = async () => {
      setLoading(true)
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          categoryService.list(),
          productService.getProducts({
            page: 1,
            page_size: 12,
          }),
        ])
        setCategories(categoryResponse.data.length > 0 ? categoryResponse.data : fallbackProductCategories)
        setProducts(productResponse.data.list)
      } catch (error) {
        message.error('商城首页商品加载失败，请确认后端服务已启动')
      } finally {
        setLoading(false)
      }
    }

    void loadMallData()
  }, [])

  const mallCategories = useMemo<MallCategory[]>(() => {
    return categories.map((category) => ({
      id: `${category.id}`,
      name: category.name,
      displayName: category.display_name || category.name,
      icon: category.icon || getCategoryIcon(category.name),
      imageUrl: category.image_url,
    }))
  }, [categories])

  const featuredProducts = useMemo(() => products.slice(0, 4), [products])

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
        <Spin spinning={loading}>
          <Card className="mb-6">
            <Title level={4} className="!mb-4">
              品类导航
            </Title>
            {mallCategories.length > 0 ? (
              <Row gutter={[16, 16]}>
                {mallCategories.map((category) => (
                  <Col key={category.id} span={4}>
                    <Link
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="block rounded-lg p-4 text-center transition-colors hover:bg-gray-50"
                    >
                      <div className="mb-2 flex h-12 items-center justify-center overflow-hidden rounded bg-gray-100 text-3xl">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.displayName} className="h-full w-full object-cover" />
                        ) : (
                          category.icon
                        )}
                      </div>
                      <div className="text-gray-700">{category.displayName}</div>
                    </Link>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无可用分类" />
            )}
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

            {featuredProducts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {featuredProducts.map((product) => (
                  <Col key={product.id} span={6}>
                    <Link to={`/products/${product.id}`}>
                      <Card hoverable className="h-full">
                        <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded bg-gray-100">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-4xl">钢</span>
                          )}
                        </div>
                        <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                          {product.name}
                        </Title>
                        <Paragraph className="!mb-1 text-xs text-gray-500">{product.spec?.spec || '-'}</Paragraph>
                        <Paragraph className="!mb-1 text-xs text-gray-500">库存：{product.availableQty} 吨</Paragraph>
                        <div className="font-bold text-red-500">
                          ￥{product.unitPrice.toLocaleString()}
                          <span className="ml-1 text-xs text-gray-400">/吨</span>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无热门商品" />
            )}
          </div>
        </Spin>
      </div>
    </div>
  )
}
