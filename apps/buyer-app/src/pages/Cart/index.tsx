import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Table, Button, InputNumber, Space, Typography, Empty, Divider, message, Row, Col, Spin, Image, Tag } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined, SafetyCertificateOutlined, ShopOutlined } from '@ant-design/icons'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/types'

const { Title, Text } = Typography

export default function CartPage() {
  const navigate = useNavigate()
  const { items, totalItems, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleQuantityChange = async (id: number, quantity: number) => {
    try {
      await updateQuantity(id, quantity)
      message.success('数量已更新')
    } catch {
      message.error('更新失败')
    }
  }

  const handleRemove = async (id: number) => {
    try {
      await removeItem(id)
      message.success('商品已移除')
    } catch {
      message.error('删除失败')
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const formatWarehouseAddress = (record: CartItem) => {
    const warehouse = record.warehouseInfo
    if (!warehouse) {
      return ''
    }
    return [warehouse.province, warehouse.city, warehouse.district, warehouse.address].filter(Boolean).join('')
  }

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'productName',
      key: 'name',
      render: (name: string, record: CartItem) => (
        <div className="flex min-w-[320px] items-start gap-3">
          <Image
            src={record.imageUrl}
            alt={name}
            width={72}
            height={72}
            className="rounded-2xl bg-[#efe3d1] object-cover"
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Crect width='72' height='72' fill='%23f3f4f6'/%3E%3Cpath d='M18 49h36l-8-13-8 9-6-7-14 11Z' fill='%23cbd5e1'/%3E%3Ccircle cx='26' cy='25' r='5' fill='%23cbd5e1'/%3E%3C/svg%3E"
            preview={false}
          />
          <div className="min-w-0 flex-1">
            <Link to={`/products/${record.productId}`} className="font-semibold text-[#17221b] hover:text-[#9f5f23]">
              {name}
            </Link>
            <Text type="secondary" className="text-xs block mt-1">
              {record.specs || '暂无规格'}
            </Text>
            <Text type="secondary" className="text-xs block mt-1">
              <ShoppingCartOutlined className="mr-1" />
              卖家：{record.seller || '暂无卖家信息'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '可发货仓库',
      key: 'warehouse',
      width: 260,
      render: (_: unknown, record: CartItem) => {
        const warehouse = record.warehouseInfo
        const address = formatWarehouseAddress(record)
        if (!warehouse?.warehouse_name) {
          return <Tag color="default">暂无绑定仓库</Tag>
        }
        return (
          <Space direction="vertical" size={2}>
            <Text className="text-sm font-medium">
              <ShopOutlined className="mr-1 text-[#2f6b49]" />
              {warehouse.warehouse_name}
            </Text>
            {warehouse.warehouse_code ? (
              <Text type="secondary" className="text-xs">仓库编码：{warehouse.warehouse_code}</Text>
            ) : null}
            {address ? <Text type="secondary" className="text-xs">{address}</Text> : null}
          </Space>
        )
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price: number) => (
        <div className="text-right">
          <Text className="font-mono font-bold text-[#b45324]">¥{price.toLocaleString()}</Text>
          <Text type="secondary" className="text-xs block">元/吨</Text>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 160,
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(v) => v && handleQuantityChange(record.id, v)}
          addonAfter="吨"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 160,
      render: (_: unknown, record: CartItem) => (
        <div className="text-right">
          <Text className="font-mono text-lg font-bold text-[#b45324]">
            ¥{(record.price * record.quantity).toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.id)}
        >
          删除
        </Button>
      ),
    },
  ]

  const handleCheckout = () => {
    if (items.length === 0) {
      message.warning('采购清单为空')
      return
    }
    navigate('/checkout')
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="reco-shell py-8">
        <div className="mx-auto flex h-64 max-w-7xl items-center justify-center px-6">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="reco-shell py-8">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-6 rounded-[30px] border border-[#eadcc7] bg-[#fffaf1] p-7 shadow-sm">
          <Text className="text-sm font-bold uppercase tracking-[0.28em] text-[#a4662c]">Cart</Text>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <Title level={3} className="!mb-2 !font-black !text-[#17221b]">采购清单</Title>
              <Text className="text-[#5f6b61]">核对商品、仓库、数量和金额后进入订单确认。</Text>
            </div>
            <Link to="/products" className="font-semibold text-[#9f5f23]">继续选购</Link>
          </div>
        </div>

        {items.length > 0 ? (
          <>
            <Card className="reco-card mb-6 rounded-[30px]">
              <Table
                className="reco-soft-table"
                columns={columns}
                dataSource={items}
                rowKey="id"
                pagination={false}
                scroll={{ x: 980 }}
              />
            </Card>

            <Card className="reco-card sticky bottom-0 z-10 rounded-[28px] shadow-[0_16px_44px_rgba(64,44,25,.12)]">
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} md={12}>
                  <Space size="middle">
                    <Text type="secondary">
                      共 <Text className="font-bold text-[#2f6b49]">{items.length}</Text> 种商品
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      总重量：<Text className="font-bold">{totalItems.toLocaleString()}</Text> 吨
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} md={12} className="text-left md:text-right">
                  <Space size="middle">
                    <div>
                      <Text type="secondary">应付总额：</Text>
                      <Text className="font-mono text-3xl font-bold text-[#b45324]">
                        ¥{totalPrice.toLocaleString()}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                      className="reco-primary-button h-12 rounded-full px-8 text-lg"
                    >
                      去结算
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card title="重要提示" className="reco-card mt-4 rounded-[28px]">
              <Space direction="vertical" className="w-full" size="small">
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="mt-0.5 text-[#2f6b49]" />
                  <div>
                    <Text className="font-medium text-sm">库存锁定说明</Text>
                    <Text type="secondary" className="text-xs block">
                      采购清单仅作展示，不锁定库存。提交订单后，系统将自动锁定对应捆包号库存 24 小时，超时未付款自动解锁。
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="mt-0.5 text-[#2f6b49]" />
                  <div>
                    <Text className="font-medium text-sm">捆包号说明</Text>
                    <Text type="secondary" className="text-xs block">
                      捆包号是钢材货物的唯一身份标识，用于货权核验和质押管控，请在下单前仔细核对。
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </>
        ) : (
          <Card className="reco-card rounded-[30px]">
            <Empty
              description="采购清单是空的"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/products">
                <Button type="primary" className="reco-primary-button rounded-full px-7">去商城选购</Button>
              </Link>
            </Empty>
          </Card>
        )}
      </div>
    </div>
  )
}
