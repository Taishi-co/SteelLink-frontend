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
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#efe3d1]">
          {record.image ? (
            <img src={record.image} alt={record.productName} className="h-full w-full object-cover" />
          ) : (
            <ShoppingCartOutlined className="text-2xl text-[#214332]" />
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
              <Link to={`/products/${record.productId}`} className="font-semibold text-[#17221b] hover:text-[#9f5f23]">
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
          <Text className="font-mono font-bold text-[#b45324]">¥{price.toLocaleString()}</Text>
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
          <Text className="text-sm font-bold uppercase tracking-[0.28em] text-[#a4662c]">Favorites</Text>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <Title level={3} className="!mb-2 flex items-center gap-2 !font-black !text-[#17221b]">
                <HeartOutlined className="text-[#b45324]" />
                我的收藏
              </Title>
              <Text className="text-[#5f6b61]">集中管理关注商品，方便后续比价和下单。</Text>
            </div>
            <Link to="/products" className="font-semibold text-[#9f5f23]">返回商品列表</Link>
          </div>
        </div>

        {notLoggedIn ? (
          <Card className="reco-card rounded-[30px]">
            <Empty
              description="请先登录查看收藏"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleLogin} className="reco-primary-button rounded-full px-7">
                去登录
              </Button>
            </Empty>
          </Card>
        ) : items.length > 0 ? (
          <Card className="reco-card rounded-[30px]">
            <Table
              className="reco-soft-table"
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 820 }}
            />
          </Card>
        ) : (
          <Card className="reco-card rounded-[30px]">
            <Empty
              description="收藏列表是空的"
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
