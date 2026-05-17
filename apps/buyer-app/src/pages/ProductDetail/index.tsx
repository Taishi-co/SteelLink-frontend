import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Button, InputNumber, Space, Divider, Descriptions, Tabs, message, Spin, Tag } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons'
import { getErrorMessage, getErrorStatus } from '@steellink/shared/utils'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { useCartStore } from '@/stores/cartStore'
import { useFavoriteStore } from '@/stores/favoriteStore'

const { Title, Paragraph, Text } = Typography

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(10)
  const [activeTab, setActiveTab] = useState('specs')
  const [submitting, setSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const { addItem: addToCart } = useCartStore()
  const { addFavorite, removeByProduct, checkFavorite } = useFavoriteStore()

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const response = await productService.getProduct(Number(productId))
      return response.data
    },
    enabled: Boolean(productId),
  })

  useEffect(() => {
    if (productId && product) {
      checkFavorite(Number(productId)).then((fav) => {
        setIsFavorite(fav)
      })
    }
  }, [productId, product, checkFavorite])

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
    } catch (error: unknown) {
      if (getErrorStatus(error) === 401) {
        message.warning('请先登录后再下单')
        navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`)
        return
      }
      message.error(getErrorMessage(error, '下单失败，请先登录并确认库存'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await addToCart(product.id, safeQuantity)
      message.success('已加入购物车')
    } catch (error: unknown) {
      if (getErrorStatus(error) === 401) {
        message.warning('请先登录后再加入购物车')
        navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`)
        return
      }
      message.error(getErrorMessage(error, '加入购物车失败'))
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    try {
      if (isFavorite) {
        await removeByProduct(product.id)
        message.success('已取消收藏')
      } else {
        await addFavorite(product.id)
        message.success('已添加收藏')
      }
      setIsFavorite(!isFavorite)
    } catch (error: unknown) {
      if (getErrorStatus(error) === 401) {
        message.warning('请先登录后再收藏')
        navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`)
        return
      }
      message.error(getErrorMessage(error, '操作失败'))
    }
  }

  return (
    <div className="reco-shell py-8">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-5 text-sm font-medium text-[#7a847a]">
          <Link to="/" className="text-[#9f5f23]">首页</Link>
          <span className="mx-2 text-[#c7b596]">/</span>
          <Link to="/products" className="text-[#9f5f23]">商品列表</Link>
          <span className="mx-2 text-[#c7b596]">/</span>
          <span className="text-[#38463b]">{product?.name || `商品 ${productId}`}</span>
        </div>

        <Spin spinning={loading}>
          {product ? (
            <>
              <Card className="reco-card mb-6 rounded-[30px]">
                <Row gutter={[28, 28]}>
                  <Col xs={24} lg={10}>
                    <div className="flex h-96 items-center justify-center overflow-hidden rounded-[26px] bg-[#efe3d1]">
                      {previewImage ? (
                        <img src={previewImage} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-8xl font-black text-[#214332]">钢</span>
                      )}
                    </div>
                    {product.images?.length > 1 ? (
                      <div className="mt-3 grid grid-cols-4 gap-3">
                        {product.images.map((image) => (
                          <div key={image} className="h-20 overflow-hidden rounded-2xl border border-[#eadcc7] bg-white">
                            <img src={image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Col>

                  <Col xs={24} lg={14}>
                    <Title level={3} className="!mb-2 !font-black !text-[#17221b]">
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
                      <Tag color={product.titleConfirmed ? 'green' : 'default'}>
                        {product.titleConfirmed ? '仓库确权' : '未确权'}
                      </Tag>
                    </Space>

                    <div className="mb-4 rounded-[22px] border border-[#eadcc7] bg-[#f8f0e4] p-5">
                      <Text className="text-sm font-semibold text-[#7a847a]">价格</Text>
                      <div className="text-3xl font-black text-[#b45324]">
                        ￥{product.unitPrice.toLocaleString()}
                        <span className="ml-2 text-base text-[#7a847a]">/吨</span>
                      </div>
                    </div>

                    <Divider className="border-[#eadcc7]" />

                    <Row gutter={[16, 16]} className="mb-6">
                      <Col xs={24} md={12}>
                        <div className="h-full rounded-[22px] border border-[#eadcc7] bg-white/70 p-4">
                          <Text strong className="mb-3 block text-[#17221b]">
                            仓储信息
                          </Text>
                          <Descriptions column={1} size="small" colon={false}>
                            <Descriptions.Item label="钢厂">{product.steelMill || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库名称">{product.warehouseInfo?.warehouse_name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库编码">{product.warehouseInfo?.warehouse_code || '-'}</Descriptions.Item>
                            <Descriptions.Item label="仓库地区">{warehouseRegion}</Descriptions.Item>
                            <Descriptions.Item label="仓库地址">{product.warehouseInfo?.address || '-'}</Descriptions.Item>
                            <Descriptions.Item label="绑定仓储">
                              {product.warehouseServiceId ? (
                                <Link to={`/warehouses/${product.warehouseServiceId}`}>仓储资源 #{product.warehouseServiceId}</Link>
                              ) : (
                                '-'
                              )}
                            </Descriptions.Item>
                          </Descriptions>
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div className="h-full rounded-[22px] border border-[#eadcc7] bg-white/70 p-4">
                          <Text strong className="mb-3 block text-[#17221b]">
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
                      <div className={`mb-3 rounded-[18px] border px-4 py-3 text-sm ${canQuickOrder ? 'border-[#bfd2c4] bg-[#edf6ef] text-[#2f6b49]' : 'border-[#f0c0ad] bg-[#fff1ec] text-[#b45324]'}`}>
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
                          小计：<span className="font-bold text-[#b45324]">￥{(safeQuantity * product.unitPrice).toLocaleString()}</span>
                        </Text>
                      </Space>
                    </div>

                    <Space size="middle" wrap>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        loading={submitting}
                        disabled={!canQuickOrder}
                        onClick={() => void handleCreateOrder()}
                        className="reco-primary-button rounded-full px-7"
                      >
                        立即下单
                      </Button>
                      <Button
                        type="default"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        className="rounded-full border-[#d0b991] bg-white px-7"
                      >
                        加入购物车
                      </Button>
                      <Button
                        type={isFavorite ? 'primary' : 'default'}
                        size="large"
                        icon={<HeartOutlined />}
                        onClick={handleToggleFavorite}
                        danger={isFavorite}
                        className="rounded-full px-6"
                      >
                        {isFavorite ? '已收藏' : '收藏'}
                      </Button>
                      <Button size="large" icon={<ShareAltOutlined />} className="rounded-full px-6">
                        分享
                      </Button>
                    </Space>

                    <Divider className="border-[#eadcc7]" />

                    <div className="rounded-[22px] border border-[#eadcc7] bg-[#f8f0e4] p-4">
                      <Text strong className="mb-3 block text-[#17221b]">
                        图文资料
                      </Text>
                      <Row gutter={[12, 12]}>
                        <Col span={product.images?.length ? 16 : 24}>
                          <Paragraph className="!mb-2 text-[#7a847a]">多图预览</Paragraph>
                          {product.images?.length ? (
                            <div className="grid grid-cols-3 gap-3">
                              {product.images.map((image) => (
                                <div key={image} className="h-28 overflow-hidden rounded-2xl border border-[#eadcc7] bg-white">
                                  <img src={image} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Text type="secondary">暂无商品图片</Text>
                          )}
                        </Col>
                        <Col span={product.images?.length ? 8 : 24}>
                          <Paragraph className="!mb-2 text-[#7a847a]">质保资料</Paragraph>
                          {product.qualityCert ? (
                            <a href={product.qualityCert} target="_blank" rel="noreferrer">查看质保书</a>
                          ) : (
                            <Text type="secondary">暂无质保书</Text>
                          )}
                          <Paragraph className="!mb-2 !mt-4 text-[#7a847a]">货权/仓单监管凭证</Paragraph>
                          {product.titleVoucherUrl ? (
                            <a href={product.titleVoucherUrl} target="_blank" rel="noreferrer">查看确权凭证</a>
                          ) : (
                            <Text type="secondary">暂无确权凭证</Text>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Card className="reco-card rounded-[30px]">
                <Tabs
                  className="reco-soft-tabs"
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
                          <Descriptions.Item label="绑定仓储资源">
                            {product.warehouseServiceId ? (
                              <Link to={`/warehouses/${product.warehouseServiceId}`}>#{product.warehouseServiceId}</Link>
                            ) : '未绑定'}
                          </Descriptions.Item>
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
                      children: <Paragraph className="text-[#5f6b61]">{product.description}</Paragraph>,
                    },
                    {
                      key: 'shipping',
                      label: '交易说明',
                      children: (
                        <div className="text-[#5f6b61]">
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
