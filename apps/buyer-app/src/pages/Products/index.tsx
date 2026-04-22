import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Card, Input, Select, Pagination, Typography, Space, Tag, Empty, Spin, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link, useSearchParams } from 'react-router-dom'
import api from '@/services/api'

const { Title, Paragraph } = Typography
const { Search } = Input

interface ProductItem {
  id: number
  sku_id: string
  name: string
  category: string
  specs: string
  price: number
  unit: string
  stock: number
  visible_stock: number
  seller_uid: string
  seller_name: string
}

interface ProductListResponse {
  list: ProductItem[]
  total: number
  page: number
  page_size: number
}

const productCategories = ['全部', '热轧板卷', '冷轧板卷', '中厚板', '型材', '管材', '建材']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('keyword') ?? ''
  const initialCategory = searchParams.get('category') ?? '全部'
  const initialPage = Number(searchParams.get('page') ?? '1')

  const [searchText, setSearchText] = useState(initialKeyword)
  const [selectedCategory, setSelectedCategory] = useState(
    productCategories.includes(initialCategory) ? initialCategory : '全部',
  )
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductItem[]>([])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (searchText) {
      nextParams.set('keyword', searchText)
    }
    if (selectedCategory !== '全部') {
      nextParams.set('category', selectedCategory)
    }
    if (currentPage > 1) {
      nextParams.set('page', String(currentPage))
    }

    setSearchParams(nextParams, { replace: true })
  }, [currentPage, searchText, selectedCategory, setSearchParams])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await api.get<ProductListResponse, ProductListResponse>('/products', {
          params: {
            page: 1,
            page_size: 200,
          },
        })
        setProducts(response.list)
      } catch (error) {
        message.error('商品加载失败，请确认后端服务已启动')
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [])

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku_id.toLowerCase().includes(searchText.toLowerCase())
        const matchesCategory = selectedCategory === '全部' || product.category === selectedCategory
        return matchesSearch && matchesCategory
      }),
    [products, searchText, selectedCategory],
  )

  const pageSize = 8
  const startIndex = (currentPage - 1) * pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <Card className="mb-6">
          <Space size="large" wrap>
            <Search
              placeholder="搜索商品名称或 SKU"
              defaultValue={searchText}
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 320 }}
              onSearch={(value) => {
                setSearchText(value)
                setCurrentPage(1)
              }}
            />
            <Space>
              <span className="text-gray-500">品类：</span>
              <Select
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value)
                  setCurrentPage(1)
                }}
                style={{ width: 150 }}
                options={productCategories.map((category) => ({ label: category, value: category }))}
              />
            </Space>
          </Space>
        </Card>

        <div className="mb-4 flex items-center justify-between gap-4">
          <Title level={4} className="!mb-0">
            审核通过商品
          </Title>
          <span className="text-sm text-gray-500">共 {filteredProducts.length} 个商品</span>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <Col key={product.id} span={6}>
                  <Link to={`/products/${product.id}`}>
                    <Card hoverable className="h-full">
                      <div className="mb-3 flex h-40 items-center justify-center rounded bg-gray-100">
                        <span className="text-5xl">钢</span>
                      </div>
                      <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                        {product.name}
                      </Title>
                      <Space className="mb-2" wrap>
                        <Tag color="blue">{product.category}</Tag>
                        <Tag>{product.specs}</Tag>
                      </Space>
                      <Paragraph className="!mb-1 text-xs text-gray-500">SKU：{product.sku_id}</Paragraph>
                      <Paragraph className="!mb-1 text-xs text-gray-500">
                        库存：{product.visible_stock} 吨 · 卖家：{product.seller_name}
                      </Paragraph>
                      <div className="text-lg font-bold text-red-500">
                        ￥{product.price.toLocaleString()}
                        <span className="ml-1 text-xs text-gray-400">{product.unit}</span>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="暂无符合条件的商品" />
              </Col>
            )}
          </Row>
        </Spin>

        {filteredProducts.length > pageSize && (
          <div className="mt-6 text-center">
            <Pagination
              current={currentPage}
              total={filteredProducts.length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 个商品`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
