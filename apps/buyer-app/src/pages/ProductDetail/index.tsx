import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Button, InputNumber, Space, Divider, Descriptions, Tabs, message, Spin, Tag } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'

const { Title, Paragraph, Text } = Typography

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(10)
  const [activeTab, setActiveTab] = useState('specs')
  const [submitting, setSubmitting] = useState(false)

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const response = await productService.getProduct(Number(productId))
      return response.data
    },
    enabled: Boolean(productId),
  })

  const previewImage = useMemo(() => product?.images?.[0] || '', [product])
  const maxAvailableQty = useMemo(() => Math.max(product?.availableQty || 1, 1), [product])
  const safeQuantity = Math.min(Math.max(quantity, 1), maxAvailableQty)
  const canQuickOrder = useMemo(
    () => Boolean(product && product.minOrderQty > 0 && product.availableQty >= product.minOrderQty),
    [product],
  )
  const warehouseRegion = useMemo(
    () =>
      [product?.warehouseInfo?.province, product?.warehouseInfo?.city, product?.warehouseInfo?.district]
        .filter(Boolean)
        .join(' / ') || '-',
    [product],
  )

  const handleCreateOrder = async () => {
    if (!product) {
      return
    }
    if (!canQuickOrder) {
      message.warning('当前商品库存不足起订量，暂不可直接下单')
      return
    }

    setSubmitting(true)
    try {
      const response = await orderService.create({
        product_id: product.id,
        quantity: safeQuantity,
      })
      message.success('下单成功')
      navigate(`/orders/${response.id}`)
    } catch (error: any) {
      if (error?.response?.status === 401) {
        message.warning('请先登录后再下单')
        navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`)
        return
      }
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
                      {previewImage ? (
                        <img src={previewImage} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <span className="text-8xl">钢</span>
                      )}
                    </div>
                    {product.images?.length > 1 ? (
                      <div className="mt-3 grid grid-cols-4 gap-3">
                        {product.images.map((image) => (
                          <div key={image} className="h-20 overflow-hidden rounded border border-gray-200 bg-white">
                            <img src={image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Col>

                  <Col span={14}>
                    <Title level={3} className="!mb-2">
                      {product.name}
                    </Title>
                    <Space wrap className="mb-3">
                      <Tag color="blue">编号 {product.productNo || '-'}</Tag>
                      <Tag color="geekblue">规格 {product.spec?.spec || '-'}</Tag>
                      <Tag color="green">可售 {product.availableQty} 吨</Tag>
                      <Tag color={product.taxIncluded ? 'gold' : 'default'}>
                        {product.taxIncluded ? '含税报价' : '未税报价'}
                      </Tag>
                      <Tag color={canQuickOrder ? 'green' : 'red'}>
                        {canQuickOrder ? '可立即下单' : '库存不足起订量'}
                      </Tag>
                    </Space>

                    <div className="mb-4 rounded bg-gray-50 p-4">
                      <Text type="secondary">价格</Text>
                      <div className="text-3xl font-bold text-red-500">
                        ￥{product.unitPrice.toLocaleString()}
                        <span className="ml-2 text-base text-gray-400">/吨</span>
                      </div>
                    </div>

                    <Divider />

                    <Row gutter={[16, 16]} className="mb-6">
                      <Col span={12}>
                        <div className="h-full rounded-lg border border-gray-200 bg-white p-4">
                          <Text strong className="mb-3 block text-gray-800">
                            仓储信息
                          </Text>
                          <Descriptions column={1} size="small" colon={false}>
                            <Descriptions.Item label="钢厂">{product.steelMill || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库名称">{product.warehouseInfo?.warehouse_name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库编码">{product.warehouseInfo?.warehouse_code || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库地区">{warehouseRegion}</Descriptions.Item>
                            <Descriptions.Item label="仓库地址">{product.warehouseInfo?.address || '-'}</Descriptions.Item>
                            <Descriptions.Item label="捆包号">{product.bundleNo || '-'}</Descriptions.Item>
                          </Descriptions>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div className="h-full rounded-lg border border-gray-200 bg-white p-4">
                          <Text strong className="mb-3 block text-gray-800">
                            交易信息
                          </Text>
                          <Descriptions column={1} size="small" colon={false}>
                            <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
                            <Descriptions.Item label="材质">{product.spec?.material || '-'}</Descriptions.Item>
                            <Descriptions.Item label="起订量">{product.minOrderQty} 吨</Descriptions.Item>
                            <Descriptions.Item label="交货周期">{product.deliveryDays} 天</Descriptions.Item>
                            <Descriptions.Item label="报价有效期">{product.quoteValidity} 小时</Descriptions.Item>
                            <Descriptions.Item label="税率">{product.taxRate}%</Descriptions.Item>
                          </Descriptions>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-6">
                      <div className={`mb-3 rounded-lg border px-4 py-3 text-sm ${canQuickOrder ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                        {canQuickOrder
                          ? `当前商品可直接下单，最低起订量 ${product.minOrderQty} 吨，当前可售 ${product.availableQty} 吨。`
                          : `当前商品暂不可直接下单，最低起订量 ${product.minOrderQty} 吨，高于当前可售库存 ${product.availableQty} 吨。`}
                      </div>
                      <Space align="center">
                        <Text>采购数量：</Text>
                        <InputNumber
                          min={1}
                          max={maxAvailableQty}
                          value={safeQuantity}
                          onChange={(value) => setQuantity(value || 1)}
                          addonAfter="吨"
                        />
                        <Text type="secondary">
                          小计：<span className="font-bold text-red-500">￥{(safeQuantity * product.unitPrice).toLocaleString()}</span>
                        </Text>
                      </Space>
                    </div>

                    <Space size="large">
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        loading={submitting}
                        disabled={!canQuickOrder}
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

                    <div className="rounded-lg bg-gray-50 p-4">
                      <Text strong className="mb-3 block text-gray-800">
                        图文资料
                      </Text>
                      <Row gutter={[12, 12]}>
                        <Col span={product.images?.length ? 16 : 24}>
                          <Paragraph className="!mb-2 text-gray-500">多图预览</Paragraph>
                          {product.images?.length ? (
                            <div className="grid grid-cols-3 gap-3">
                              {product.images.map((image) => (
                                <div key={image} className="h-28 overflow-hidden rounded border border-gray-200 bg-white">
                                  <img src={image} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Text type="secondary">暂无商品图片</Text>
                          )}
                        </Col>
                        <Col span={product.images?.length ? 8 : 24}>
                          <Paragraph className="!mb-2 text-gray-500">质保资料</Paragraph>
                          {product.qualityCert ? (
                            <a href={product.qualityCert} target="_blank" rel="noreferrer">查看质保书</a>
                          ) : (
                            <Text type="secondary">暂无质保书</Text>
                          )}
                        </Col>
                      </Row>
                    </div>
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
                          <Descriptions.Item label="商品编号">{product.productNo || '-'}</Descriptions.Item>
                          <Descriptions.Item label="品类">{product.category}</Descriptions.Item>
                          <Descriptions.Item label="规格">{product.spec?.spec || '-'}</Descriptions.Item>
                          <Descriptions.Item label="材质">{product.spec?.material || '-'}</Descriptions.Item>
                          <Descriptions.Item label="库存">{product.availableQty} 吨</Descriptions.Item>
                          <Descriptions.Item label="起订量">{product.minOrderQty} 吨</Descriptions.Item>
                          <Descriptions.Item label="交货周期">{product.deliveryDays} 天</Descriptions.Item>
                          <Descriptions.Item label="报价有效期">{product.quoteValidity} 小时</Descriptions.Item>
                          <Descriptions.Item label="税率">{product.taxRate}%</Descriptions.Item>
                          <Descriptions.Item label="价格类型">{product.taxIncluded ? '含税价' : '未税价'}</Descriptions.Item>
                          <Descriptions.Item label="仓库">{product.warehouseInfo?.warehouse_name || '-'}</Descriptions.Item>
                          <Descriptions.Item label="仓库编码">{product.warehouseInfo?.warehouse_code || '-'}</Descriptions.Item>
                          <Descriptions.Item label="仓库地区">{warehouseRegion}</Descriptions.Item>
                          <Descriptions.Item label="仓库地址">{product.warehouseInfo?.address || '-'}</Descriptions.Item>
                          <Descriptions.Item label="质保书">
                            {product.qualityCert ? (
                              <a href={product.qualityCert} target="_blank" rel="noreferrer">查看质保书</a>
                            ) : '暂无'}
                          </Descriptions.Item>
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
