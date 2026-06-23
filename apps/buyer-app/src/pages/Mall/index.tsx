import { useEffect, useMemo, useState } from 'react'
import { ArrowRightOutlined, FireOutlined, SearchOutlined, ShopOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Row, Col, Card, Typography, Empty, Spin, message, Tag, Button, Input, Space } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { categoryService, fallbackProductCategories, type ProductCategory } from '@/services/categoryService'
import { productService } from '@/services/productService'
import type { Product } from '@/types'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

interface MallCategory {
  id: string
  name: string
  displayName: string
  icon: string
  imageUrl: string
}

const categoryIcons: Record<string, string> = {
  热轧板卷: '热',
  冷轧板卷: '冷',
  中厚板: '板',
  型材: '型',
  管材: '管',
  建材: '建',
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || '钢'
}

const sourcingGuide = [
  {
    title: '第一步：明确采购范围',
    description: '先按品类、规格、仓库和价格筛选现货，快速确认本次采购是否可直接成交。',
  },
  {
    title: '第二步：核验交付条件',
    description: '重点关注库存量、起订量和交付仓信息，确认是否满足项目排产或区域调拨要求。',
  },
  {
    title: '第三步：衔接履约与融资',
    description: '如需仓储、物流或供应链金融支持，可在下单后继续接入平台服务，形成完整履约闭环。',
  },
]

export default function MallPage() {
  const navigate = useNavigate()
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
      } catch {
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

  const featuredProducts = useMemo(() => products.slice(0, 8), [products])

  return (
    <div className="mall-page min-h-screen bg-[#f4efe6]">
      <section className="border-b border-[#eadcc7] bg-[#fffaf1] px-6 py-12 md:px-10">
        <div className="mx-auto max-w-7xl">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={14}>
              <Space wrap className="mb-5">
                <Tag className="border-[#d6ba8c] bg-[#fff3df] px-4 py-1 text-[#9f5f23]">锐联产业协同平台 RecoLink</Tag>
                <Tag className="border-[#bfd2c4] bg-[#edf6ef] px-4 py-1 text-[#2f6b49]">审核商品 · 真实库存 · 在线履约</Tag>
              </Space>
              <Title className="!mb-4 !text-5xl !font-black !leading-tight !text-[#17221b]">
                现货采购商城
              </Title>
              <Paragraph className="!mb-7 max-w-2xl !text-base !leading-7 !text-[#5f6b61]">
                面向采购企业集中展示审核通过的大宗商品现货资源。用户可按品类、仓库、库存和价格快速筛选商品，并在成交后衔接合同、仓储、物流和供应链金融流程。
              </Paragraph>
              <Space wrap className="mb-7">
                <Tag className="rounded-full border-[#eadcc7] bg-white px-4 py-1 text-[#6b4a2b]">适合现货直采与项目补货</Tag>
                <Tag className="rounded-full border-[#eadcc7] bg-white px-4 py-1 text-[#6b4a2b]">支持后续接入集采与询报价</Tag>
                <Tag className="rounded-full border-[#eadcc7] bg-white px-4 py-1 text-[#6b4a2b]">支持仓储物流与融资协同</Tag>
              </Space>
              <Search
                size="large"
                allowClear
                enterButton={<Button type="primary" icon={<SearchOutlined />} className="bg-[#214332] hover:!bg-[#2d5a43]">搜索</Button>}
                placeholder="搜索商品名称、钢厂、规格、材质或编号"
                className="max-w-2xl"
                onSearch={(value) => navigate(`/products${value ? `?keyword=${encodeURIComponent(value)}` : ''}`)}
              />
            </Col>
            <Col xs={24} lg={10}>
              <div className="rounded-[34px] border border-[#eadcc7] bg-white p-6 shadow-[0_24px_60px_rgba(64,44,25,.10)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <Text className="text-xs font-bold uppercase tracking-[0.24em] text-[#a4662c]">Market Snapshot</Text>
                    <Title level={4} className="!mb-0 !mt-1">采购概览</Title>
                  </div>
                  <ShopOutlined className="rounded-2xl bg-[#214332] p-3 text-xl text-[#f3c17c]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['当前展示商品', `${products.length || '--'}`],
                    ['覆盖品类', `${mallCategories.length || '--'}`],
                    ['采购模式', '现货直采 / 询报价衔接'],
                    ['后续能力', '仓储物流 / 供应链金融'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-[#f8f0e4] p-4">
                      <Text className="block text-sm text-[#7a847a]">{label}</Text>
                      <Text className="mt-1 block text-2xl font-black text-[#17221b]">{value}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <Spin spinning={loading}>
          <section className="mb-12">
            <div className="mb-8 grid gap-4 lg:grid-cols-3">
              {sourcingGuide.map((item, index) => (
                <Card key={item.title} className="rounded-[24px] border-[#eadcc7] bg-[#fffaf1] shadow-sm">
                  <Text className="text-xs font-bold uppercase tracking-[0.24em] text-[#a4662c]">Guide 0{index + 1}</Text>
                  <Title level={5} className="!mb-3 !mt-3 !font-black">{item.title}</Title>
                  <Paragraph className="!mb-0 !text-[#5f6b61]">{item.description}</Paragraph>
                </Card>
              ))}
            </div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <Text className="text-sm font-bold uppercase tracking-[0.28em] text-[#a4662c]">Categories</Text>
                <Title level={3} className="!mb-0 !mt-2 !font-black">品类导航</Title>
              </div>
              <Link to="/products" className="font-semibold text-[#9f5f23]">
                查看全部商品 <ArrowRightOutlined />
              </Link>
            </div>
            {mallCategories.length > 0 ? (
              <Row gutter={[16, 16]}>
                {mallCategories.map((category) => (
                  <Col key={category.id} xs={12} sm={8} md={6} lg={4}>
                    <Link
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="group block h-full rounded-[24px] border border-[#eadcc7] bg-[#fffaf1] p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#d0a56e] hover:shadow-[0_18px_38px_rgba(64,44,25,.12)]"
                    >
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#214332] text-2xl font-black text-[#f3c17c]">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.displayName} className="h-full w-full object-cover" />
                        ) : (
                          category.icon
                        )}
                      </div>
                      <div className="font-bold text-[#17221b]">{category.displayName}</div>
                    </Link>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="rounded-[24px] border-[#eadcc7] bg-[#fffaf1]">
                <Empty description="暂无可用分类" />
              </Card>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <Text className="text-sm font-bold uppercase tracking-[0.28em] text-[#a4662c]">Featured</Text>
                <Title level={3} className="!mb-0 !mt-2 !font-black">重点推荐现货</Title>
              </div>
              <Link to="/products" className="font-semibold text-[#9f5f23]">
                进入完整商品库 <ArrowRightOutlined />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <Row gutter={[18, 18]}>
                {featuredProducts.map((product) => (
                  <Col key={product.id} xs={24} sm={12} lg={6}>
                    <Link to={`/products/${product.id}`} className="block h-full no-underline">
                      <Card hoverable className="mall-product-card h-full rounded-[26px] border-[#eadcc7] bg-[#fffaf1] shadow-sm">
                        <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-[#efe3d1]">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-4xl font-black text-[#214332]">钢</span>
                          )}
                        </div>
                        <Space className="mb-3" wrap>
                          <Tag color="green">{product.category}</Tag>
                          {product.availableQty >= product.minOrderQty && product.minOrderQty > 0 ? <Tag color="gold">可直接下单</Tag> : null}
                        </Space>
                        <Title level={5} className="!mb-2 !text-base line-clamp-2">
                          {product.name}
                        </Title>
                        <Paragraph className="!mb-1 text-xs text-[#7a847a]">{product.spec?.spec || '-'}</Paragraph>
                        <Paragraph className="!mb-3 text-xs text-[#7a847a]">库存：{product.availableQty} 吨 · 起订：{product.minOrderQty} 吨</Paragraph>
                        <div className="flex items-end justify-between">
                          <div className="text-xl font-black text-[#b45324]">
                            ￥{product.unitPrice.toLocaleString()}
                            <span className="ml-1 text-xs text-[#7a847a]">/吨</span>
                          </div>
                          <ThunderboltOutlined className="text-[#c47b34]" />
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="rounded-[24px] border-[#eadcc7] bg-[#fffaf1]">
                <Empty description="暂无热门商品" />
              </Card>
            )}
          </section>

          <section className="mt-12 rounded-[32px] bg-[#214332] p-8 text-white">
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={16}>
                <Space align="center">
                  <FireOutlined className="text-3xl text-[#f3c17c]" />
                  <div>
                    <Title level={3} className="!mb-1 !text-white">需要更精细的采购方案？</Title>
                    <Paragraph className="!mb-0 !text-white/70">如标准现货无法完全满足项目要求，可继续使用 AI 智能采购或发布供求信息，补充规格、价格区间、交付仓和融资需求。</Paragraph>
                  </div>
                </Space>
              </Col>
              <Col xs={24} lg={8} className="text-left lg:text-right">
                <Space wrap>
                  <Link to="/ai-procurement">
                    <Button size="large" className="rounded-full border-white/30 bg-white text-[#214332]">AI采购</Button>
                  </Link>
                  <Link to="/matching">
                    <Button size="large" className="rounded-full border-white/30 bg-white/10 text-white hover:!border-white hover:!bg-white/20 hover:!text-white">发布采购线索</Button>
                  </Link>
                </Space>
              </Col>
            </Row>
          </section>
        </Spin>
      </div>
    </div>
  )
}
