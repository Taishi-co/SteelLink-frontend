import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Table, Button, Typography, Empty, message, Row, Col, Spin, Space } from 'antd'
import { DeleteOutlined, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useFavoriteStore } from '@/stores/favoriteStore'
import type { Favorite } from '@/types'

const { Title, Text } = Typography

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { items, isLoading, error, fetchFavorites, removeFavorite } = useFavoriteStore()
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  useEffect(() => {
    if (error && error.includes('401')) {
      setNotLoggedIn(true)
    }
  }, [error])

  const handleRemove = async (id: number) => {
    try {
      await removeFavorite(id)
      message.success('已取消收藏')
    } catch {
      message.error('操作失败')
    }
  }

  const handleLogin = () => {
    navigate('/login?redirect=/favorites')
  }

  const columns = [
    {
      title: '商品图片',
      key: 'image',
      width: 100,
      render: (_: unknown, record: Favorite) => (
        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {record.image ? (
            <img src={record.image} alt={record.productName} className="w-full h-full object-cover" />
          ) : (
            <ShoppingCartOutlined className="text-gray-400 text-2xl" />
          )}
        </div>
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'productName',
      key: 'name',
      render: (name: string, record: Favorite) => (
        <div>
          <Row gutter={12} align="middle">
            <Col span={24}>
              <Link to={`/products/${record.productId}`} className="text-gray-800 hover:text-primary-600 font-medium">
                {name}
              </Link>
            </Col>
            <Col span={24}>
              <Text type="secondary" className="text-xs">
                {record.spec}
              </Text>
            </Col>
            <Col span={24}>
              <Space size="small">
                <Text type="secondary" className="text-xs">
                  分类：{record.category}
                </Text>
                <Text type="secondary" className="text-xs">
                  卖家：{record.sellerName}
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
      title: '收藏时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (createdAt: string) => (
        <Text type="secondary" className="text-sm">
          {createdAt}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Favorite) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.id)}
        >
          取消收藏
        </Button>
      ),
    },
  ]

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
        <Title level={3} className="!mb-6 flex items-center gap-2">
          <HeartOutlined className="text-red-500" />
          我的收藏
        </Title>

        {notLoggedIn ? (
          <Card>
            <Empty
              description="请先登录查看收藏"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleLogin}>
                去登录
              </Button>
            </Empty>
          </Card>
        ) : items.length > 0 ? (
          <Card>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        ) : (
          <Card>
            <Empty
              description="收藏列表是空的"
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
