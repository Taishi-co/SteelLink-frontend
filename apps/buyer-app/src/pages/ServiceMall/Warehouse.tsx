import { Card, Col, Empty, Row, Space, Spin, Tag, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Text, Paragraph } = Typography

export default function WarehouseMallPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-warehouse-services'],
    queryFn: () => serviceOfferService.listWarehouses({ page_size: 24 }),
  })
  const rows = data?.data.list ?? []
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <Title level={3}>仓储服务</Title>
        <Text type="secondary">查看平台已审核通过的仓储资源</Text>
        <Spin spinning={isLoading}>
          <Row gutter={[16, 16]} className="mt-6">
            {rows.map((item) => (
              <Col xs={24} md={12} xl={8} key={item.id}>
                <Card className="h-full">
                  <Space align="start">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <HomeOutlined />
                    </div>
                    <div>
                      <h3 className="m-0 text-lg font-semibold">{item.warehouse_name}</h3>
                      <Text type="secondary">{[item.province, item.city, item.district].filter(Boolean).join(' / ')}</Text>
                      <Paragraph className="mt-3 mb-2 text-gray-500">{item.description || item.address}</Paragraph>
                      <Space wrap>
                        <Tag color="blue">可用库容 {item.available_capacity || 0}</Tag>
                        {item.price_rule && <Tag>{item.price_rule}</Tag>}
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          {!rows.length && !isLoading && <Empty className="mt-10" description="暂无仓储资源" />}
        </Spin>
      </div>
    </div>
  )
}
