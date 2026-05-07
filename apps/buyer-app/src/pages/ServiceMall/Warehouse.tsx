import { useState } from 'react'
import { Button, Card, Col, Empty, Input, Row, Space, Spin, Tag, Typography } from 'antd'
import { HomeOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

export default function WarehouseMallPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [draftKeyword, setDraftKeyword] = useState(searchParams.get('keyword') ?? '')
  const [province, setProvince] = useState(searchParams.get('province') ?? '')

  const { data, isLoading } = useQuery({
    queryKey: ['public-warehouse-services', keyword, province],
    queryFn: () => serviceOfferService.listWarehouses({
      page_size: 24,
      keyword: keyword || undefined,
      province: province || undefined,
    }),
  })
  const rows = data?.data.list ?? []

  const applySearch = (nextKeyword: string) => {
    setKeyword(nextKeyword)
    const next = new URLSearchParams(searchParams)
    if (nextKeyword) {
      next.set('keyword', nextKeyword)
    } else {
      next.delete('keyword')
    }
    if (province) {
      next.set('province', province)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Title level={3} className="!mb-1">仓储资源</Title>
            <Text type="secondary">展示平台已审核通过的仓储方资源，后续可用于订单仓库确认和履约协同。</Text>
          </div>
          <Space wrap>
            <Search
              allowClear
              value={draftKeyword}
              enterButton={<SearchOutlined />}
              placeholder="搜索仓库名称或描述"
              onChange={(event) => setDraftKeyword(event.target.value)}
              onSearch={applySearch}
              style={{ width: 280 }}
            />
            <Input
              allowClear
              value={province}
              placeholder="省份"
              style={{ width: 140 }}
              onChange={(event) => {
                const value = event.target.value
                setProvince(value)
                const next = new URLSearchParams(searchParams)
                if (value) {
                  next.set('province', value)
                } else {
                  next.delete('province')
                }
                if (keyword) {
                  next.set('keyword', keyword)
                }
                setSearchParams(next, { replace: true })
              }}
            />
            <Button
              onClick={() => {
                setKeyword('')
                setDraftKeyword('')
                setProvince('')
                setSearchParams(new URLSearchParams(), { replace: true })
              }}
            >
              重置
            </Button>
          </Space>
        </div>
        <Spin spinning={isLoading}>
          <Row gutter={[16, 16]} className="mt-6">
            {rows.map((item) => (
              <Col xs={24} md={12} xl={8} key={item.id}>
                <Link to={`/warehouses/${item.id}`} className="block h-full">
                  <Card className="h-full" hoverable>
                    <Space align="start">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <HomeOutlined />
                      </div>
                      <div>
                        <h3 className="m-0 text-lg font-semibold">{item.warehouse_name}</h3>
                        <Text type="secondary">{[item.province, item.city, item.district].filter(Boolean).join(' / ')}</Text>
                        <Paragraph className="mt-3 mb-2 text-gray-500">{item.description || item.address}</Paragraph>
                        <Space wrap>
                          <Tag color="blue">资源 #{item.id}</Tag>
                          <Tag color="blue">可用库容 {item.available_capacity || 0}</Tag>
                          <Tag>总库容 {item.capacity || 0}</Tag>
                          {item.price_rule && <Tag>{item.price_rule}</Tag>}
                          {item.service_types?.map((service) => <Tag key={service}>{service}</Tag>)}
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
          {!rows.length && !isLoading && <Empty className="mt-10" description="暂无仓储资源" />}
        </Spin>
      </div>
    </div>
  )
}
