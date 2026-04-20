import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Row, Col, Typography, Button, InputNumber, Space, Divider, Descriptions, Tabs, message } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const mockProduct = {
  id: 1,
  name: 'Q235B 热轧板卷 3.0*1500*C',
  price: 3850,
  unit: '元/吨',
  specs: '宝钢',
  stock: 500,
  category: '热轧板卷',
  description: 'Q235B热轧板卷，厚度3.0mm，宽度1500mm，卷材。适用于机械制造、建筑结构、车辆制造等领域。',
  parameters: [
    { label: '材质', value: 'Q235B' },
    { label: '厚度', value: '3.0mm' },
    { label: '宽度', value: '1500mm' },
    { label: '产地', value: '宝钢' },
    { label: '执行标准', value: 'GB/T 3274-2017' },
    { label: '表面处理', value: '酸洗' },
  ],
  seller: {
    name: '上海钢铁贸易有限公司',
    location: '上海市宝山区',
    rating: 4.8,
  },
}

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(10)
  const [activeTab, setActiveTab] = useState('specs')

  const handleAddToCart = () => {
    message.success(`已添加 ${quantity} 吨到购物车`)
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-4 text-gray-500">
          <Link to="/">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/products">商品列表</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{mockProduct.name} (ID: {productId})</span>
        </div>

        {/* Product Info */}
        <Card className="mb-6">
          <Row gutter={24}>
            {/* Product Image */}
            <Col span={10}>
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <span className="text-8xl">🔩</span>
              </div>
            </Col>

            {/* Product Details */}
            <Col span={14}>
              <Title level={3} className="!mb-2">{mockProduct.name}</Title>
              <Space className="mb-4">
                <Text type="secondary">品牌：{mockProduct.specs}</Text>
                <Divider type="vertical" />
                <Text type="secondary">库存：{mockProduct.stock} 吨</Text>
              </Space>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <Text type="secondary">价格</Text>
                <div className="text-red-500 font-bold text-3xl">
                  ¥{mockProduct.price.toLocaleString()}
                  <span className="text-base text-gray-400 ml-2">{mockProduct.unit}</span>
                </div>
              </div>

              <Divider />

              {/* Quantity Selector */}
              <div className="mb-6">
                <Space align="center">
                  <Text>采购数量：</Text>
                  <InputNumber
                    min={1}
                    max={mockProduct.stock}
                    value={quantity}
                    onChange={(v) => setQuantity(v || 1)}
                    addonAfter="吨"
                  />
                  <Text type="secondary">
                    小计：<span className="text-red-500 font-bold">¥{((quantity * mockProduct.price)).toLocaleString()}</span>
                  </Text>
                </Space>
              </div>

              {/* Actions */}
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                >
                  加入购物车
                </Button>
                <Button size="large" icon={<HeartOutlined />}>
                  收藏
                </Button>
                <Button size="large" icon={<ShareAltOutlined />}>
                  分享
                </Button>
              </Space>

              <Divider />

              {/* Seller Info */}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="供应商">{mockProduct.seller.name}</Descriptions.Item>
                <Descriptions.Item label="所在地">{mockProduct.seller.location}</Descriptions.Item>
                <Descriptions.Item label="评分">{mockProduct.seller.rating} 分</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Product Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'specs',
                label: '规格参数',
                children: (
                  <Descriptions bordered column={2}>
                    {mockProduct.parameters.map((param, index) => (
                      <Descriptions.Item key={index} label={param.label}>
                        {param.value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ),
              },
              {
                key: 'description',
                label: '商品描述',
                children: (
                  <Paragraph className="text-gray-600">
                    {mockProduct.description}
                  </Paragraph>
                ),
              },
              {
                key: 'shipping',
                label: '配送说明',
                children: (
                  <div className="text-gray-600">
                    <Paragraph>1. 本商品支持自提和配送两种方式。</Paragraph>
                    <Paragraph>2. 上海市内订单满50吨免费配送，其他地区运费另议。</Paragraph>
                    <Paragraph>3. 下单后2个工作日内安排发货。</Paragraph>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  )
}
