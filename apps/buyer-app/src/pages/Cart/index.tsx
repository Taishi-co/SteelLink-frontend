import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Table, Button, InputNumber, Space, Typography, Empty, Divider, message, Checkbox, Tag, Row, Col } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined, SafetyCertificateOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface CartItem {
  id: number
  name: string
  specs: string
  price: number
  quantity: number
  seller: string
  mill: string
  warehouse: string
  bundleNos: string[]
  checked: boolean
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: '热轧卷板 SPHC 3.0×1250×C',
    specs: '材质：SPHC | 厚度：3.0mm | 宽度：1250mm',
    price: 3850,
    quantity: 100,
    seller: '河钢集团唐山分公司',
    mill: '河钢集团',
    warehouse: '唐山仓库A区',
    bundleNos: ['HB-2026-0420-0001', 'HB-2026-0420-0002'],
    checked: true,
  },
  {
    id: 2,
    name: '螺纹钢 HRB400E Φ16mm',
    specs: '材质：HRB400E | 规格：Φ16mm',
    price: 3580,
    quantity: 500,
    seller: '唐山松汀钢铁有限公司',
    mill: '唐山松汀',
    warehouse: '唐山仓库A区',
    bundleNos: ['TS-2026-0420-0001'],
    checked: true,
  },
  {
    id: 3,
    name: '冷轧卷板 SPCC 1.0×1000mm',
    specs: '材质：SPCC | 厚度：1.0mm | 宽度：1000mm',
    price: 4320,
    quantity: 50,
    seller: '首钢京唐钢铁联合有限公司',
    mill: '首钢京唐',
    warehouse: '石家庄仓库',
    bundleNos: ['SJ-2026-0420-0001'],
    checked: false,
  },
]

export default function CartPage() {
  const navigate = useNavigate()
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

  const toggleCheck = (id: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const toggleCheckAll = (checked: boolean) => {
    setCartItems(items => items.map(item => ({ ...item, checked })))
  }

  const checkedItems = cartItems.filter(item => item.checked)
  const totalPrice = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQuantity = checkedItems.reduce((sum, item) => sum + item.quantity, 0)

  const columns = [
    {
      title: (
        <Checkbox
          checked={cartItems.length > 0 && checkedItems.length === cartItems.length}
          indeterminate={checkedItems.length > 0 && checkedItems.length < cartItems.length}
          onChange={(e) => toggleCheckAll(e.target.checked)}
        />
      ),
      key: 'check',
      width: 60,
      render: (_: unknown, record: CartItem) => (
        <Checkbox
          checked={record.checked}
          onChange={() => toggleCheck(record.id)}
        />
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CartItem) => (
        <div>
          <Row gutter={12} align="middle">
            <Col span={24}>
              <Link to={`/products/${record.id}`} className="text-gray-800 hover:text-primary-600 font-medium">
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
                  钢厂：{record.mill}
                </Text>
                <Text type="secondary" className="text-xs">
                  仓库：{record.warehouse}
                </Text>
              </Space>
            </Col>
            <Col span={24} className="mt-1">
              <Space size="small">
                {record.bundleNos.map((no, idx) => (
                  <Tag key={idx} color="blue" className="text-xs">
                    {no}
                  </Tag>
                ))}
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
          onChange={(v) => updateQuantity(record.id, v || 1)}
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
          onClick={() => removeItem(record.id)}
        >
          删除
        </Button>
      ),
    },
  ]

  const handleCheckout = () => {
    if (checkedItems.length === 0) {
      message.warning('请选择要结算的商品')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        <Title level={3} className="!mb-6">采购清单</Title>

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

            <Card className="sticky bottom-0 z-10 shadow-lg">
              <Row gutter={24} align="middle">
                <Col span={12}>
                  <Space size="middle">
                    <Text type="secondary">
                      已选 <Text className="text-primary-600 font-bold">{checkedItems.length}</Text> 种商品
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                      总重量：<Text className="font-bold">{totalQuantity.toLocaleString()}</Text> 吨
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
                      disabled={checkedItems.length === 0}
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
