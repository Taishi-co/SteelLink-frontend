import { Card, Col, Empty, Row, Space, Spin, Tag, Typography } from 'antd'
import { TruckOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { serviceOfferService } from '@/services/serviceOfferService'

const { Title, Text, Paragraph } = Typography

export default function LogisticsMallPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-logistics-services'],
    queryFn: () => serviceOfferService.listLogistics({ page_size: 24 }),
  })
  const rows = data?.data.list ?? []
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <Title level={3}>物流服务</Title>
        <Text type="secondary">查看平台已审核通过的物流承运资源</Text>
        <Spin spinning={isLoading}>
          <Row gutter={[16, 16]} className="mt-6">
            {rows.map((item) => (
              <Col xs={24} md={12} xl={8} key={item.id}>
                <Card className="h-full">
                  <Space align="start">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TruckOutlined />
                    </div>
                    <div>
                      <h3 className="m-0 text-lg font-semibold">{item.name}</h3>
                      <Text type="secondary">{item.route_start} {'->'} {item.route_end}</Text>
                      <Paragraph className="mt-3 mb-2 text-gray-500">{item.description || item.service_scope}</Paragraph>
                      <Space wrap>
                        {item.vehicle_type && <Tag color="green">{item.vehicle_type}</Tag>}
                        <Tag>载重 {item.load_capacity || 0}</Tag>
                        {item.price_rule && <Tag>{item.price_rule}</Tag>}
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          {!rows.length && !isLoading && <Empty className="mt-10" description="暂无物流资源" />}
        </Spin>
      </div>
    </div>
  )
}
