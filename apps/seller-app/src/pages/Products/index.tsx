import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Input, Select, Modal, Form, InputNumber, message } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input

interface Product {
  id: number
  name: string
  category: string
  specs: string
  price: number
  stock: number
  status: 'online' | 'offline'
  sales: number
}

const mockProducts: Product[] = [
  { id: 1, name: 'Q235B 热轧板卷 3.0*1500*C', category: '热轧板卷', specs: '宝钢', price: 3850, stock: 500, status: 'online', sales: 1250 },
  { id: 2, name: 'SPCC 冷轧板卷 1.0*1250*C', category: '冷轧板卷', specs: '鞍钢', price: 4200, stock: 300, status: 'online', sales: 890 },
  { id: 3, name: 'Q345B 中厚板 20*2000*8000', category: '中厚板', specs: '首钢', price: 3950, stock: 200, status: 'online', sales: 560 },
  { id: 4, name: 'Q235B 工字钢 25#', category: '型材', specs: '马钢', price: 4100, stock: 150, status: 'offline', sales: 320 },
  { id: 5, name: 'Q235B 角钢 50*50*5', category: '型材', specs: '莱钢', price: 3800, stock: 0, status: 'offline', sales: 180 },
]

const categories = ['全部', '热轧板卷', '冷轧板卷', '中厚板', '型材', '管材', '建材']

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = categoryFilter === '全部' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleSaveProduct = () => {
    form.validateFields().then((values) => {
      const newProduct: Product = {
        id: products.length + 1,
        ...values,
        status: 'online',
        sales: 0,
      }
      setProducts([...products, newProduct])
      setIsModalOpen(false)
      message.success('商品发布成功')
    })
  }

  const handleToggleStatus = (id: number) => {
    setProducts(products.map((p) =>
      p.id === id ? { ...p, status: p.status === 'online' ? 'offline' : 'online' } : p
    ))
    message.success('状态更新成功')
  }

  const columns: ColumnsType<Product> = [
    { title: '商品名称', dataIndex: 'name', key: 'name', width: 250 },
    { title: '品类', dataIndex: 'category', key: 'category', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: '规格', dataIndex: 'specs', key: 'specs' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v) => `¥${v}/吨` },
    { title: '库存', dataIndex: 'stock', key: 'stock', render: (v) => `${v} 吨` },
    { title: '销量', dataIndex: 'sales', key: 'sales', render: (v) => `${v} 吨` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'green' : 'default'}>
          {status === 'online' ? '在售' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === 'online' ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="商品管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            发布商品
          </Button>
        }
      >
        <Space className="mb-4">
          <Search
            placeholder="搜索商品"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            prefix={<SearchOutlined />}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            options={categories.map((c) => ({ label: c, value: c }))}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="发布商品"
        open={isModalOpen}
        onOk={handleSaveProduct}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="category" label="品类" rules={[{ required: true }]}>
            <Select
              placeholder="请选择品类"
              options={categories.filter((c) => c !== '全部').map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="specs" label="规格/品牌" rules={[{ required: true }]}>
            <Input placeholder="如：宝钢、鞍钢等" />
          </Form.Item>
          <Form.Item name="price" label="单价（元/吨）" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="stock" label="库存（吨）" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" placeholder="请输入库存数量" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
