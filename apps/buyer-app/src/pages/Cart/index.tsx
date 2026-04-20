import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Table, Button, InputNumber, Space, Typography, Empty, Divider, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface CartItem {
  id: number
  name: string
  specs: string
  price: number
  quantity: number
  seller: string
}

const mockCartItems: CartItem[] = [
  { id: 1, name: 'Q235B 热轧板卷 3.0*1500*C', specs: '宝钢', price: 3850, quantity: 10, seller: '上海钢铁贸易有限公司' },
  { id: 2, name: 'SPCC 冷轧板卷 1.0*1250*C', specs: '鞍钢', price: 4200, quantity: 5, seller: '鞍山钢材经销部' },
  { id: 3, name: 'Q345B 中厚板 20*2000*8000', specs: '首钢', price: 3950, quantity: 20, seller: '北京物资配送中心' },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems)

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
    message.success('商品已移除')
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CartItem) => (
        <div>
          <Link to={`/products/${record.id}`} className="text-gray-800 hover:text-primary-600 font-medium">
            {name}
          </Link>
          <div className="text-gray-400 text-xs mt-1">
            {record.specs} | {record.seller}
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text className="text-red-500 font-medium">¥{price.toLocaleString()}/吨</Text>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(v) => updateQuantity(record.id, v || 1)}
          addonAfter="吨"
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: unknown, record: CartItem) => (
        <Text className="text-red-500 font-bold">
          ¥{(record.price * record.quantity).toLocaleString()}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.id)}
        >
          删除
        </Button>
      ),
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        <Title level={3} className="!mb-6">购物车</Title>

        {cartItems.length > 0 ? (
          <>
            <Card className="mb-6">
              <Table
                columns={columns}
                dataSource={cartItems}
                rowKey="id"
                pagination={false}
              />
            </Card>

            <Card>
              <div className="flex justify-between items-center">
                <Space>
                  <Text type="secondary">共 {cartItems.length} 种商品</Text>
                  <Divider type="vertical" />
                  <Text type="secondary">
                    总重量：{cartItems.reduce((sum, item) => sum + item.quantity, 0)} 吨
                  </Text>
                </Space>
                <Space size="large">
                  <div className="text-right">
                    <Text type="secondary">应付总额：</Text>
                    <Text className="text-red-500 font-bold text-2xl">
                      ¥{totalPrice.toLocaleString()}
                    </Text>
                  </div>
                  <Button type="primary" size="large">
                    去结算
                  </Button>
                </Space>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <Empty
              description="购物车是空的"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link to="/products">
                <Button type="primary">去购物</Button>
              </Link>
            </Empty>
          </Card>
        )}
      </div>
    </div>
  )
}
