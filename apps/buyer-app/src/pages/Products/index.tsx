import { useState } from 'react'
import { Row, Col, Card, Input, Select, Pagination, Typography, Space, Tag, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Search } = Input

const mockProducts = [
  { id: 1, name: 'Q235B 热轧板卷 3.0*1500*C', price: 3850, unit: '元/吨', specs: '宝钢', stock: 500, category: '热轧板卷' },
  { id: 2, name: 'SPCC 冷轧板卷 1.0*1250*C', price: 4200, unit: '元/吨', specs: '鞍钢', stock: 300, category: '冷轧板卷' },
  { id: 3, name: 'Q345B 中厚板 20*2000*8000', price: 3950, unit: '元/吨', specs: '首钢', stock: 200, category: '中厚板' },
  { id: 4, name: 'Q235B 工字钢 25#', price: 4100, unit: '元/吨', specs: '马钢', stock: 150, category: '型材' },
  { id: 5, name: 'Q235B 角钢 50*50*5', price: 3800, unit: '元/吨', specs: '莱钢', stock: 400, category: '型材' },
  { id: 6, name: 'Q235B 槽钢 10#', price: 3900, unit: '元/吨', specs: '日照', stock: 250, category: '型材' },
  { id: 7, name: 'Q195 焊管 48*3.0', price: 4150, unit: '元/吨', specs: '友发', stock: 600, category: '管材' },
  { id: 8, name: 'HRB400E 螺纹钢 Φ20', price: 3750, unit: '元/吨', specs: '沙钢', stock: 800, category: '建材' },
]

const categories = ['全部', '热轧板卷', '冷轧板卷', '中厚板', '型材', '管材', '建材']

export default function ProductsPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const pageSize = 8
  const startIndex = (currentPage - 1) * pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Filters */}
        <Card className="mb-6">
          <Space size="large" wrap>
            <Search
              placeholder="搜索商品名称..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
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
                options={categories.map((c) => ({ label: c, value: c }))}
              />
            </Space>
          </Space>
        </Card>

        {/* Product List */}
        <Row gutter={[16, 16]}>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <Col key={product.id} span={6}>
                <Link to={`/products/${product.id}`}>
                  <Card hoverable className="h-full">
                    <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <span className="text-5xl">🔩</span>
                    </div>
                    <Title level={5} className="!mb-2 !text-sm line-clamp-2">
                      {product.name}
                    </Title>
                    <Space className="mb-2">
                      <Tag color="blue">{product.category}</Tag>
                      <Tag>{product.specs}</Tag>
                    </Space>
                    <Paragraph className="!mb-1 text-gray-500 text-xs">
                      库存：{product.stock} 吨
                    </Paragraph>
                    <div className="text-red-500 font-bold text-lg">
                      ¥{product.price.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-1">{product.unit}</span>
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

        {/* Pagination */}
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
