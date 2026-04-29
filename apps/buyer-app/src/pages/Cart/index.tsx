import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Table, Button, InputNumber, Space, Typography, Empty, Divider, message, Row, Col, Spin } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
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

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'productName',
      key: 'name',
      render: (name: string, record: CartItem) => (
        <div>
          <Row gutter={12} align="middle">
            <Col span={24}>
              <Link to={`/products/${record.productId}`} className="text-gray-800 hover:text-primary-600 font-medium">
                {name}
              </Link>
            </Col>
            <Col span={24}>
              <Text type="secondary" className="text-xs">
                {record.specs}
              </Text>
            </Col>
            <Col span={24}>
              <Space size="small">
                <Text type="secondary" className="text-xs">
                  <ShoppingCartOutlined className="mr-1" />
                  卖家：{record.seller}
                </Text>
              </Space>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price: number) => (
        <div className="text-right">
          <Text className="text-red-500 font-bold font-mono">¥{price.toLocaleString()}</Text>
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
          <Text className="text-red-500 font-bold font-mono text-lg">
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
      <div className="bg-gray-50 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        <Title level={3} className="!mb-6">采购清单</Title>

        {items.length > 0 ? (
          <>
            <Card className="mb-6">
              <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                pagination={false}
              />
            </Card>

            <Card className="sticky bottom-0 z-10 shadow-lg">
              <Row gutter={24} align="middle">
                <Col span={12}>
                  <Space size="middle">
                    <Text type="secondary">
                      共 <Text className="text-primary-600 font-bold">{items.length}</Text> 种商品
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      总重量：<Text className="font-bold">{totalItems.toLocaleString()}</Text> 吨
                    </Text>
                  </Space>
                </Col>
                <Col span={12} className="text-right">
                  <Space size="middle">
                    <div>
                      <Text type="secondary">应付总额：</Text>
                      <Text className="text-red-600 font-bold text-3xl font-mono">
                        ¥{totalPrice.toLocaleString()}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                      className="h-12 px-8 text-lg"
                    >
                      去结算
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card title="重要提示" className="mt-4">
              <Space direction="vertical" className="w-full" size="small">
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="text-blue-500 mt-0.5" />
                  <div>
                    <Text className="font-medium text-sm">库存锁定说明</Text>
                    <Text type="secondary" className="text-xs block">
                      采购清单仅作展示，不锁定库存。提交订单后，系统将自动锁定对应捆包号库存 24 小时，超时未付款自动解锁。
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <SafetyCertificateOutlined className="text-blue-500 mt-0.5" />
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
          <Card>
            <Empty
              description="采购清单是空的"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/products">
                <Button type="primary">去商城选购</Button>
              </Link>
            </Empty>
          </Card>
        )}
      </div>
    </div>
  )
}
