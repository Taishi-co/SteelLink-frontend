import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Card, Input, Select, Pagination, Typography, Space, Tag, Empty, Spin, InputNumber, Button, Switch } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link, useSearchParams } from 'react-router-dom'
import { categoryService, fallbackProductCategories, type ProductCategory } from '@/services/categoryService'
import { productService } from '@/services/productService'
import type { Product } from '@/types'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

const sortOptions = [
  { label: '默认排序', value: 'newest' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '库存优先', value: 'stock_desc' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('keyword') ?? ''
  const initialCategory = searchParams.get('category') ?? '全部'
  const initialPage = Number(searchParams.get('page') ?? '1')
  const initialSortBy = searchParams.get('sort_by') ?? 'newest'
  const initialSteelMill = searchParams.get('steel_mill') ?? ''
  const initialProvince = searchParams.get('province') ?? ''
  const initialMinAvailable = Number(searchParams.get('min_available') ?? '0')
  const initialQuickOrderOnly = searchParams.get('quick_order') === '1'

  const [searchText, setSearchText] = useState(initialKeyword)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [categories, setCategories] = useState<ProductCategory[]>(fallbackProductCategories)
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [steelMill, setSteelMill] = useState(initialSteelMill)
  const [province, setProvince] = useState(initialProvince)
  const [quickOrderOnly, setQuickOrderOnly] = useState(initialQuickOrderOnly)
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [minAvailable, setMinAvailable] = useState<number | null>(initialMinAvailable > 0 ? initialMinAvailable : null)
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)

  const hasActiveFilters = Boolean(
    searchText ||
      selectedCategory !== '全部' ||
      steelMill ||
      province ||
      city ||
      quickOrderOnly ||
      minPrice ||
      maxPrice ||
      minAvailable,
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.list()
        setCategories(response.data.length > 0 ? response.data : fallbackProductCategories)
      } catch {
        setCategories(fallbackProductCategories)
      }
    }

    void loadCategories()
  }, [])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (searchText) {
      nextParams.set('keyword', searchText)
    }
    if (selectedCategory !== '全部') {
      nextParams.set('category', selectedCategory)
    }
    if (sortBy && sortBy !== 'newest') {
      nextParams.set('sort_by', sortBy)
    }
    if (steelMill) {
      nextParams.set('steel_mill', steelMill)
    }
    if (province) {
      nextParams.set('province', province)
    }
    if (city) {
      nextParams.set('city', city)
    }
    if (quickOrderOnly) {
      nextParams.set('quick_order', '1')
    }
    if (minAvailable && minAvailable > 0) {
      nextParams.set('min_available', String(minAvailable))
    }
    if (currentPage > 1) {
      nextParams.set('page', String(currentPage))
    }

    setSearchParams(nextParams, { replace: true })
  }, [city, currentPage, minAvailable, province, quickOrderOnly, searchText, selectedCategory, setSearchParams, sortBy, steelMill])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await productService.getProducts({
          page: currentPage,
          page_size: 8,
          keyword: searchText || undefined,
          category: selectedCategory !== '全部' ? selectedCategory : undefined,
          steel_mill: steelMill || undefined,
          min_unit_price: minPrice || undefined,
          max_unit_price: maxPrice || undefined,
          min_available: minAvailable || undefined,
          province: province || undefined,
          city: city || undefined,
          sort_by: sortBy,
        })
        setProducts(response.data.list)
        setTotal(response.data.total)
      } catch {
        setProducts([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [city, currentPage, maxPrice, minAvailable, minPrice, province, searchText, selectedCategory, sortBy, steelMill])

  const displayedProducts = quickOrderOnly
    ? products.filter((product) => product.minOrderQty > 0 && product.availableQty >= product.minOrderQty)
    : products

  const categoryOptions = useMemo(() => {
    const options = [
      { label: '全部', value: '全部' },
      ...categories.map((category) => ({
        label: category.display_name || category.name,
        value: category.name,
      })),
    ]
    if (selectedCategory !== '全部' && !options.some((option) => option.value === selectedCategory)) {
      options.push({ label: selectedCategory, value: selectedCategory })
    }
    return options
  }, [categories, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Paragraph className="!mb-1 text-xs text-gray-500">搜索商品</Paragraph>
                <Search
                  placeholder="搜索商品名称、编号或 SKU"
                  defaultValue={searchText}
                  allowClear
                  enterButton={<SearchOutlined />}
                  style={{ width: 360 }}
                  onSearch={(value) => {
                    setSearchText(value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <div>
                <Paragraph className="!mb-1 text-xs text-gray-500">排序方式</Paragraph>
                <Select
                  value={sortBy}
                  onChange={(value) => {
                    setSortBy(value)
                    setCurrentPage(1)
                  }}
                  style={{ width: 180 }}
                  options={sortOptions}
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <Text strong className="text-gray-800">筛选条件</Text>
                {hasActiveFilters ? (
                  <Button
                    type="link"
                    className="!px-0"
                    onClick={() => {
                      setSearchText('')
                      setSelectedCategory('全部')
                      setSteelMill('')
                      setProvince('')
                      setCity('')
                      setQuickOrderOnly(false)
                      setMinPrice(null)
                      setMaxPrice(null)
                      setMinAvailable(null)
                      setSortBy('newest')
                      setCurrentPage(1)
                    }}
                  >
                    清空筛选
                  </Button>
                ) : null}
              </div>

              <Space size="middle" wrap>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">品类</Paragraph>
                  <Select
                    value={selectedCategory}
                    onChange={(value) => {
                      setSelectedCategory(value)
                      setCurrentPage(1)
                    }}
                    style={{ width: 150 }}
                    options={categoryOptions}
                  />
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">价格区间</Paragraph>
                  <Space.Compact>
                    <InputNumber
                      placeholder="最低价"
                      min={0}
                      style={{ width: 120 }}
                      value={minPrice}
                      onChange={(value) => {
                        setMinPrice(value)
                        setCurrentPage(1)
                      }}
                    />
                    <InputNumber
                      placeholder="最高价"
                      min={0}
                      style={{ width: 120 }}
                      value={maxPrice}
                      onChange={(value) => {
                        setMaxPrice(value)
                        setCurrentPage(1)
                      }}
                    />
                  </Space.Compact>
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">钢厂</Paragraph>
                  <Input
                    placeholder="输入钢厂"
                    style={{ width: 150 }}
                    value={steelMill}
                    onChange={(event) => {
                      setSteelMill(event.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">省份</Paragraph>
                  <Input
                    placeholder="仓库省份"
                    style={{ width: 140 }}
                    value={province}
                    onChange={(event) => {
                      setProvince(event.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">城市</Paragraph>
                  <Input
                    placeholder="仓库城市"
                    style={{ width: 140 }}
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">快捷筛选</Paragraph>
                  <Space className="h-8">
                    <Switch
                      checked={quickOrderOnly}
                      onChange={(checked) => {
                        setQuickOrderOnly(checked)
                        setCurrentPage(1)
                      }}
                    />
                    <Text className="text-sm text-gray-600">只看可立即下单</Text>
                  </Space>
                </div>
                <div>
                  <Paragraph className="!mb-1 text-xs text-gray-500">可售库存</Paragraph>
                  <InputNumber
                    placeholder="最低库存"
                    min={0}
                    style={{ width: 130 }}
                    value={minAvailable}
                    onChange={(value) => {
                      setMinAvailable(value)
                      setCurrentPage(1)
                    }}
                    addonAfter="吨"
                  />
                </div>
              </Space>
            </div>
          </div>
        </Card>

        <div className="mb-4 flex items-center justify-between gap-4">
          <Title level={4} className="!mb-0">
            审核通过商品
          </Title>
          <span className="text-sm text-gray-500">
            共 {quickOrderOnly ? displayedProducts.length : total} 个商品
            {quickOrderOnly ? '（可立即下单）' : ''}
          </span>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
                <Col key={product.id} span={6}>
                  <Link to={`/products/${product.id}`}>
                    <Card hoverable className="h-full">
                      <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded bg-gray-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-5xl">钢</span>
                        )}
                      </div>
                      <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                        {product.name}
                      </Title>
                      <Space className="mb-2" wrap>
                        <Tag color="blue">{product.category}</Tag>
                        {product.subCategory ? <Tag>{product.subCategory}</Tag> : null}
                        {product.availableQty >= product.minOrderQty && product.minOrderQty > 0 ? (
                          <Tag color="green">可立即下单</Tag>
                        ) : null}
                      </Space>
                      <Paragraph className="!mb-1 text-xs text-gray-500">编号：{product.productNo || '-'}</Paragraph>
                      <Paragraph className="!mb-1 text-xs text-gray-500">
                        钢厂：{product.steelMill || '-'}
                      </Paragraph>
                      <Paragraph className="!mb-1 text-xs text-gray-500">
                        库存：{product.availableQty} 吨 · 起订：{product.minOrderQty} 吨
                      </Paragraph>
                      <Paragraph className="!mb-1 text-xs text-gray-500">
                        仓库：{product.warehouseInfo?.warehouse_name || '-'} · {product.warehouseInfo?.province || '-'} / {product.warehouseInfo?.city || '-'}
                      </Paragraph>
                      <Paragraph className="!mb-1 text-xs text-gray-500">
                        仓库编码：{product.warehouseInfo?.warehouse_code || '-'} · 捆包号：{product.bundleNo || '-'}
                      </Paragraph>
                      <div className="text-lg font-bold text-red-500">
                        ￥{product.unitPrice.toLocaleString()}
                        <span className="ml-1 text-xs text-gray-400">/吨</span>
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

        {total > 8 && (
          <div className="mt-6 text-center">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={8}
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
