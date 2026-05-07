import { useState } from 'react'
import { Button, Card, Col, Empty, Input, Row, Space, Spin, Tag, Typography } from 'antd'
import { SearchOutlined, TruckOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

export default function LogisticsMallPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [draftKeyword, setDraftKeyword] = useState(searchParams.get('keyword') ?? '')

  const { data, isLoading } = useQuery({
    queryKey: ['public-logistics-services', keyword],
    queryFn: () => serviceOfferService.listLogistics({
      page_size: 24,
      keyword: keyword || undefined,
    }),
  })
  const rows = data?.data.list ?? []

  const applySearch = (nextKeyword: string) => {
    setKeyword(nextKeyword)
    const next = new URLSearchParams()
    if (nextKeyword) {
      next.set('keyword', nextKeyword)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Title level={3} className="!mb-1">物流资源</Title>
            <Text type="secondary">展示平台已审核通过的物流承运资源，后续可用于买卖双方协同选车和运输履约。</Text>
          </div>
          <Space wrap>
            <Search
              allowClear
              value={draftKeyword}
              enterButton={<SearchOutlined />}
              placeholder="搜索物流服务或描述"
              onChange={(event) => setDraftKeyword(event.target.value)}
              onSearch={applySearch}
              style={{ width: 280 }}
            />
            <Button
              onClick={() => {
                setKeyword('')
                setDraftKeyword('')
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
                <Link to={`/logistics-services/${item.id}`} className="block h-full">
                  <Card className="h-full" hoverable>
                    <Space align="start">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TruckOutlined />
                      </div>
                      <div>
                        <h3 className="m-0 text-lg font-semibold">{item.name}</h3>
                        <Text type="secondary">{item.route_start} {'->'} {item.route_end}</Text>
                        <Paragraph className="mt-3 mb-2 text-gray-500">{item.description || item.service_scope}</Paragraph>
                        <Space wrap>
                          <Tag color="green">资源 #{item.id}</Tag>
                          {item.vehicle_type && <Tag color="green">{item.vehicle_type}</Tag>}
                          <Tag>载重 {item.load_capacity || 0}</Tag>
                          {item.price_rule && <Tag>{item.price_rule}</Tag>}
                          {item.service_scope && <Tag>{item.service_scope}</Tag>}
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
          {!rows.length && !isLoading && <Empty className="mt-10" description="暂无物流资源" />}
        </Spin>
      </div>
    </div>
  )
}
