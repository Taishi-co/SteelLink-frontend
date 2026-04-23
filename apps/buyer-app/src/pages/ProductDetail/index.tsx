import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, Row, Col, Typography, Button, InputNumber, Space, Divider, Descriptions, Tabs, message, Spin } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons'
import api from '@/services/api'
import { orderService } from '@/services/orderService'

const { Title, Paragraph, Text } = Typography

interface ProductDetail {
  id: number
  sku_id: string
  name: string
  price: number
  unit: string
  specs: string
  stock: number
  visible_stock: number
  category: string
  description: string
  image_urls: string[]
  seller_name: string
  seller_uid: string
}

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(10)
  const [activeTab, setActiveTab] = useState('specs')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState<ProductDetail | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        return
      }

      setLoading(true)
      try {
        const response = await api.get<ProductDetail, ProductDetail>(`/products/${productId}`)
        setProduct(response)
      } catch (error) {
        message.error('商品详情加载失败')
      } finally {
        setLoading(false)
      }
    }

    void loadProduct()
  }, [productId])

  const handleCreateOrder = async () => {
    if (!product) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录后再下单')
      navigate('/login')
      return
    }

    setSubmitting(true)
    try {
      const response = await orderService.create({
        product_id: product.id,
        quantity,
      })
      message.success('下单成功')
      navigate(`/orders/${response.id}`)
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message
      message.error(serverMessage || '下单失败，请先登录并确认库存')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 text-gray-500">
          <Link to="/">首页</Link>
          <span className="mx-2">/</span>
          <Link to="/products">商品列表</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product?.name || `商品 ${productId}`}</span>
        </div>

        <Spin spinning={loading}>
          {product ? (
            <>
              <Card className="mb-6">
                <Row gutter={24}>
                  <Col span={10}>
                    <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-8xl">钢</span>
                    </div>
                  </Col>

                  <Col span={14}>
                    <Title level={3} className="!mb-2">
                      {product.name}
                    </Title>
                    <Space className="mb-4">
                      <Text type="secondary">SKU：{product.sku_id}</Text>
                      <Divider type="vertical" />
                      <Text type="secondary">规格：{product.specs}</Text>
                      <Divider type="vertical" />
                      <Text type="secondary">库存：{product.visible_stock} 吨</Text>
                    </Space>

                    <div className="mb-4 rounded bg-gray-50 p-4">
                      <Text type="secondary">价格</Text>
                      <div className="text-3xl font-bold text-red-500">
                        ￥{product.price.toLocaleString()}
                        <span className="ml-2 text-base text-gray-400">{product.unit}</span>
                      </div>
                    </div>

                    <Divider />

                    <div className="mb-6">
                      <Space align="center">
                        <Text>采购数量：</Text>
                        <InputNumber
                          min={1}
                          max={product.visible_stock}
                          value={quantity}
                          onChange={(value) => setQuantity(value || 1)}
                          addonAfter="吨"
                        />
                        <Text type="secondary">
                          小计：<span className="font-bold text-red-500">￥{(quantity * product.price).toLocaleString()}</span>
                        </Text>
                      </Space>
                    </div>

                    <Space size="large">
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        loading={submitting}
                        onClick={() => void handleCreateOrder()}
                      >
                        立即下单
                      </Button>
                      <Button size="large" icon={<HeartOutlined />}>
                        收藏
                      </Button>
                      <Button size="large" icon={<ShareAltOutlined />}>
                        分享
                      </Button>
                    </Space>

                    <Divider />

                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="卖家">{product.seller_name}</Descriptions.Item>
                      <Descriptions.Item label="卖家 UID">{product.seller_uid}</Descriptions.Item>
                      <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>

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
                          <Descriptions.Item label="商品 ID">{product.id}</Descriptions.Item>
                          <Descriptions.Item label="SKU">{product.sku_id}</Descriptions.Item>
                          <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
                          <Descriptions.Item label="规格">{product.specs}</Descriptions.Item>
                          <Descriptions.Item label="库存">{product.visible_stock} 吨</Descriptions.Item>
                          <Descriptions.Item label="单位">{product.unit}</Descriptions.Item>
                        </Descriptions>
                      ),
                    },
                    {
                      key: 'description',
                      label: '商品描述',
                      children: <Paragraph className="text-gray-600">{product.description}</Paragraph>,
                    },
                    {
                      key: 'shipping',
                      label: '交易说明',
                      children: (
                        <div className="text-gray-600">
                          <Paragraph>1. 仅审核通过商品会进入买家可见范围。</Paragraph>
                          <Paragraph>2. 提交订单后会生成唯一订单号，并同步扣减可售库存。</Paragraph>
                          <Paragraph>3. 当前页面已接入真实后端接口，可直接用于本地联调。</Paragraph>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </>
          ) : null}
        </Spin>
      </div>
    </div>
  )
}
